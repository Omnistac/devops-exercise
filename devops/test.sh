#!/bin/bash

# list all packages in our repository

function green_echo() {
    echo -e "\033[32m$1\033[0m"
}

function red_echo() {
    echo -e "\033[31m$1\033[0m"
}

pnpm_packages=$(pnpm ls --json -r --depth=-1 | jq -r '.[].name')

green_echo "Running tests for all packages"

# build each package, required for testing
for package in $pnpm_packages; do
    green_echo "Building $package"
    pnpm --filter $package build
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        red_echo "Build failed for $package"
        exit 1
    fi
done

# run tests for each package
for package in $pnpm_packages; do
    green_echo "Running tests for $package"
    pnpm --filter $package test
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        red_echo "Tests failed for $package"
        exit 1
    fi
done
