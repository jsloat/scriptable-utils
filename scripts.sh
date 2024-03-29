#!/usr/bin/env bash

lint() {
  eslint "./src/**/*.{ts,js}" --fix
}

lint_compact() {
  eslint "./src/**/*.{ts,js}" -f visualstudio
}

circDeps() {
  madge ./src/index.ts --circular --extensions ts
}

test() {
  clear
  echo "Linting..."
  if ! lint; then
    echo "Lint failed"
    return 1
  fi
  echo "Running tsc..."
  if ! tsc; then
    echo "tsc failed"
    return 1
  fi
  echo "Checking for circular deps..."
  if ! circDeps; then
    echo "Circular dependencies failed"
    return 1
  fi
  return 0
}
