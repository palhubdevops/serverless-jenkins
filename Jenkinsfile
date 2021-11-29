pipeline {
    agent any
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