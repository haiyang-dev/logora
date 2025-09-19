

```javascript
import java.lang.reflect.Field
import groovy.transform.Field

def git_TSCC_IS_Metadata_Loader_Terraform = 'git@git.sami.int.thomsonreuters.com:Haiyang.Wang/jenkins_test.git'
def gitCredentialsId = 's.ts.auto_cred'

def execute_path = ''

def prepareSSHCredential(gitCredentialsId) {
    withCredentials([
            sshUserPrivateKey(
                    credentialsId: gitCredentialsId,
                    keyFileVariable: 'keyFile')
    ]) {
        sh "set +x; echo \"" + readFile(keyFile) + "\" > $HOME/.ssh/id_rsa; set -x"
        sh "chmod 600 $HOME/.ssh/id_rsa"
        sh "echo \"git.sami.int.thomsonreuters.com,10.52.131.182 ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBOG9aESY6meVotFmlXpb/iSWtMD3p+z970eq7A7oqQbCLrdp3hcsiDPPCl0PJNp+vjTuY9ol4vOwZCH6ZPZOHYE=\" > $HOME/.ssh/known_hosts"
    }
}

pipeline{
    agent any
    stages{
        stage('Prepare Workspace') {
            steps {
                script{
                    sh "rm -rf *"
                    sh "rm -f $HOME/.ssh/id_rsa"
                    sh "rm -f $HOME/.ssh/known_hosts"
                    prepareSSHCredential(gitCredentialsId)
                    //currentBuild.result = "FAILURE"                 
                }
                
            }
        }
        stage("download code") {
            steps {
                script {
                    sh "pwd"
                    sh "ls -l"
                    git credentialsId: gitCredentialsId, poll: false, url: git_TSCC_IS_Metadata_Loader_Terraform
                    mail_module = load env.WORKSPACE + "/jenkins_mail_module"
                    mail_module.IANA_time_zone_send_email1("running","haiyang.wang@refinitiv.com")
                    sh "rm -rf *"
                    sh "rm -f $HOME/.ssh/id_rsa"
                    sh "rm -f $HOME/.ssh/known_hosts"
                }
            }
        }
    }
    /* rtcl_process.hudson@thomsonreuters.com */
    /* address not configured yet <nobody@nowhere>*/
    post {
        success {
            emailext (
                subject: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """<p>SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
                    <p>Check console output at "<a href="${env.BUILD_URL}">${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>"</p>""",
                to: "haiyang.wang@refinitiv.com",
                from: "haiyang.wang@refinitiv.com"
            )
        }
        failure {
            emailext (
                subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """<p>FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
                    <p>Check console output at "<a href="${env.BUILD_URL}">${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>"</p>""",
                to: "haiyang.wang@refinitiv.com",
                from: "rtcl_process.hudson@thomsonreuters.com"
            )
        }
    }
    post{
        failure {
            script {
                module_test.send_email_results("Failed","Master","haiyang.wang@refinitiv.com")
            }
        }
        success {
            script {
                module_test.send_email_results("Success","Master","haiyang.wang@refinitiv.com")
            }
        }
    }
}
```





```javascript
def IANA_time_zone_send_email1(status,to_email_address_list) {
    def subject = "Jenkins Job : " + env.JOB_NAME + "/" + env.BUILD_ID + " has " +  status
    def mailFileContents = readFile env.WORKSPACE + '/html_mail.txt'
    def BUILD_STATUS = status
    def result_url = env.BUILD_URL + "console"
    //println(mailFileContents)
    def text = """
    <html>
    <head>
        <style type="text/css">
            h3 { color:#212121; }
            h4 { color:#ff6600; }
            h5 { color:#0B610B}
            body { font-family:Arial; }
            pre {font-size:14px; font-family:Arial;}
            table.outerTable {font-size:14px;}
            table.innerTable { font-size:14px; color:#333333; width:auto; border-width:1px; border-color:#a9a9a9; border-collapse:collapse; }
            table.innerTable th { font-size:14px; background-color:#b8b8b8; border-width:1px; padding:8px; border-style:solid; border-color:#a9a9a9; text-align:left; }
            table.innerTable tr { background-color:#ffffff; }
            table.innerTable td { font-size:14px; border-width:1px; padding:8px; border-style:solid; border-color:#a9a9a9; }
        </style>
        <title>${JOB_NAME}-${BUILD_NUMBER}</title>
    </head>

    <body>
        <table class="outerTable">
            <tr>
                <td>
                    <b style="color:#ff6600; font-size:16px;">Build Information</b>
                    <hr />
                </td>
            </tr>
            <tr>
                <td>
                    <table class="innerTable">
                        <tr><td>Project Name</td><td>${JOB_NAME}</td></tr>
                        <tr><td>Build Number</td><td>${BUILD_NUMBER}</td></tr>
                        <tr><td>Build Status</td><td>${BUILD_STATUS}</td></tr>
                        <tr><td>Build Report</td><td>${BUILD_URL}</td></tr>
                        <tr><td>Build Log</td><td>${result_url}</td></tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <br /><br />
                    <b style="color:#ff6600; font-size:16px;">IANA Time Zone Files Report</b>
                    <hr />
                </td>
            </tr>
            <tr>
                <td>
                <table class="innerTable">
                    <thead><tr><th>IANA TimeZone Version</th><th>Files Link</th></tr></thead>
                    ${mailFileContents}
                </table>
                <hr />
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    mail body: text, subject: subject,  mimeType: 'text/html', to: to_email_address_list,from: "rtcl_process.hudson@thomsonreuters.com"
}

return this;
```



