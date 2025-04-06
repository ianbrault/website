#!/usr/bin/env bash
# kill.sh
# Shutdown script for webserver

# find running server processes and then kill them
matches=$(ps aux | grep $USER | grep main.ts | grep -v grep | awk '{print $2}')
if [[ ! -z $matches ]]; then
    kill $matches
fi
