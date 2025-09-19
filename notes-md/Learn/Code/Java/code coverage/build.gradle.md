<Root>build.gradle

```javascript
plugins {
    id "org.sonarqube" version "3.0"
    id "jacoco"
}
 
subprojects {
    apply plugin: "org.sonarqube"
    apply plugin: "jacoco"
}
```

<Subprojects> build.gradle

```javascript
jacocoTestReport {
    reports {
        xml.enabled true
    }
}
```

Command

```javascript
./gradlew build test jacocoTestReport sonarqube -Dsonar.projectKey=${PROJECTKEY}  -Dsonar.host.url=https://sonarqube.refinitiv.com  -Dsonar.login=${LOGINTOKEN} -Dsonar.projectName=${PROJECTNAME} -Dsonar.branch.name=master -Dsonar.projectVersion=${tag_name}
```

