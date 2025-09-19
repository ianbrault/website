# Personal Webserver

> [!WARNING]
> FIXME: needs to be re-written

## Installation

Set up the server repository.

```bash
# Clone the server repository
$ git clone https://github.com/ianbrault/website
# Install packages and set up virtual environment
$ yarn install
$ source scripts/venv.sh
```

On the server DigitalOcean droplet, set up supporting services.

```bash
# SSH into the droplet
$ yarn run droplet
# Check the status of the MongoDB service
$ systemctl status mongod
# If it is not "active (running)" start the service
$ sudo systemctl start mongod.service
# Check the status of the nginx service
$ systemctl status nginx
# If it is not "active (running)" start the service
$ sudo systemctl start nginx
```

## Usage

Starting the server:

```bash
# Start the primary server
$ ./scripts/start.sh
# Start the nightly server.
# Run this from the `nightly` branch of the repository; it will open a separate
# webserver which nginx forwards to from ".../nightly/"
$ git checkout nightly && git pull
$ ./scripts/start.sh nightly
```

Check for running server processes:

```bash
$ ./scripts/ps.sh
ian      3263104  0.0  0.0   2896   896 ?        S    03:55   0:00 /bin/sh -c node --import=tsx main.ts --nightly
ian      3263105  0.0  6.3 54220216 61844 ?      Sl   03:55   0:06 /usr/local/bin/node --import=tsx main.ts --nightly
ian      3263518  0.0  0.0   2892   888 ?        S    04:02   0:00 /bin/sh -c node --import=tsx main.ts
ian      3263519  0.1  6.6 54221720 64736 ?      Sl   04:02   0:09 /usr/local/bin/node --import=tsx main.ts
```

Shutdown any running servers:

```bash
$ ./scripts/kill.sh
```