emailext attachLog: true, body: text, subject: subject,  mimeType: 'text/html', to: to_email_address_list,from: "rtcl_process.hudson@thomsonreuters.com" 扩展邮件，能发附件





```javascript
pipeline {
    agent any
    environment { 
    def ITEMNAME = "webapp"
    def DESTPATH = "/data/wwwroot"
    def SRCPATH = "~/workspace/test"
    def BUILD_USER = "mark"
    def USERMAIL = "myname@gmail.com"
    }
    
    stages {    
        stage('代码拉取'){
            steps {
            echo "checkout from ${ITEMNAME}"
            git url: 'git@git.ds.com:mark/maxtest.git', branch: 'master'
            //git credentialsId:CRED_ID, url:params.repoUrl, branch:params.repoBranch
                    }
                    }   
        stage('服务检查') {
            steps {
                echo "检查nginx进程是否存在"
                script{
                    try {
                    sh script: 'ansible webapp -m shell -a "ps aux|grep nginx|grep -v grep"'
                    } catch (exc) {
                        currentBuild.result = "FAILURE"                 
                            emailext (
                                subject: "'${env.JOB_NAME} [${env.BUILD_NUMBER}]' 更新失败",
                                body: """
                                详情：
                                FAILURE: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'
                                状态：${env.JOB_NAME} jenkins 更新失败 
                                URL ：${env.BUILD_URL}
                                项目名称 ：${env.JOB_NAME} 
                                项目更新进度：${env.BUILD_NUMBER}
                                内容：nginx进程不存在
                                """,
                                to: "${USERMAIL}",
                                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
                                )               
                                }       
                    }
                    }
                    }
        stage('目录检查') {
            steps {
                echo "检查${DESTPATH}目录是否存在"
                script{
                    try {
                    sh script: 'ansible webapp -m shell -a "ls -d ${DESTPATH}"'
                    } catch (exc) {
                        currentBuild.result = "FAILURE"                 
                            emailext (
                                subject: "'${env.JOB_NAME} [${env.BUILD_NUMBER}]' 更新失败",
                                body: """
                                详情：
                                FAILURE: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'
                                状态：${env.JOB_NAME} jenkins 更新失败 
                                URL ：${env.BUILD_URL}
                                项目名称 ：${env.JOB_NAME} 
                                项目更新进度：${env.BUILD_NUMBER}
                                内容：${DESTPATH}目录不存在
                                """,
                                to: "${USERMAIL}",                          
                                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
                                )               
                                }
                    }
                    }       
                    }
                    }
    post {
        success {
            emailext (
                subject: "'${env.JOB_NAME} [${env.BUILD_NUMBER}]' 更新正常",
                body: """
                详情：
                SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'
                状态：${env.JOB_NAME} jenkins 更新运行正常 
                URL ：${env.BUILD_URL}
                项目名称 ：${env.JOB_NAME} 
                项目更新进度：${env.BUILD_NUMBER}
                """,
                to: "${USERMAIL}",  
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
                )
                }
                }
}
```





```javascript
import hudson.model.*
import java.lang.reflect.Field
import groovy.transform.Field

def git_k8s = 'git@git.sami.int.thomsonreuters.com:ts/tick_store_normalizer_k8s.git'
def gitCredentialsId1 = 's.ts.auto_cred'
def gitCredentialsId = 'e3e988af-ce73-4779-8810-10d009e5b4a4'

def mail_module
def mail_module_path = ''

def deploy_path = 'kustomize/normalizer'
git_tag=params.Tag
deploy_env=params.env
pod_num=params.pod_nums
pod_num1=pod_num.toInteger()-1

mail_receiver = params.mail_list

pipeline{
    agent {
        label 'TS-Build-Normalizer-c163fhsdabl02'
        }
    stages{
        stage('Prepare Workspace') {
            steps {
                script{
                    sh "rm -rf *"
                    sh "rm -f $HOME/.ssh/id_rsa"
                    sh "rm -f $HOME/.ssh/known_hosts"
                    echo "git tag = [${git_tag}]"
                    echo "deploy_env = ${deploy_env}"
                    // mail_module_path  = env.WORKSPACE + "/mail_modules"
                    // echo "mail_module_path = ${mail_module_path}"
                    sh "export http_proxy=webproxy.int.westgroup.com:80"
                    sh "export https_proxy=webproxy.int.westgroup.com:80"
                }
            }
        }
        
        stage("Download Code") {
            steps {
                script {
                    sh "pwd"
                    checkout scm: [$class: 'GitSCM',
                    userRemoteConfigs: [[url: git_k8s, credentialsId: gitCredentialsId]],
                    branches: [[name: "refs/tags/${git_tag}"]]],
                    poll: false
                    sh "ls -l"
                    // mail_module = load "${mail_module_path}"
                }
            }
        }
        stage("Deploy Normalizer") {
            steps {
                script {
                    dir("${deploy_path}") {
                       sh "pwd"
                       sh "whoami"
                       sh "ls -l"
                       sh "sed -i 's/  replicas: 5/  replicas: ${pod_num}/g' ./on-premise/${deploy_env}/patch.yaml"
                       sh "sed -i 's/seq 0 4/seq 0 ${pod_num1}/g' ./on-premise/${deploy_env}/normalizer-svc.sh"
                       sh "cat ./on-premise/${deploy_env}/normalizer-svc.sh"
                       sh "cat ./on-premise/${deploy_env}/patch.yaml"
                       sh "kubectl apply -k ./on-premise/${deploy_env}/"
                       sh "./on-premise/${deploy_env}/normalizer-svc.sh"
                    }
                }
            }
        }
    }
}
```

