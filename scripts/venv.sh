#!/usr/bin/env bash
# venv.sh
# Activate the Python virtual environment, creating if it does not already exist

abspath=$(realpath $0)
scriptspath=$(dirname $abspath)

venvpath="$scriptspath/.venv"
if [[ ! -d $venvpath ]]; then
    mkdir $venvpath
    python3 -m venv $venvpath
    source $venvpath/bin/activate
    python3 -m pip install -r "$scriptspath/requirements.txt"
else
    source $venvpath/bin/activate
fi
