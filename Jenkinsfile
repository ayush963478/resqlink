// ResQLink CI/CD pipeline (blueprint section 19).
// Secrets (DB creds, SECRET_KEY, deploy host) are read from Jenkins
// credentials, never committed to the repo.
pipeline {
    agent any

    environment {
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        COMPOSE_DIR = "infrastructure"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend: Lint & Test') {
            steps {
                dir('backend') {
                    sh '''
                        python3 -m venv .venv
                        . .venv/bin/activate
                        pip install --no-cache-dir -r requirements.txt
                        pip install ruff
                        ruff check app
                        pytest -q
                    '''
                }
            }
        }

        stage('Frontend: Build') {
            steps {
                dir('frontend') {
                    sh '''
                        npm install
                        npm run build
                    '''
                }
            }
        }

        stage('Docker: Build Images') {
            steps {
                dir("${COMPOSE_DIR}") {
                    sh 'docker compose build'
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([file(credentialsId: 'resqlink-env-file', variable: 'ENV_FILE')]) {
                    sh '''
                        cp "$ENV_FILE" .env
                        cd infrastructure
                        docker compose up -d --remove-orphans
                    '''
                }
            }
        }

        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    sleep 10
                    curl -f http://localhost/health
                '''
            }
        }
    }

    post {
        failure {
            echo 'Build or deploy failed -- check the stage logs above.'
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
