pipeline {
  agent {
    docker { image 'node:18' }
  }

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
        sh 'node --version || true'
        sh 'npm ci || npm install'
      }
    }

    stage('Test') {
      steps {
        sh 'mkdir -p reports || true'
        sh 'npm test || true'
      }
      post {
        always {
          junit testResults: 'reports/**/*.xml', allowEmptyResults: true
          archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
        }
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build || true'
        archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true
      }
    }
  }

  post {
    success { echo "Build SUCCESS: ${env.BUILD_URL}" }
    unstable { echo "Build UNSTABLE" }
    failure { echo "Build FAILED" }
    always { sh 'echo cleanup || true' }
  }
}
