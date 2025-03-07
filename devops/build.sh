#!/bin/bash

# list all packages in our repository

function green_echo() {
    echo -e "\033[32m$1\033[0m"
}

function red_echo() {
    echo -e "\033[31m$1\033[0m"
}

pnpm_packages=$(pnpm ls --json -r --depth=-1 | jq -r '.[].name')

green_echo "Building all packages"

for package in $pnpm_packages; do
    green_echo "Building $package"
    result=$(pnpm --filter $package build)
    if [ $? -ne 0 ]; then
        red_echo "Build failed for $package"
        red_echo "$result"
        exit 1
    fi
done

green_echo "Build completed successfully"
