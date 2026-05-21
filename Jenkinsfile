pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'vedantsaraf787'
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
                    bat "%SCANNER_HOME%\\bin\\sonar-scanner.bat -Dsonar.projectKey=inkwell-blog -Dsonar.sources=client/src,server -Dsonar.projectName=InkwellBlog"
                }
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                withCredentials([string(credentialsId: 'NVD_API_KEY', variable: 'NVD_KEY')]) {
                    dependencyCheck additionalArguments: '--scan ./ --format HTML --out dependency-check-report --nvdApiKey %NVD_KEY% --data C:\\jenkins-owasp-data', odcInstallation: 'dependency-check'
                }
                dependencyCheckPublisher pattern: 'dependency-check-report/dependency-check-report.html'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat "docker build -t ${IMAGE_SERVER}:latest ./server"
                bat "docker build -t ${IMAGE_CLIENT}:latest ./client"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
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
                    dir('client') {
                        bat "npm install"
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
