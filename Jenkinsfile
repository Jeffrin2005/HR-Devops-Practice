pipeline {
    agent any

    // In production, we define our Docker Hub credentials here
    environment {
        DOCKER_CREDS = credentials('docker-hub-credentials')
        DOCKER_USERNAME = 'jeffrinjojo' // Replace with your actual DockerHub username
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Jenkins automatically pulls the code from GitHub based on our SCM settings!
                echo "Code pulled successfully."
            }
        }
        
        stage('Run Unit Tests') {
            steps {
                dir('server') {
                    // This tells Jenkins to go into the server folder and run tests
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                // The REAL docker build commands
                sh "docker build -t ${DOCKER_USERNAME}/hr-frontend:latest ./frontend"
                sh "docker build -t ${DOCKER_USERNAME}/hr-backend:latest ./server"
            }
        }

        stage('Push to DockerHub') {
            steps {
                // This logs into DockerHub and securely pushes the heavy images to the internet
                sh "echo \$DOCKER_CREDS_PSW | docker login -u \$DOCKER_CREDS_USR --password-stdin"
                sh "docker push ${DOCKER_USERNAME}/hr-frontend:latest"
                sh "docker push ${DOCKER_USERNAME}/hr-backend:latest"
            }
        }
    }
}
