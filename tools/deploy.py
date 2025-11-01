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


class PlatformError(Exception):
    def __init__(self):
        super().__init__(f"Unsupported platform: {sys.platform}")


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


def package_manager_update():
    if sys.platform == "linux":
        shell("apt update", sudo=True)
    elif sys.platform == "darwin":
        shell("brew update")
    else:
        raise PlatformError()


def package_manager_upgrade():
    if sys.platform == "linux":
        shell("apt upgrade", sudo=True)
    elif sys.platform == "darwin":
        shell("brew upgrade")
    else:
        raise PlatformError()


def package_manager_install(*args):
    package_list = " ".join(args)
    if sys.platform == "linux":
        shell(f"apt install {package_list} -y", sudo=True)
    elif sys.platform == "darwin":
        shell(f"brew install {package_list}")
    else:
        raise PlatformError()


def package_manager_add_gpg(url: str, path: str):
    if sys.platform == "linux" or sys.platform == "darwin":
        proc = shell(f"curl -fsSL {url}", capture_output=True)
        shell(f"gpg --dearmor -o {path}", sudo=True, input=proc.stdout)
    else:
        raise PlatformError()


def configure_swap_space(filepath: str, size: str):
    path = pathlib.Path(filepath)
    if not path.exists():
        shell(f"fallocate -l {size} {path}", sudo=True)
        shell(f"chmod 600 {path}", sudo=True)
        shell(f"mkswap {path}", sudo=True)
        shell(f"swapon {path}", sudo=True)
        write_to_file("/etc/fstab", f"{path} none swap sw 0 0\n", mode="a")


def install_docker():
    if sys.platform == "linux":
        package_manager_install(
            "apt-transport-https", "ca-certificates", "curl", "software-properties-common"
        )
        package_manager_add_gpg(
            "https://download.docker.com/linux/ubuntu/gpg",
            "/usr/share/keyrings/docker-archive-keyring.gpg"
        )
        dpkg_arch = shell_output("dpkg --print-architecture")
        lsb_release = shell_output("lsb_release -cs")
        write_to_file(
            "/etc/apt/sources.list.d/docker.list",
            f"deb [arch={dpkg_arch} signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] "
            f"https://download.docker.com/linux/ubuntu {lsb_release} stable",
            mode="a",
        )
        package_manager_update()
        shell("apt-cache policy docker-ce")
        package_manager_install("docker-ce", "docker-compose")
    elif sys.platform == "darwin":
        package_manager_install("docker")
    else:
        raise PlatformError()


def install_mongodb_tools():
    if sys.platform == "linux":
        package_manager_install("gnupg", "curl")
        package_manager_add_gpg(
            "https://pgp.mongodb.com/server-7.0.asc",
            "/usr/share/keyrings/mongodb-server-7.0.gpg",
        )
        package_manager_update()
        package_manager_install("mongodb-org-tools")
    elif sys.platform == "darwin":
        package_manager_install("mongodb-database-tools")
    else:
        raise PlatformError()


def configure_nginx():
    package_manager_install("nginx")
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
    package_manager_install("certbot", "python3-certbot-nginx")
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
    package_manager_update()
    package_manager_upgrade()
    # Configure swap space (Linux droplet)
    if sys.platform == "linux":
        configure_swap_space("/swapfile", "1G")
    # Install Docker
    if not shell_checked("docker -v"):
        install_docker()
    # Install MongoDB tools
    install_mongodb_tools()
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
