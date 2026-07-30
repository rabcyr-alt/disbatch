#!/bin/sh
# Build the Angular SPA and sync the production output into etc/disbatch/htdocs/
# (the Disbatch web_root), so the existing catch-all static route serves it.
#
# Node.js + npm are required only on the developer machine. RPM builds use the
# committed htdocs/ directly (see PLAN.md §6.3).
set -e

cd "$(dirname "$0")/.."

npm ci
npx ng build --configuration production

# The @angular/build:application builder emits browser assets under dist/<app>/browser/.
rm -rf ../etc/disbatch/htdocs
mkdir -p ../etc/disbatch/htdocs
cp -a dist/web/browser/. ../etc/disbatch/htdocs/

echo "SPA built and synced into etc/disbatch/htdocs/"
