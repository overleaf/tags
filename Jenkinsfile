pipeline {
  agent any
  environment {
     NODE = "docker run --rm -v $WORKSPACE:/app --workdir /app node:4"
     AWS = "docker run --rm -v $WORKSPACE:/app --workdir /app mrjgreen/docker-awscli"
  }
  stages {
    stage('Publish-test') {
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
