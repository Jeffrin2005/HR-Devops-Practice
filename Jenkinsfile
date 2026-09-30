pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                echo "Pulling the latest code from GitHub..."
                // In reality, this would be: git 'https://github.com/your-repo.git'
            }
        }
        
        stage('Run Unit Tests') {
            steps {
                echo "Running npm install..."
                echo "Running npm test..."
                echo "All tests passed successfully!"
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo "Running: docker build -t hr-frontend:latest ./frontend"
                echo "Running: docker build -t hr-backend:latest ./server"
                echo "Images built successfully!"
            }
        }

        stage('Push to DockerHub') {
            steps {
                echo "Pushing frontend to DockerHub..."
                echo "Pushing backend to DockerHub..."
                echo "Images pushed successfully! ArgoCD will now take over."
            }
        }
    }
}
