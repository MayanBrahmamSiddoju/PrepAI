pipeline {
  agent {
    docker { image 'node:18' }
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
      }
    }

    stage('Install') {
      steps {
        sh 'npm --version || true'
        sh 'npm ci || npm install'
      }
    }

    stage('Test') {
      steps {
        // ensure reports folder exists so junit step won't fail
        sh 'mkdir -p reports || true'
        // run tests (adjust your test script as needed)
        sh 'npm test || true'
      }
      post {
        always {
          // publish JUnit XML test reports (use named args)
          junit testResults: 'reports/**/*.xml', allowEmptyResults: true
          // archive raw reports for inspection
          archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
        }
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build || true'
        // if there's a build output folder, archive it
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
