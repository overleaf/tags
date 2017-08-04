pipeline {
  agent any
  stages {
    stage('Install') {
      steps {
        sh '''NODE="docker run --rm -v `pwd`:/app --workdir /app node:4"

$NODE npm install

$NODE npm rebuild

$NODE /bin/bash -c "npm install -g grunt && grunt compile:app"'''
      }
    }
  }
}