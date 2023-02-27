#!/usr/bin/env bash

lint() {
  eslint "./src/**/*.{ts,js}" --fix
}

tests() {
  clear
  if ! lint; then return; fi
  tsc
}
