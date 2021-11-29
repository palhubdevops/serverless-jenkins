pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                // Get some code from a GitHub repository
                git url: 'https://github.com/giosassis/serveless-api', branch: 'main'
                dir ("patient-record") {
                    sh "npm i"  
                }
                
            }
        }

        stage('Run unit test') {
            steps {
                dir ("patient-record") {
                    sh "npm run test"
                }
                  
            }
        }

        stage('Deploy') {
            steps {
                dir ("patient-record") {
                    sh "sls deploy"
                }
            }
        }
    }
}