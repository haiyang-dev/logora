You can use the build job step from Jenkins Pipeline (Minimum Jenkins requirement: 2.130).

Here's the full API for the build step: https://jenkins.io/doc/pipeline/steps/pipeline-build-step/

How to use build:

- job: Name of a downstream job to build. May be another Pipeline job, but more commonly a freestyle or other project.

- Use a simple name if the job is in the same folder as this upstream Pipeline job;

- You can instead use relative paths like ../sister-folder/downstream

- Or you can use absolute paths like /top-level-folder/nested-folder/downstream

Trigger another job using a branch as a param

At my company many of our branches include "/". You must replace any instances of "/" with "%2F" (as it appears in the URL of the job).

In this example we're using relative paths

    stage('Trigger Branch Build') {
        steps {
            script {
                    echo "Triggering job for branch ${env.BRANCH_NAME}"
                    BRANCH_TO_TAG=env.BRANCH_NAME.replace("/","%2F")
                    build job: "../my-relative-job/${BRANCH_TO_TAG}", wait: false
            }
        }
    }


Trigger another job using build number as a param

build job: 'your-job-name', 
    parameters: [
        string(name: 'passed_build_number_param', value: String.valueOf(BUILD_NUMBER)),
        string(name: 'complex_param', value: 'prefix-' + String.valueOf(BUILD_NUMBER))
    ]


Trigger many jobs in parallel

Source: https://jenkins.io/blog/2017/01/19/converting-conditional-to-pipeline/

More info on Parallel here: https://jenkins.io/doc/book/pipeline/syntax/#parallel

    stage ('Trigger Builds In Parallel') {
        steps {
            // Freestyle build trigger calls a list of jobs
            // Pipeline build() step only calls one job
            // To run all three jobs in parallel, we use "parallel" step
            // https://jenkins.io/doc/pipeline/examples/#jobs-in-parallel
            parallel (
                linux: {
                    build job: 'full-build-linux', parameters: [string(name: 'GIT_BRANCH_NAME', value: env.BRANCH_NAME)]
                },
                mac: {
                    build job: 'full-build-mac', parameters: [string(name: 'GIT_BRANCH_NAME', value: env.BRANCH_NAME)]
                },
                windows: {
                    build job: 'full-build-windows', parameters: [string(name: 'GIT_BRANCH_NAME', value: env.BRANCH_NAME)]
                },
                failFast: false)
        }
    }


Or alternatively:

    stage('Build A and B') {
            failFast true
            parallel {
                stage('Build A') {
                    steps {
                            build job: "/project/A/${env.BRANCH}", wait: true
                    }
                }
                stage('Build B') {
                    steps {
                            build job: "/project/B/${env.BRANCH}", wait: true
                    }
                }
            }
    }


share  improve this answer   

edited Jul 5 '19 at 18:53

answered Jul 1 '19 at 19:16

![](images/10DC8CAE4625420EB37E379E3C9293B289d25c651c3.jpeg)

Katie

34.9k1717 gold badges7474 silver badges105105 bronze badges

add a comment

3

Use build job plugin for that task in order to trigger other jobs from jenkins file. You can add variety of logic to your execution such as parallel ,node and agents options and steps for triggering external jobs. I gave some easy-to-read cookbook example for that.

1.example for triggering external job from jenkins file with conditional example:

if (env.BRANCH_NAME == 'master') {
  build job:'exactJobName' , parameters:[
    string(name: 'keyNameOfParam1',value: 'valueOfParam1')
    booleanParam(name: 'keyNameOfParam2',value:'valueOfParam2')
 ]
}


2.example triggering multiple jobs from jenkins file with conditionals example:

 def jobs =[
    'job1Title'{
    if (env.BRANCH_NAME == 'master') {
      build job:'exactJobName' , parameters:[
        string(name: 'keyNameOfParam1',value: 'valueNameOfParam1')
        booleanParam(name: 'keyNameOfParam2',value:'valueNameOfParam2')
     ]
    }
},
    'job2Title'{
    if (env.GIT_COMMIT == 'someCommitHashToPerformAdditionalTest') {
      build job:'exactJobName' , parameters:[
        string(name: 'keyNameOfParam3',value: 'valueOfParam3')
        booleanParam(name: 'keyNameOfParam4',value:'valueNameOfParam4')
        booleanParam(name: 'keyNameOfParam5',value:'valueNameOfParam5')
     ]
    }
}





```javascript
def infra_job = build job: "${infrastructure_job}", parameters: [ string(name: 'ReleaseVersion', value:"${infrastructure_version}"), string(name:'Environment', value: "${environment}"), string(name: 'Region', value:"${region}"), booleanParam(name: 'DryRun', value:'true'),]
println(infra_job.getClass())
println(infra_job.getResult())
def checklog2 = infra_job.rawBuild.log
// obviously, if you don't want the output in your console, do not println
println(checklog2)
```



Scripts not permitted to use method org.jenkinsci.plugins.workflow.support.steps.build.RunWrapper getRawBuild. Administrators can decide whether to approve or reject this signature.





http://a205143-cicd.edp-cicd.aws-int.thomsonreuters.com/scriptApproval/



method hudson.model.Run getCauses

method hudson.model.Run getLog

method org.jenkinsci.plugins.workflow.support.steps.build.RunWrapper getRawBuild

staticMethod org.codehaus.groovy.runtime.DefaultGroovyMethods getAt java.util.Collection java.lang.String





propagate: false, if true, sub job failed the main failed too.

 wait: true



