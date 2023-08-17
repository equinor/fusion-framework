#!/bin/bash
while getopts R:B:F: flag
do
    case "${flag}" in
        R) REPO=${OPTARG};;
        B) BRANCH=${OPTARG};;
        F) FILTER=${OPTARG};;
    esac
done

gh extension install actions/gh-actions-cache

LIMIT=100
TOTAL=0
FAILED=0

set +e

echo "Repo: ${REPO:-[not provided, using current]}"
echo "Branch: ${BRANCH:-[no branch]}"
echo "Filter: ${FILTER:-[no filter]}"

function fetch_cache_records() {
  echo "Fetching list of cache keys..."
  CACHE_HITS=($(gh actions-cache list -R ${REPO:-''} -B ${BRANCH:-''} --key ${FILTER:-''} -L $LIMIT | cut -f 1))
  CACHE_HITS_COUNT=${#CACHE_HITS[@]}
}

fetch_cache_records

while [ $CACHE_HITS_COUNT -gt 0 ]; do
  echo "Deleting $CACHE_HITS_COUNT items"
  for cacheKey in "${CACHE_HITS[@]}"; do
    gh actions-cache delete $cacheKey -R ${REPO:-''} -B ${BRANCH:-''} --confirm
    if [ $? -eq 0 ]; then 
      ((TOTAL++))
    else 
      ((FAILED++))
    fi
  done
  if [[ "$CACHE_HITS_COUNT" == "$LIMIT" ]]; then
    echo "Processed $TOTAL/$TOTAL, checking for more"
    fetch_cache_records
  else
    CACHE_HITS_COUNT=0
  fi
done

echo "Done, deleted $TOTAL cache records, $FAILED failed"