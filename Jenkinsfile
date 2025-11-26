// Jenkinsfile (declarative)
pipeline {
  agent {
    // run inside a docker container that has node & docker (if docker build needed)
    docker {
      image 'node:18'
      args '--network host' // optional, remove if not needed
    }
  }

  environment {
    // set these in Jenkins credentials / job config for security
    DOCKERHUB_CREDS = credentials('dockerhub-creds')  // username:password (optional)
    GIT_COMMIT_SHORT = "${env.GIT_COMMIT?.take(8)}"
    IMAGE_NAME = "mayanbrahmam/prepai-backend"
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timestamps()
    ansiColor('xterm')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script { echo "Checked out ${env.GIT_COMMIT}" }
      }
    }

    stage('Install') {
      steps {
        sh 'node --version || true'
        sh 'npm ci'                 // use npm ci for CI; use npm install if necessary
      }
    }

    stage('Lint') {
      steps {
        // optional, skip if you don't have eslint
        sh 'npm run lint || true'
      }
    }

    stage('Test') {
      steps {
        // run tests and output JUnit XML to reports/junit.xml
        sh 'npm test -- --reporter mocha-junit-reporter --reporter-options mochaFile=reports/junit.xml || true'
      }
      post {
        always {
          // archive test results for Jenkins to parse
          junit testResults: 'reports/junit.xml', allowEmptyResults: true
          archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
        }
      }
    }

    stage('Build') {
      steps {
        // project-specific build; e.g. for a frontend: npm run build
        sh 'npm run build || true'
        stash includes: 'dist/**', name: 'dist'   // adjust to your build output folder
      }
    }

    stage('Docker Build & Push') {
      when { expression { return env.BUILD_DOCKER == 'true' } } // set param BUILD_DOCKER=true to enable
      steps {
        sh 'docker --version || true'
        sh """
           docker build -t ${IMAGE_NAME}:${GIT_COMMIT_SHORT} .
           echo "${DOCKERHUB_CREDS_PSW}" | docker login -u "${DOCKERHUB_CREDS_USR}" --password-stdin
           docker tag ${IMAGE_NAME}:${GIT_COMMIT_SHORT} ${IMAGE_NAME}:latest
           docker push ${IMAGE_NAME}:${GIT_COMMIT_SHORT}
           docker push ${IMAGE_NAME}:latest
        """
      }
    }

    stage('Archive') {
      steps {
        unstash 'dist'
        archiveArtifacts artifacts: 'dist/**', fingerprint: true
      }
    }
  }

  post {
    success {
      echo "Build SUCCESS: ${env.BUILD_URL}"
    }
    unstable {
      echo "Build UNSTABLE"
    }
    failure {
      echo "Build FAILED"
    }
    always {
      // send notification or cleanup (optional)
      sh 'df -h || true'
    }
  }
}
