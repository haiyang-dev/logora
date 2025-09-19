yum install -y python3 gcc gcc-c++

pip3 install gcovr

gcovr -r . --sonarqube test_coverage.xml

sed -i 's/.libs\///g' test_coverage.xml