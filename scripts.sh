#!/usr/bin/env bash

lint() {
  eslint "./**/*.{ts,js}" --fix
}

tests() {
  clear
  if ! lint; then return; fi
  tsc
}
