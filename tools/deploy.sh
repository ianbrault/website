#!/usr/bin/env bash
# tools/deploy.sh

sudo apt update
sudo apt upgrade -y
sudo apt install podman-docker -y

docker compose up -d
