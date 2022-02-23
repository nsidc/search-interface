#!/bin/sh
#
VERSION=`node -p "require('./package.json').version"`
DATE_STR="$(date +%F)"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [[ ! ${npm_config_git_tag_version+tag} ]]; then
   echo "Tagging $CURRENT_BRANCH with version $VERSION ($DATE_STR)\n"
fi

# Update CHANGELOG.md with current version and date if this is not a release
# candidate version bump.
if [[ ! $VERSION =~ - ]]; then
  echo "Updating CHANGELOG with version number and date: $VERSION ($DATE_STR)"
  sed -i '' "s/^## Unreleased$/## v$VERSION ($DATE_STR)/" CHANGELOG.md
  git add CHANGELOG.md
fi

git add package.json
git add package-lock.json
