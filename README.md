# Personal Webserver

## Install dependencies

### MongoDB

#### Linux

```
sudo apt install gnupg curl
curl -fsSL https://pgp.mongodb.com/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt update
sudo apt install -y mongodb-org
```

#### Mac

```
brew tap mongodb/brew
brew trust mongodb/brew
brew update
brew install mongodb-community@8.0
```

### Python dependencies

```
python3 -m venv .venv
source .venv/bin/activate
pip3 install -e .
```

## Usage

Ensure that Python dependencies have been installed (see [Python dependencies](#python-dependencies)).

Start the website and all services:

```
website-start
```
