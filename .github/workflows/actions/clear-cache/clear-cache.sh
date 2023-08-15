#!/bin/bash
while getopts r:b: flag
do
    case "${flag}" in
        r) REPO=${OPTARG};;
        b) BRANCH=${OPTARG};;
    esac
done

gh extension install actions/gh-actions-cache

set +e

echo "$BRANCH"
echo "$REPO"
echo "Deleting caches for $REPO on barch $BRANCH"

LIMIT=100

function fetch_cache_records() {
  echo "Fetching list of cache keys..."
  CACHE_HITS=($(gh actions-cache list -R $REPO -B $BRANCH -L $LIMIT | cut -f 1))
  CACHE_HITS_COUNT=${#CACHE_HITS[@]}
}

fetch_cache_records

while [ $CACHE_HITS_COUNT -gt 0 ]
  do
    echo "Deleting $CACHE_HITS_COUNT items"
    for cacheKey in "${CACHE_HITS[@]}"
      do
        gh actions-cache delete $cacheKey -R $REPO -B $BRANCH --confirm
      done

    if [[ "$CACHE_HITS_COUNT" == "$LIMIT" ]]; then
      echo "Processed $LIMIT/$LIMIT, checking for more"
      fetch_cache_records
    else
      CACHE_HITS_COUNT=0
    fi
  done

echo "Done"