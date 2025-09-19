#!/bin/bash
# deploy.sh

DOMAIN_NAME="test.brault.dev"
IMAGE_NAME="website"
EMAIL="ian@brault.dev"
SWAP_SIZE="1G"

# Update package list and upgrade existing packages
sudo apt update && sudo apt upgrade -y

# Add swap space
if [ ! -f /swapfile ]; then
    echo "Adding swap space..."
    sudo fallocate -l $SWAP_SIZE /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Install and configure Docker
if ! docker -v; then
    sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    apt-cache policy docker-ce
    sudo apt install docker-ce -y
fi

# Install Nginx, removing any old configuration files
sudo apt install nginx -y
sudo rm -f "/etc/nginx/sites-available/$DOMAIN_NAME"
sudo rm -f "/etc/nginx/sites-enabled/$DOMAIN_NAME"

# Stop Nginx temporarily to allow Certbot to run in standalone mode
sudo systemctl stop nginx

# Create Nginx config with reverse proxy, SSL support, rate limiting, and streaming support
sudo cat > /etc/nginx/sites-available/$DOMAIN_NAME <<EOL
limit_req_zone \$binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    listen 80;
    server_name $DOMAIN_NAME;
    # Redirect all HTTP requests to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN_NAME;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Enable rate limiting
    limit_req zone=mylimit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        # Disable buffering for streaming support
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;
    }
}
EOL
sudo ln -s "/etc/nginx/sites-available/$DOMAIN_NAME" "/etc/nginx/sites-enabled/$DOMAIN_NAME"

# Obtain SSL certificate using Certbot standalone mode
sudo apt install certbot python3-certbot-nginx -y
if [ ! -f /etc/letsencrypt/live/test.brault.dev/fullchain.pem ] || [ ! -f /etc/letsencrypt/live/test.brault.dev/privkey.pem ]; then
    sudo certbot certonly --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME" --non-interactive --agree-tos -m "$EMAIL"
fi
# Ensure SSL files exist or generate them
if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
    sudo wget https://raw.githubusercontent.com/certbot/certbot/refs/heads/main/certbot-nginx/src/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -P /etc/letsencrypt/
fi
if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
    sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
fi

# Restart Nginx to apply the new configuration
sudo systemctl restart nginx

# Build and run the Docker containers from the app directory
sudo docker build --tag "$IMAGE_NAME" . && sudo docker run --detach -p 3000:3000 "$IMAGE_NAME"
if ! sudo docker ps | grep "$IMAGE_NAME"; then
    echo "Docker container failed to start."
    exit 1
fi

# Set up automatic SSL certificate renewal
( crontab -l 2>/dev/null; echo "0 */12 * * * certbot renew --quiet && systemctl reload nginx" ) | crontab -

echo "Deployment complete."
