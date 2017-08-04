pipeline {
  agent any
  stages {
    stage('Install') {
      steps {
        sh '''NPM="docker run --rm -v $(shell pwd):/app --workdir /app node:4 npm"

$NPM install

$NPM rebuild

$NPM grunt compile:app'''
      }
    }
  }
}