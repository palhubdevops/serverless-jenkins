pipeline { 
    agent any
    environment {
        AWS_CREDENTIALS = credentials('my-aws-serverless-access')
    }
    stages {
        stage('Build') {
            steps {
                git url: 'https://github.com/giosassis/serveless-api', branch: 'main'
                sh "npm i"  
            }
        }

        stage('Run unit test') {
            steps {
                sh "npm run test"  
            }
        }

        stage('Deploy') {
            steps {
                script {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'my-aws-serverless-access', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                        sh "sls deploy"
                    }
                }
            }
    }
}
