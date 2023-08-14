pipeline {
    agent any
    environment {
        AWS_ACCESS_KEY_ID = credentials('AKIAQBUDIASYGQNNBPOH')
        AWS_SECRET_ACCESS_KEY = credentials('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')
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
                    sh "sls deploy"
                }
            }
    }
}
