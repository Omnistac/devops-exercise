#!/bin/bash

function green_echo() {
    echo -e "\033[32m$1\033[0m"
}

function red_echo() {
    echo -e "\033[31m$1\033[0m"
}

green_echo "Running maintenance"

pnpm -F maintenance run maintenance

green_echo "Beginning deployment of the monorepo"

pnpm -F user-service run deploy

green_echo "User service deployed"

pnpm -F trading-service run deploy

green_echo "Trading service deployed"

green_echo "All services deployed"
