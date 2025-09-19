```
plugins {
   id 'org.springframework.boot' version '2.7.3'
   id 'io.spring.dependency-management' version '1.0.13.RELEASE'
   id 'java'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'

repositories {
   mavenCentral()
}

dependencies {
// implementation 'org.springframework.boot:spring-boot-starter'
   implementation 'org.camunda.bpm.springboot:camunda-bpm-spring-boot-starter-webapp:7.17.0' // webapp
   implementation 'org.camunda.bpm.springboot:camunda-bpm-spring-boot-starter-rest:7.17.0' //restapi
   implementation 'com.h2database:h2' //database
   implementation 'com.sun.xml.bind:jaxb-impl:2.3.5'
   testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

tasks.named('test') {
   useJUnitPlatform()
}

```