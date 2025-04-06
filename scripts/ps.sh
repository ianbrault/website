#!/usr/bin/env bash
# ps.sh
# List processes for running webservers

ps aux | grep $USER | grep main.ts | grep -v grep