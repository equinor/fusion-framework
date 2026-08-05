#!/bin/sh
# couchdb-manage.sh
# Usage: sh couchdb-manage.sh <command> [container_name]
# Commands: start, stop, clean, logs

COMMAND="$1"
CONTAINER_NAME="${2:-couchdb_state_replication}"
VOLUME_NAME="${CONTAINER_NAME}_data"

case "$COMMAND" in
  start)
    if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
      if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        echo "CouchDB container '$CONTAINER_NAME' is already running."
      else
        echo "Starting existing CouchDB container '$CONTAINER_NAME'..."
        docker start $CONTAINER_NAME
      fi
    else
      echo "Creating and starting new CouchDB container '$CONTAINER_NAME'..."
      docker run -d \
        -e COUCHDB_USER=admin \
        -e COUCHDB_PASSWORD=admin \
        -v ${VOLUME_NAME}:/opt/couchdb/data \
        -p 5984:5984 \
        --name $CONTAINER_NAME \
        apache/couchdb:latest

      # Wait for CouchDB to be ready
      until curl -s http://admin:admin@localhost:5984/; do
        echo "Waiting for CouchDB..."
        sleep 1
      done

      {
        # Set CORS configuration
        curl -X PUT http://admin:admin@localhost:5984/_node/_local/_config/httpd/enable_cors -d '"true"'
        curl -X PUT http://admin:admin@localhost:5984/_node/_local/_config/cors/origins -d '"*"'
        curl -X PUT http://admin:admin@localhost:5984/_node/_local/_config/cors/credentials -d '"true"'
        curl -X PUT http://admin:admin@localhost:5984/_node/_local/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'
        curl -X PUT http://admin:admin@localhost:5984/_node/_local/_config/cors/headers -d '"accept, authorization, content-type, origin, referer"'
      } > /dev/null 2>&1
    fi
    ;;
  stop)
    echo "Stopping and removing container '$CONTAINER_NAME'..."
    docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME
    ;;
  clean)
    echo "Stopping, removing container and volume for '$CONTAINER_NAME'..."
    docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME && docker volume rm $VOLUME_NAME
    ;;
  logs)
    echo "Showing logs for container '$CONTAINER_NAME'..."
    docker logs -f $CONTAINER_NAME
    ;;
  *)
    echo "Usage: sh $0 {start|stop|clean|logs} [container_name]"
    exit 1
    ;;
esac
