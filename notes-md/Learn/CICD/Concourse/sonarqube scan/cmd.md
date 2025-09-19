curl -O https://sonarqube.refinitiv.com/static/cpp/build-wrapper-linux-x86.zip

unzip build-wrapper-linux-x86.zip

chmod 755 build-wrapper-linux-x86/* -R



curl -O https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.6.2.2472-linux.zip

rm sonar-scanner-4.6.2.2472-linux -Rf

unzip sonar-scanner-cli-4.6.2.2472-linux.zip

chmod 755 sonar-scanner-4.6.2.2472-linux/* -R





echo "http.proxyHost=10.23.30.130" >> sonar-scanner-4.6.2.2472-linux/jre/conf/net.properties

echo "http.proxyPort=8080" >> sonar-scanner-4.6.2.2472-linux/jre/conf/net.properties

echo "https.proxyHost=10.23.30.130" >> sonar-scanner-4.6.2.2472-linux/jre/conf/net.properties

echo "https.proxyPort=8080" >> sonar-scanner-4.6.2.2472-linux/jre/conf/net.properties



echo "http.proxyHost=10.23.30.130" >> sonar-scanner-4.6.2.2472-linux/conf/sonar-scanner.properties

echo "http.proxyPort=8080" >> sonar-scanner-4.6.2.2472-linux/conf/sonar-scanner.properties

echo "https.proxyHost=10.23.30.130" >> sonar-scanner-4.6.2.2472-linux/conf/sonar-scanner.properties

echo "https.proxyPort=8080" >> sonar-scanner-4.6.2.2472-linux/conf/sonar-scanner.properties



docker run -it -v /data/haiyang/code/pricingsnapshot_cacheserver/:/data/cahce-server/ 90c7550c27f9 /bin/bash

docker run -it -v /data/haiyang/code/pricingsnapshot_webserver/:/data/web-source/ 1ac3c7965789 /bin/bash



autoreconf -if

./configure --enable-coverage --enable-unittest

./configure --enable-unittest



build-wrapper-linux-x86/build-wrapper-linux-x86-64 --out-dir sonar_build_wrapper_output make clean

build-wrapper-linux-x86/build-wrapper-linux-x86-64 --out-dir sonar_build_wrapper_output make check



./SnapshotCacheServer/sonar-scanner-4.6.2.2472-linux/bin/sonar-scanner -Dsonar.sources=./SnapshotCacheServer/Components,./SnapshotCacheServer/Includes,./SnapshotCacheServer/Interfaces -Dsonar.cfamily.build-wrapper-output=./SnapshotCacheServer/sonar_build_wrapper_output -Dsonar.cfamily.cache.enabled=true -Dsonar.cfamily.cache.path=./SnapshotCacheServer/sonar_cache -Dsonar.cfamily.threads=8 -Dsonar.login=70386a4949d847cdd199d558140c774fbe8b97ab -Dsonar.projectKey=a250065-pricingsnapshot-cache -Dsonar.projectName=a250065-pricingsnapshot-cache -Dsonar.branch.name=master -Dsonar.projectVersion=1.0.1  -Dsonar.coverageReportPaths=test_coverage.xml -Dsonar.host.url=https://sonarqube.refinitiv.com





apt update

apt -y install 



./gradlew build test jacocoTestReport sonarqube -Dsonar.projectKey=a250065-pricingsnapshot-web  -Dsonar.host.url=https://sonarqube.refinitiv.com  -Dsonar.login=356425e9a87eef9892cedd2e4c4daf8168ba202a -Dsonar.projectName=a250065-pricingsnapshot-web -Dsonar.branch.name=master -Dsonar.projectVersion=1.0.2



curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET "https://sonarqube.refinitiv.com/api/qualitygates/project_status?projectKey=a250065-pricingsnapshot-web&branch=master" -u 356425e9a87eef9892cedd2e4c4daf8168ba202a: | grep "\"projectStatus\":{\"status\":\"OK\""



curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET "https://sonarqube.refinitiv.com/api/qualitygates/project_status?projectKey=a250065-pricingsnapshot-cache&branch=master" -u 70386a4949d847cdd199d558140c774fbe8b97ab: | grep "\"projectStatus\":{\"status\":\"OK\""