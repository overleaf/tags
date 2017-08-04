pipeline {
  agent any
  environment {
     NODE = "docker run --rm -v $WORKSPACE:/app --workdir /app node:4"
     AWS = "docker run --rm -v $WORKSPACE:/app --workdir /app mrjgreen/docker-aws aws"
  }
  stages {
    stage('Install') {
      steps {
        sh '$NODE npm install'
        sh '$NODE npm rebuild'
      }
    }
    stage('Compile') {
      steps {
        sh '$NODE /bin/bash -c "npm install -g grunt && grunt compile:app"'
      }
    }
    stage('Test') {
      steps {
        sh '$NODE /bin/bash -c "npm install -g grunt && grunt test:unit"'
      }
    }
    stage('Package') {
      steps {
        sh 'tar -cvf build.tar.gz --exclude=build.tar.gz --exclude-vcs .'
      }
    }
    stage('Publish') {
      steps {
        sh '$AWS help'
      }
    }
  }
}
