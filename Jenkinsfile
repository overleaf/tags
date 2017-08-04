pipeline {
  agent any
  environment {
     NODE = "docker run --rm -v $WORKSPACE:/app --workdir /app node:4"
  }
  stages {
    stage('Install') {
      steps {
        echo "JOB_BASE_NAME: ${JOB_BASE_NAME}"
        echo "BRANCH_NAME: ${BRANCH_NAME}"
        echo "BUILD_NUMBER: ${BUILD_NUMBER}"
        sh 'export'
      }
    }
  }
}
