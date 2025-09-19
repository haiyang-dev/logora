refs/tags/${ReleaseVersion}   */master





```javascript
branches: [[name: "refs/tags/${releaseVersion}"]]],

checkout scm: [$class: 'GitSCM',
               userRemoteConfigs: [[url: git_componnet_stack, credentialsId: git_credentials_id]],
               branches: [[name: '*/master']]],
        poll: false
```





refs/tags/${ReleaseVersion}

branches: [[name: "refs/tags/${releaseVersion}"]]],

*/master