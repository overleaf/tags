def NODE = "docker run --rm -v `pwd`:/app --workdir /app node:4"

pipeline {
  agent any
  stages {
    stage('Install') {
      steps {
        sh '''${NODE} npm install'''
        sh '''${NODE} npm rebuild'''
      }
    }
    stage('Compile') {
      steps {
        sh '''${NODE} /bin/bash -c "npm install -g grunt && grunt compile:app"'''
      }
    }
    stage('Test') {
      steps {
        sh '''${NODE} /bin/bash -c "npm install -g grunt && grunt test:unit"'''
      }
    }
  }
}
