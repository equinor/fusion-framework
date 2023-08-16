#!/bin/bash +ex
ALL_LOG_FILES=($(find . -name "turbo-build.log"))
# ALL_LOG_FILES=($(find packages/framework -name "turbo-build.log"))
echo "" > ./tsc-turbo.log
for FILE_NAME in ${ALL_LOG_FILES[@]}; do
  LINES=$(cat $FILE_NAME | grep -E '.*(ts|tsx)\(\d+,\d+\):')
  [[ -z "$LINES" ]] && continue
  echo "$FILE_NAME"
  FILE_BASE_PATH=${FILE_NAME%.turbo/turbo-build.log}  #$(echo $FILE_NAME | sed 's/\.turbo\/.*\.log//')
  echo $FILE_BASE_PATH
  echo $LINES | while read LINE; do
    LOG_FILE_NAME=${LINE%(*}
    ABSOLUTE_FILE_NAME=$(realpath "$FILE_BASE_PATH$LOG_FILE_NAME")
    RELATIVE_FILE_NAME=${ABSOLUTE_FILE_NAME##$(pwd)/}
    FIXED_LINE=${LINE/$LOG_FILE_NAME/$RELATIVE_FILE_NAME}
    echo $LOG_FILE_NAME
    echo $RELATIVE_FILE_NAME
    echo $LINE
    echo $FIXED_LINE
    echo ${LINE/$LOG_FILE_NAME/$RELATIVE_FILE_NAME} >> ./tsc-turbo.log
  done
  echo ""
  echo ""
done
