pipeline {
    agent any
    tools {
        nodejs 'Node18'
    }
    // In production, we define our Docker Hub credentials here
    environment {
        DOCKER_CREDS = credentials('docker-hub-credentials')
        DOCKER_USERNAME = 'jeffrinjojo' // Replace with your actual DockerHub username
        IMAGE_TAG = "v${BUILD_NUMBER}"
        K8S_DIR = 'k8s'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "Code pulled successfully."
            }
        }
        
        stage('Run Unit Tests') {
            steps {
                dir('server') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }
        
        stage('SonarQube Analysis') {
            environment {
                scannerHome = tool 'SonarScanner'
            }
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=HR-Project -Dsonar.sources=./server,./frontend"
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh "docker build -t ${DOCKER_USERNAME}/hr-frontend:${IMAGE_TAG} ./frontend"
                sh "docker build -t ${DOCKER_USERNAME}/hr-backend:${IMAGE_TAG} ./server"
            }
        }

        stage('Push to DockerHub') {
            steps {
                sh "echo \$DOCKER_CREDS_PSW | docker login -u \$DOCKER_CREDS_USR --password-stdin"
                sh "docker push ${DOCKER_USERNAME}/hr-frontend:${IMAGE_TAG}"
                sh "docker push ${DOCKER_USERNAME}/hr-backend:${IMAGE_TAG}"
            }
        }
        
        stage('Update Kubernetes Manifests') {
            steps {
                echo "☸️ Updating Kubernetes image tags to ${IMAGE_TAG}..."
                sh '''
                    sed -i "s|image: .*hr-frontend:.*|image: ${DOCKER_USERNAME}/hr-frontend:${IMAGE_TAG}|g" ${K8S_DIR}/*.yaml
                    sed -i "s|image: .*hr-backend:.*|image: ${DOCKER_USERNAME}/hr-backend:${IMAGE_TAG}|g" ${K8S_DIR}/*.yaml
                '''
            }
        }

        stage('Commit & Push to GitHub') {
            steps {
                echo "📤 Pushing Kubernetes changes to GitHub..."
                // NOTE: You must have a 'github-credentials' token saved in Jenkins for this to work!
                withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    sh '''
                        git config user.name "Jenkins GitOps"
                        git config user.email "jenkins@localhost"
                        git add ${K8S_DIR}/
                        git commit -m "Auto-update Kubernetes images to ${IMAGE_TAG}" || echo "No changes to commit"
                        git push https://${GIT_USER}:${GIT_TOKEN}@github.com/Jeffrin2005/HR-Devops-Practice.git HEAD:main
                    '''
                }
            }
        }
    }

    post {
        success {
            mail to: 'jetsetterflash@gmail.com',
                 subject: "✅ SUCCESS: Jenkins Build ${BUILD_NUMBER}",
                 body: "The GitOps pipeline built and updated Kubernetes to version ${IMAGE_TAG} successfully!"
        }
        failure {
            mail to: 'jetsetterflash@gmail.com',
                 subject: "❌ FAILED: Jenkins Build ${BUILD_NUMBER}",
                 body: "The Jenkins build failed! Please check the Jenkins logs."
        }
    }
}
