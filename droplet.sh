#!/bin/bash

USER=ian
IPADDR=138.68.3.149

ARGS=("$@")
N_ARG=1

if [[ $# -gt 0 ]]; then
    if [[ ${ARGS[0]} = "scp" ]]; then
        while [[ $N_ARG -lt $# ]]; do
            scp ${ARGS[$N_ARG]} $USER@$IPADDR:~/website/${ARGS[$N_ARG]}
            let N_ARG=N_ARG+1
        done
    fi
else
    ssh $USER@$IPADDR:~/website
fi
