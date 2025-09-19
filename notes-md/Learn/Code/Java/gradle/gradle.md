

```javascript
plugins {
    id 'java'
    id 'application'
}

group 'com.refinitiv.timeseries'
version '1.0.0'

sourceCompatibility = 1.8

def javaDriverVersion = '4.13.0'

jar {
    from {
        configurations.compile.collect {
            it.isDirectory() ? it : zipTree(it)
        }
    }
    manifest {
        attributes 'Implementation-Title': 'StateMonitor',
                'Main-Class': "com.refinitiv.timeseries.snapshot.StateMonitorApplication"
    }
}

repositories {
    mavenCentral()
    maven {
        url "https://bams-aws.refinitiv.com/artifactory/release.maven.global"
        credentials {
            username = "-s.ts.auto"
            password = "TSAut0mat10n"
        }
    }
}

application {
    mainClass = 'com.refinitiv.timeseries.snapshot.StateMonitorApplication'
}

dependencies {
    testImplementation "org.junit.jupiter:junit-jupiter-api:5.7.2"
    implementation group: 'org.slf4j', name: 'slf4j-api', version: '1.7.31'
    // implementation group: 'org.slf4j', name: 'slf4j-log4j12', version: '1.7.31'
    // implementation group: 'org.slf4j', name: 'slf4j-simple', version: '1.7.31'
    implementation group: 'ch.qos.logback', name: 'logback-core', version: '1.2.5'
    implementation group: 'ch.qos.logback', name: 'logback-classic', version: '1.2.5'
    annotationProcessor group: 'com.datastax.oss', name: 'java-driver-mapper-processor', version: javaDriverVersion
    implementation "com.datastax.oss:java-driver-core:${javaDriverVersion}"
    implementation "com.datastax.oss:java-driver-query-builder:${javaDriverVersion}"
    implementation "com.datastax.oss:java-driver-mapper-runtime:${javaDriverVersion}"
    implementation ('com.refinitiv.ts:ets-alarm-logging:0.1.44') {
        exclude group: 'org.slf4j'
        exclude group: 'log4j'
        exclude group: 'org.apache.logging'
    }
    implementation 'io.micrometer:micrometer-registry-statsd:1.6.4'
    implementation 'software.amazon.awssdk:secretsmanager:2.17.25'
    implementation 'com.squareup.okhttp3:okhttp:4.9.1'
}

task tsalerterInstall(type: Exec) {
    commandLine 'pip3', 'install', 'ClassGenerator', '--upgrade', '--index', 'https://-s.ts.auto:AP9UZodR6NmpGc7Chae17FEMvjQ@bams-aws.refinitiv.com/artifactory/api/pypi/default.pypi.global/simple/'
}

task alertClassGenerate(type: Exec) {
    commandLine 'generate_alerter', '-c', project.projectDir.getAbsolutePath()+'/config/AlarmConfig.yaml', '-o', project.projectDir.getAbsolutePath() + '/src/main/java/com/refinitiv/timeseries/snapshot'
}

task alertCSVGenerate(type: Exec) {
    commandLine 'generate_dictionary', '-c', project.projectDir.getAbsolutePath()+'/config/AlarmConfig.yaml', '-o', project.projectDir.getAbsolutePath()+'/config/statemonitor_event_dictionary.csv'
}

alertClassGenerate.dependsOn tasks.tsalerterInstall

compileJava.dependsOn tasks.alertClassGenerate
```

