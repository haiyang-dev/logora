

```javascript
echo "##### building for SonarQube scan... #####"
cd source/SnapshotCacheServer

echo "##### Downloading sonar build-wrapper-linux-x86.zip ... #####"
curl -O https://sonarqube.refinitiv.com/static/cpp/build-wrapper-linux-x86.zip
if (( $? == 0 )); then
    echo "##### sonar build wrapper download Success #####"
    unzip build-wrapper-linux-x86.zip
    chmod 755 build-wrapper-linux-x86/* -R
    echo "##### sonar build wrapper extraction Success #####"
fi
if (( $? != 0 )); then
    echo "##### sonar build wrapper download/extraction failed #####"
    exit 1
fi

echo "##### Downloading sonar sonar-scanner-cli-4.6.2.2472-linux.zip ... #####"
curl -O https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.6.2.2472-linux.zip
if (( $? == 0 )); then
    echo "##### sonar scanner download Success #####"
    unzip sonar-scanner-cli-4.6.2.2472-linux.zip
    chmod 755 sonar-scanner-4.6.2.2472-linux/* -R
    echo "##### sonar scanner extraction Success #####"
fi
if (( $? != 0 )); then
    echo "##### sonar scanner download/extraction failed #####"
    exit 1
fi

mkdir sonar_build_wrapper_output -p
rm sonar_build_wrapper_output/* -Rf

autoreconf -if
./configure --enable-coverage --enable-unittest
build-wrapper-linux-x86/build-wrapper-linux-x86-64 --out-dir sonar_build_wrapper_output make clean
build-wrapper-linux-x86/build-wrapper-linux-x86-64 --out-dir sonar_build_wrapper_output make check
if [ $? -ne 0 ]; then
    echo "##### ERROR: Failed to make clean/make check #####"
    exit 1
fi

cd ..
pip3 install gcovr
# -r . to fix the code path issue
gcovr -r . --sonarqube test_coverage.xml
# remove .libs to fix the path issue
sed -i 's/.libs\///g' test_coverage.xml

tag_name=$(git describe --exact-match --tags $(git log -n1 --pretty='%h'))
echo "Sonarqube scan version = ${tag_name}"

./SnapshotCacheServer/sonar-scanner-4.6.2.2472-linux/bin/sonar-scanner -Dsonar.sources=./SnapshotCacheServer/Components,./SnapshotCacheServer/Includes,./SnapshotCacheServer/Interfaces -Dsonar.cfamily.build-wrapper-output=./SnapshotCacheServer/sonar_build_wrapper_output -Dsonar.cfamily.cache.enabled=true -Dsonar.cfamily.cache.path=./SnapshotCacheServer/sonar_cache -Dsonar.cfamily.threads=8 -Dsonar.login=${LOGINTOKEN} -Dsonar.projectKey=${PROJECTKEY} -Dsonar.projectName=${PROJECTNAME} -Dsonar.branch.name=master -Dsonar.projectVersion=${tag_name}  -Dsonar.coverageReportPaths=test_coverage.xml -Dsonar.host.url=https://sonarqube.refinitiv.com
if (( $? != 0 )); then
    echo "##### The sonar scan app failed! #####"
    exit 1
fi
echo "##### building end #####"
```

