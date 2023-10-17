#!/bin/sh

# Update CHANGELOG.md with current version and date if this is not a release
# candidate version bump.
if [ -n $VERSION ]; then
  echo "Updating CHANGELOG with version number and date: $VERSION ($DATE_STR)"
  sed -i '' "s/^## Unreleased$/## v$VERSION ($DATE_STR)/" CHANGELOG.md
  git add CHANGELOG.md
fi

git add package.json
git add package-lock.json
