pipeline {
  agent any
  environment {
     NODE = "docker run --rm -v $WORKSPACE:/app --workdir /app node:4"
  }
  stages {
    stage('Publish-test') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'S3_CI_BUILDS_AWS_KEYS', passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
          sh '''docker run --rm \
          -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
          -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
          -v $WORKSPACE:/app --workdir /app mrjgreen/docker-awscli s3 ls s3://sl-ci-builds-staging
          '''
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
  }
}
