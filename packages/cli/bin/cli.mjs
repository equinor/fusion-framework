#!/usr/bin/env node
function start() {
  return import('../dist/scripts/main.js');
}
start();