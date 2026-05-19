pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'YOUR_DOCKERHUB_USERNAME'
        IMAGE_SERVER   = "${DOCKERHUB_USER}/inkwell-server"
        IMAGE_CLIENT   = "${DOCKERHUB_USER}/inkwell-client"
    }

    tools {
        nodejs 'NodeJS'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            environment {
                SCANNER_HOME = tool 'sonar-scanner'
            }
            steps {
                withSonarQubeEnv('sonarqube') {
                    bat "%SCANNER_HOME%\\bin\\sonar-scanner.bat -Dsonar.projectKey=inkwell-blog -Dsonar.sources=blog-app/client/src,blog-app/server -Dsonar.projectName=InkwellBlog"
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                dir('blog-app') {
                    bat "docker build -t ${IMAGE_SERVER}:latest ./server"
                    bat "docker build -t ${IMAGE_CLIENT}:latest ./client"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat "echo %DOCKER_PASS%| docker login -u %DOCKER_USER% --password-stdin"
                    bat "docker push ${IMAGE_SERVER}:latest"
                    bat "docker push ${IMAGE_CLIENT}:latest"
                    bat "docker logout"
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                withCredentials([string(credentialsId: 'RENDER_DEPLOY_HOOK', variable: 'HOOK_URL')]) {
                    bat "curl -X POST %HOOK_URL%"
                }
            }
        }

        stage('Deploy Frontend to Vercel') {
            steps {
                withCredentials([
                    string(credentialsId: 'VERCEL_TOKEN',      variable: 'VERCEL_TOKEN'),
                    string(credentialsId: 'VERCEL_ORG_ID',     variable: 'VERCEL_ORG_ID'),
                    string(credentialsId: 'VERCEL_PROJECT_ID', variable: 'VERCEL_PROJECT_ID')
                ]) {
                    dir('blog-app/client') {
                        bat "npx vercel pull --yes --environment=production --token=%VERCEL_TOKEN%"
                        bat "npx vercel build --prod --token=%VERCEL_TOKEN%"
                        bat "npx vercel deploy --prebuilt --prod --token=%VERCEL_TOKEN%"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed — check logs above.'
        }
    }
}
