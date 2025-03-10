#! /bin/bash


echo "Publishing $1"

# Note that in order to docker:push a service we need to have built the `dist` folder first

pnpm_packages=$(pnpm ls --json -r --depth=-1 | jq -r '.[].name')

for package in $pnpm_packages; do
    echo "Publishing $package"
    pnpm run docker:push --filter $package
done
