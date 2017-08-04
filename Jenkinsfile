pipeline {
  agent any
  environment {
     NODE = "docker run --rm -v $WORKSPACE:/app --workdir /app node:4"
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
        sh '$NODE /bin/bash -c "npm install --quiet -g grunt && grunt compile:app"'
      }
    }
    stage('Test') {
      steps {
        sh '$NODE /bin/bash -c "npm install --quiet -g grunt && grunt test:unit"'
      }
    }
    stage('Package') {
      steps {
        sh 'tar -cvf build.tar.gz --exclude=build.tar.gz --exclude-vcs .'
      }
    }
    stage('Publish-test') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'S3_CI_BUILDS_AWS_KEYS', passwordVariable: 'AWS_SECRET', usernameVariable: 'AWS_ID')]) {
          sh '''docker run --rm \
          -e AWS_ACCESS_KEY_ID=$AWS_ID \
          -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET \
          -v $WORKSPACE:/app --workdir /app mrjgreen/docker-awscli s3 cp build.tar.gz s3://sl-ci-builds-staging/${JOB_NAME}/${BRANCH_NAME}/${BUILD_NUMBER}
          '''
        }
      }
    }
  }
}
