#!/bin/sh -ex

docker build -t $1 -f Dockerfile "./$1"
docker run -ti -p 3000:3000 -p 24678:24678 -v "$PWD/$1/src":/app/src $1
