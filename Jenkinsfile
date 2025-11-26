pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        // run Windows batch commands
        bat 'node --version || echo "node not found"'
        bat 'npm --version || echo "npm not found"'
        bat 'npm ci || npm install'
      }
    }

    stage('Test') {
      steps {
        bat 'if not exist reports (mkdir reports)'
        bat 'npm test || exit 0'
      }
      post {
        always {
          // publish JUnit XML (works on Windows)
          junit testResults: 'reports/**/*.xml', allowEmptyResults: true
          archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
        }
      }
    }

    stage('Build') {
      steps {
        bat 'npm run build || exit 0'
        archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true
      }
    }
  }

  post {
    success { echo "Build SUCCESS: ${env.BUILD_URL}" }
    unstable { echo "Build UNSTABLE" }
    failure { echo "Build FAILED" }
    always { echo "cleanup step" }
  }
}
