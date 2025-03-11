#! /bin/bash

########################################################
#
# ACME Corp CI/CD Pipeline
# Accepts two arguments:
# 1. The type of pipeline to run (ci or cd)
#
########################################################

# Exit immediately if a command exits with a non-zero status
set -e

echo "Running the ACME Corp CI/CD Pipeline"

# pass in whether this is a CI or CD run

if [ "$1" = "ci" ]; then
    echo "Running CI pipeline"
elif [ "$1" = "cd" ]; then
    echo "Running CD pipeline"
else
    echo "Invalid pipeline type"
    exit 1
fi

# run the build

./devops/build.sh 

# run the tests

./devops/test.sh

# if CI - run the deploy

if [ "$1" = "cd" ]; then
    ./devops/publish.sh $VERSION
    ./devops/deploy.sh $VERSION
fi