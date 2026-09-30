pipeline {

    agent any

    environment {

        AWS_REGION     = "eu-north-1"
        AWS_ACCOUNT_ID = "032844082845"

        BACKEND_REPO  = "sribio-backend"
        FRONTEND_REPO = "sribio-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"

        ECR_REGISTRY =
            "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        // IMPORTANT:
        // Replace this with the REAL PUBLIC IP
        // of your SRIBIO Application EC2.
        APP_SERVER = "ubuntu@13.63.138.123"

        APP_DIR = "/opt/sribio"
    }


    stages {

        /*
         * ============================================================
         * 1. CHECKOUT
         * ============================================================
         */

        stage('Checkout') {

            steps {

                echo "======================================="
                echo "Checking out SRIBIO source code"
                echo "======================================="

                checkout scm
            }
        }


        /*
         * ============================================================
         * 2. BUILD BACKEND
         * ============================================================
         */

        stage('Build Backend') {

            steps {

                echo "======================================="
                echo "Building SRIBIO Backend"
                echo "======================================="

                sh """
                    docker build \
                        -t ${BACKEND_REPO}:${IMAGE_TAG} \
                        ./backend
                """
            }
        }


        /*
         * ============================================================
         * 3. BUILD FRONTEND
         * ============================================================
         */

        stage('Build Frontend') {

            steps {

                echo "======================================="
                echo "Building SRIBIO Frontend"
                echo "======================================="

                sh """
                    docker build \
                        -t ${FRONTEND_REPO}:${IMAGE_TAG} \
                        ./forntend
                """
            }
        }


        /*
         * ============================================================
         * 4. LOGIN TO ECR
         * ============================================================
         */

        stage('Login to Amazon ECR') {

            steps {

                echo "======================================="
                echo "Logging into Amazon ECR"
                echo "======================================="

                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-ecr'
                    ]
                ]) {

                    sh """
                        aws ecr get-login-password \
                            --region ${AWS_REGION} |
                        docker login \
                            --username AWS \
                            --password-stdin \
                            ${ECR_REGISTRY}
                    """
                }
            }
        }


        /*
         * ============================================================
         * 5. TAG IMAGES
         * ============================================================
         */

        stage('Tag Images') {

            steps {

                echo "======================================="
                echo "Tagging Docker Images"
                echo "======================================="

                sh """
                    docker tag \
                        ${BACKEND_REPO}:${IMAGE_TAG} \
                        ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG}

                    docker tag \
                        ${FRONTEND_REPO}:${IMAGE_TAG} \
                        ${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG}
                """
            }
        }


        /*
         * ============================================================
         * 6. PUSH BACKEND
         * ============================================================
         */

        stage('Push Backend') {

            steps {

                echo "======================================="
                echo "Pushing Backend Image"
                echo "======================================="

                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-ecr'
                    ]
                ]) {

                    sh """
                        docker push \
                            ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG}
                    """
                }
            }
        }


        /*
         * ============================================================
         * 7. PUSH FRONTEND
         * ============================================================
         */

        stage('Push Frontend') {

            steps {

                echo "======================================="
                echo "Pushing Frontend Image"
                echo "======================================="

                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-ecr'
                    ]
                ]) {

                    sh """
                        docker push \
                            ${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG}
                    """
                }
            }
        }


        /*
         * ============================================================
         * 8. DEPLOY TO APPLICATION EC2
         * ============================================================
         */

        stage('Deploy to Application EC2') {

            steps {

                echo "======================================="
                echo "Deploying SRIBIO to Application EC2"
                echo "======================================="

                sshagent(credentials: ['app-server-ssh']) {

                    sh """
                        ssh \
                            -o StrictHostKeyChecking=no \
                            ${APP_SERVER} \
                            '
                            set -e

                            echo "Connected to Application EC2"

                            echo "Changing directory..."

                            cd ${APP_DIR}

                            echo "Checking Docker..."

                            docker --version

                            echo "Checking Docker Compose..."

                            docker compose version

                            echo "Logging Application EC2 into ECR..."

                            aws ecr get-login-password \
                                --region ${AWS_REGION} |
                            docker login \
                                --username AWS \
                                --password-stdin \
                                ${ECR_REGISTRY}

                            echo "Setting image variables..."

                            export BACKEND_IMAGE=${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG}

                            export FRONTEND_IMAGE=${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG}

                            echo "Pulling new SRIBIO images..."

                            docker compose \
                                -f docker-compose.prod.yml \
                                pull backend frontend

                            echo "Starting / updating SRIBIO services..."

                            docker compose \
                                -f docker-compose.prod.yml \
                                up -d

                            echo "Deployment completed."

                            echo "Current container status:"

                            docker compose \
                                -f docker-compose.prod.yml \
                                ps
                            '
                    """
                }
            }
        }


        /*
         * ============================================================
         * 9. VERIFY DEPLOYMENT
         * ============================================================
         */

        stage('Verify Deployment') {

            steps {

                echo "======================================="
                echo "Verifying SRIBIO Deployment"
                echo "======================================="

                sshagent(credentials: ['app-server-ssh']) {

                    sh """
                        ssh \
                            -o StrictHostKeyChecking=no \
                            ${APP_SERVER} \
                            '
                            set -e

                            cd ${APP_DIR}

                            echo "======================================="
                            echo "Container Status"
                            echo "======================================="

                            docker compose \
                                -f docker-compose.prod.yml \
                                ps

                            echo "======================================="
                            echo "Frontend Health Check"
                            echo "======================================="

                            curl \
                                --fail \
                                --silent \
                                --show-error \
                                http://localhost:87/ \
                                > /dev/null

                            echo "Frontend is UP"

                            echo "======================================="
                            echo "Backend Health Check"
                            echo "======================================="

                            curl \
                                --fail \
                                --silent \
                                --show-error \
                                http://localhost:87/health \
                                > /dev/null

                            echo "Backend is UP"

                            echo "======================================="
                            echo "SRIBIO Deployment Verified"
                            echo "======================================="
                            '
                    """
                }
            }
        }
    }


    /*
     * ================================================================
     * POST ACTIONS
     * ================================================================
     */

    post {

        success {

            echo """
            =======================================
              SRIBIO DEPLOYMENT SUCCESSFUL
            =======================================

            Build Number:
            ${BUILD_NUMBER}

            Backend Image:
            ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG}

            Frontend Image:
            ${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG}

            Application Server:
            ${APP_SERVER}

            =======================================
            """
        }


        failure {

            echo """
            =======================================
              SRIBIO DEPLOYMENT FAILED
            =======================================

            Build Number:
            ${BUILD_NUMBER}

            Check Jenkins Console Output.

            =======================================
            """
        }


        always {

            cleanWs()
        }
    }
}
