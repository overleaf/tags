pipeline {
  agent any
  environment {
     NODE = "docker run --rm -v $WORKSPACE:/app --workdir /app node:4"
     AWS = "docker run --rm -v $WORKSPACE:/app --workdir /app mrjgreen/docker-awscli"
  }
  stages {
    stage('Publish-test') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'S3_CI_BUILDS_AWS_KEYS', passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {     
            echo "$S3_CI_BUILDS_AWS_KEYS"
            echo "$AWS_SECRET_ACCESS_KEY"
            sh '$AWS help'
        }
      }
    }
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
      withCredentials([usernamePassword(credentialsId: 'S3_CI_BUILDS_AWS_KEYS', passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
          steps {
            echo "$S3_CI_BUILDS_AWS_KEYS"
            echo "$AWS_SECRET_ACCESS_KEY"
            sh '$AWS help'
          }
      }
    }
  }
}
