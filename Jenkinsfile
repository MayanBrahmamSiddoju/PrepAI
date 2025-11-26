pipeline {
  agent any
  environment {
    BACKEND_DIR = 'backend'
    FRONTEND_DIR = 'frontend/interview-prep-ai'
    DOCKER_REGISTRY = 'docker.io'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Backend Dependencies') {
      steps {
        dir("${env.BACKEND_DIR}") {
          sh 'npm ci'
        }
      }
    }

    stage('Install Frontend Dependencies') {
      steps {
        dir("${env.FRONTEND_DIR}") {
          sh 'npm ci'
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir("${env.FRONTEND_DIR}") {
          sh 'npm run build'
        }
      }
    }

    stage('Run Tests') {
      steps {
        script {
          // Run backend tests if they exist
          dir("${env.BACKEND_DIR}") {
            if (fileExists('package.json')) {
              def pkg = readJSON file: 'package.json'
              if (pkg.scripts?.test) {
                sh 'npm test'
              } else {
                echo 'No backend test script defined; skipping backend tests.'
              }
            }
          }

          // Run frontend tests / lint if configured
          dir("${env.FRONTEND_DIR}") {
            if (fileExists('package.json')) {
              def fpkg = readJSON file: 'package.json'
              if (fpkg.scripts?.test) {
                sh 'npm test'
              } else if (fpkg.scripts?.lint) {
                sh 'npm run lint'
              } else {
                echo 'No frontend tests or lint script defined; skipping.'
              }
            }
          }
        }
      }
    }

    stage('Archive') {
      steps {
        archiveArtifacts artifacts: '**/dist/**, **/build/**', allowEmptyArchive: true
      }
    }
    stage('Build & Push Docker Images') {
      environment {
        REPO = 'mayanbrahmam'
        BACKEND_IMAGE = "${REPO}/prepai-backend:${env.BUILD_NUMBER}"
        FRONTEND_IMAGE = "${REPO}/prepai-frontend:${env.BUILD_NUMBER}"
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
          dir("${BACKEND_DIR}") {
            sh "docker build -t ${BACKEND_IMAGE} ."
            sh "docker push ${BACKEND_IMAGE}"
            sh "docker tag ${BACKEND_IMAGE} ${REPO}/prepai-backend:latest"
            sh "docker push ${REPO}/prepai-backend:latest"
          }
          dir("${FRONTEND_DIR}") {
            sh "docker build -t ${FRONTEND_IMAGE} ."
            sh "docker push ${FRONTEND_IMAGE}"
            sh "docker tag ${FRONTEND_IMAGE} ${REPO}/prepai-frontend:latest"
            sh "docker push ${REPO}/prepai-frontend:latest"
          }
        }
      }
    }
  }
  post {
    always {
      junit allowEmptyResults: true, testResults: '**/test-results/**/*.xml'
      cleanWs()
    }
  }
}
