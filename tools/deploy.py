#!/usr/bin/env python3
# tools/deploy.py

import argparse
import pathlib
import signal
import subprocess
import sys
import typing

cwd = pathlib.Path(__file__).parent.resolve()
domain = "test.brault.dev"
email = "ian@brault.dev"

signal.signal(signal.SIGINT, lambda *args: sys.exit(1))

# Nginx config with reverse proxy, SSL support, rate limiting, and streaming support
nginx_configuration = f"""\
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

server {{
    listen 80;
    server_name {domain};
    # Redirect all HTTP requests to HTTPS
    return 301 https://$host$request_uri;
}}

server {{
    listen 443 ssl;
    server_name {domain};

    ssl_certificate /etc/letsencrypt/live/{domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{domain}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Enable rate limiting
    limit_req zone=mylimit burst=20 nodelay;

    location / {{
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        # Disable buffering for streaming support
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;
    }}

    location /basil/socket/ {{
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
    }}
}}
"""


parser = argparse.ArgumentParser(description="Deploy script")
parser.add_argument(
    "-m", "--mode",
    choices=["development", "production"],
    default="production",
    help="Deployment mode [%(default)s]"
)
parser.add_argument(
    "-d", "--development",
    action="store_true",
    help="Alias for --mode=development"
)
args = parser.parse_args(sys.argv[1:])
if args.development:
    args.mode = "development"


def file_exists(path: str) -> bool:
    return pathlib.Path(path).exists()


def write_to_file(path: str, contents: str, mode="w"):
    with pathlib.Path(path).open(mode) as f:
        f.write(contents)


def shell(
    command: str,
    sudo: bool = False,
    check: bool = True,
    capture_output: bool = False,
    input: typing.Optional[str] = None,
) -> subprocess.CompletedProcess:
    command_args = command.split(" ")
    if sudo:
        command_args.insert(0, "sudo")
    return subprocess.run(command_args, check=check, capture_output=capture_output, input=input)


def shell_checked(command: str) -> bool:
    proc = shell(command, check=False)
    return proc.returncode == 0


def shell_output(command: str) -> str:
    proc = shell(command, capture_output=True)
    return proc.stdout.decode()


def install_packages(*args):
    package_list = " ".join(args)
    if sys.platform == "linux":
        shell(f"apt install {package_list} -y", sudo=True)
    elif sys.platform == "darwin":
        shell(f"brew install {package_list}")
    else:
        raise NotImplementedError(f"unsupported platform: {sys.platform}")


def upgrade_packages():
    if sys.platform == "linux":
        shell("apt update", sudo=True)
        shell("apt upgrade -y", sudo=True)
    elif sys.platform == "darwin":
        shell("brew update")
        shell("brew upgrade")
    else:
        raise NotImplementedError(f"unsupported platform: {sys.platform}")


def configure_swap_space(size: str):
    shell(f"fallocate -l {size} /swapfile", sudo=True)
    shell("chmod 600 /swapfile", sudo=True)
    shell("mkswap /swapfile", sudo=True)
    shell("swapon /swapfile", sudo=True)
    write_to_file("/etc/fstab", "/swapfile none swap sw 0 0\n", mode="a")


def install_docker():
    if sys.platform == "linux":
        install_packages(
            "apt-transport-https", "ca-certificates", "curl", "software-properties-common"
        )
        gpg_key = shell_output("curl -fsSL https://download.docker.com/linux/ubuntu/gpg")
        shell(
            "gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg",
            sudo=True, input=gpg_key,
        )
        dpkg_arch = shell_output("dpkg --print-architecture")
        lsb_release = shell_output("lsb_release -cs")
        write_to_file(
            "/etc/apt/sources.list.d/docker.list",
            f"deb [arch={dpkg_arch} signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] "
            f"https://download.docker.com/linux/ubuntu {lsb_release} stable",
            mode="a",
        )
        shell("apt update", sudo=True)
        shell("apt-cache policy docker-ce")
        install_packages("docker-ce")
    elif sys.platform == "darwin":
        install_packages("docker")
    else:
        raise NotImplementedError(f"unsupported platform: {sys.platform}")


def configure_nginx():
    install_packages("nginx")
    # Remove old configuration files
    shell(f"rm -f /etc/nginx/sites-available/{domain}", sudo=True)
    shell(f"rm -f /etc/nginx/sites-enabled/{domain}", sudo=True)
    # Stop Nginx temporarily to allow Certbot to run in standalone mode
    shell("systemctl stop nginx", sudo=True)
    # Create and link configuration files
    write_to_file(f"/etc/nginx/sites-available/{domain}", nginx_configuration)
    shell(
        f"ln -s /etc/nginx/sites-available/{domain} /etc/nginx/sites-enabled/{domain}",
        sudo=True
    )
    # Obtain SSL certificate using Certbot standalone mode
    install_packages("certbot", "python3-certbot-nginx")
    if (
        not file_exists(f"/etc/letsencrypt/live/{domain}/fullchain.pem") or
        not file_exists(f"/etc/letsencrypt/live/{domain}/privkey.pem")
    ):
        shell(
            f"certbot certonly --nginx -d {domain} -d www.{domain} --non-interactive --agree-tos "
            f"-m {email}",
            sudo=True
        )
    # Ensure SSL files exist or generate them
    if not file_exists("/etc/letsencrypt/options-ssl-nginx.conf"):
        shell(
            "wget https://raw.githubusercontent.com/certbot/certbot/refs/heads/main/certbot-nginx/"
            "src/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -P /etc/letsencrypt/",
            sudo=True
        )
    if not file_exists("/etc/letsencrypt/ssl-dhparams.pem"):
        shell("openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048", sudo=True)
    # Restart Nginx to apply the new configuration
    shell("systemctl restart nginx", sudo=True)


def run():
    # Update package list and upgrade existing packages (production)
    if args.mode == "production":
        upgrade_packages()
    # Configure swap space (Linux droplet)
    if sys.platform == "linux":
        configure_swap_space("1G")
    # Ensure that Docker is installed
    if not shell_checked("docker -v"):
        install_docker()
    # Configure nginx (production, Linux droplet)
    if args.mode == "production" and sys.platform == "linux":
        configure_nginx()
    # Start the container images
    shell("docker-compose up")


if __name__ == "__main__":
    try:
        run()
    except subprocess.CalledProcessError:
        sys.exit("\nDeployment step failure, terminating")
    print("Deployment complete")
