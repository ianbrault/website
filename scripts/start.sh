#!/usr/bin/env bash
# start.sh
# Startup script for webserver

args=("$@")
logdir="$HOME/.local"

if [[ $# -gt 0 && $1 == "nightly" ]]; then
    # start the nightly server
    yarn run server --nightly > $logdir/nightly.stdout 2> $logdir/nightly.stderr &
else
    # start the main server
    yarn run server > $logdir/server.stdout 2> $logdir/server.stderr &
fi
