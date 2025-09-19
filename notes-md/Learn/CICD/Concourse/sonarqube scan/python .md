generate code scan

nosetests -w .\test\ --with-coverage --cover-xml --cover-xml-file=coverage.xml --with-xunit --xunit-file=xunit.xml

nosetests -w .\ --exclude-dir=\venv --with-coverage --cover-xml --cover-xml-file=coverage.xml --with-xunit --xunit-file=xunit.xml

```
nosetests -w ./ --with-coverage --cover-xml --cover-xml-file=coverage.xml --with-xunit --xunit-file=xunit.xml
python3 -m coverage run -m unittest
python3 -m coverage xml
```

```
pip3 install ETSPythonCommon==0.3.0 --upgrade --extra-index-url 
pip3 install ClassGenerator==0.0.2 --upgrade --extra-index-url 
pip3 install moto==3.1.18 --upgrade
pip3 install boto3==1.24.39 --upgrade
pip3 install kubernetes==24.2.0 --upgrade
pip3 install coverage==6.5.0 --upgrade
pip3 install nose==1.3.7 --upgrade
```

```
${SONAR_SCANNER_CLI_BIN}/bin/sonar-scanner \
-Dsonar.sources=./AuxiliaryDataReloader \
-Dsonar.login=${SONAR_AUXILIARY_TOKEN} \
-Dsonar.projectKey=a206160-tscc-is-auxiliary-data-reloader \
-Dsonar.projectName=a206160-tscc-is-auxiliary-data-reloader \
-Dsonar.python.coverage.reportPaths=./AuxiliaryDataReloader/coverage.xml \
-Dsonar.python.xunit.skipDetails=true \
-Dsonar.python.xunit.reportPath=./AuxiliaryDataReloader/xunit.xml \
-Dsonar.language=py \
-Dsonar.scm.disabled=true \
-Dsonar.qualitygate.wait=True \
-Dsonar.python.version=3 \
-Dsonar.branch.name=${CI_COMMIT_REF_NAME} \
-Dsonar.projectVersion=${CI_COMMIT_TAG} \
-Dsonar.host.url=https://sonarqube.refinitiv.com
```