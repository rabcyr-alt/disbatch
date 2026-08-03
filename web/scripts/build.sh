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

TARGET=../etc/disbatch/htdocs
# keep legacy css/, images/, and javascripts/ in ../etc/disbatch/htdocs/
find $TARGET/ ! -path $TARGET/ ! -path $TARGET/css ! -path $TARGET/css/\* ! -path $TARGET/images ! -path $TARGET/images/\* \
 ! -path $TARGET/javascripts ! -path $TARGET/javascripts/\* -delete
# The @angular/build:application builder emits browser assets under dist/<app>/browser/.
cp -a dist/web/browser/. $TARGET/
# 3rdpartylicenses.txt is emitted alongside browser/, not inside it.
[ -f dist/web/3rdpartylicenses.txt ] && cp -a dist/web/3rdpartylicenses.txt $TARGET/

echo "SPA built and synced into etc/disbatch/htdocs/"
