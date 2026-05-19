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
                    sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \
                          -Dsonar.projectKey=inkwell-blog \
                          -Dsonar.sources=blog-app/client/src,blog-app/server \
                          -Dsonar.projectName='Inkwell Blog'
                    """
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
                    sh "docker build -t ${IMAGE_SERVER}:latest ./server"
                    sh "docker build -t ${IMAGE_CLIENT}:latest ./client"
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
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                    sh "docker push ${IMAGE_SERVER}:latest"
                    sh "docker push ${IMAGE_CLIENT}:latest"
                    sh "docker logout"
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                // RENDER (deploy hook):
                withCredentials([string(credentialsId: 'RENDER_DEPLOY_HOOK', variable: 'HOOK_URL')]) {
                    sh "curl -X POST $HOOK_URL"
                }

                // RAILWAY (uncomment if using Railway instead):
                // withCredentials([string(credentialsId: 'RAILWAY_TOKEN', variable: 'RAILWAY_TOKEN')]) {
                //     sh "railway up --service inkwell-server --detach"
                // }
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
                        sh "npx vercel pull --yes --environment=production --token=$VERCEL_TOKEN"
                        sh "npx vercel build --prod --token=$VERCEL_TOKEN"
                        sh "npx vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN"
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
