pipeline {
  
  agent any
  
  environment {
     NODE = "docker run --rm -v /var/lib/jenkins/.npm:/root/.npm -v $WORKSPACE:/app --workdir /app node:4"
  }
 
  stages {
    stage('Test') {
      steps {
        sh 'export'
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
        sh 'tar -czf build.tar.gz --exclude=build.tar.gz --exclude-vcs .'
      }
    }
    stage('Publish') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'S3_CI_BUILDS_AWS_KEYS', passwordVariable: 'AWS_SECRET', usernameVariable: 'AWS_ID')]) {
          sh '''docker run --rm \
          -e AWS_ACCESS_KEY_ID=$AWS_ID \
          -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET \
          -v $WORKSPACE:/app --workdir /app mrjgreen/docker-awscli s3 cp build.tar.gz s3://sl-ci-builds-staging/${JOB_NAME}/${BUILD_NUMBER}.tar.gz
          '''
        }
      }
    }
  }
  
  post {

    success {
      mail(from: "team@sharelatex.com", 
           to: "joe@sharelatex.com", 
           subject: "Jenkins build ${JOB_NAME}:${BUILD_NUMBER} passed.",
           body: "Build: ${BUILD_URL}")
    }

    failure {
      mail(from: "team@sharelatex.com", 
           to: "joe@sharelatex.com", 
           subject: "Jenkins build ${JOB_NAME}:${BUILD_NUMBER} failed.",
           body: "Build: ${BUILD_URL}")
    }
  }
  
  // The options directive is for configuration that applies to the whole job.
  options {
    // we'd like to make sure remove old builds, so we don't fill up our storage!
    buildDiscarder(logRotator(numToKeepStr:'50'))
    
    // And we'd really like to be sure that this build doesn't hang forever, so let's time it out after:
    timeout(time: 30, unit: 'MINUTES')
  }
}
