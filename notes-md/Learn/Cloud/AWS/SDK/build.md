c++

[https://docs.aws.amazon.com/sdk-for-cpp/v1/developer-guide/cmake-params.html](https://docs.aws.amazon.com/sdk-for-cpp/v1/developer-guide/cmake-params.html)

Linux:

vi cmake/compiler_settings.cmake  Line 52

Change "-Werror" into "-Wno-error"

**dynamic library**

/data/haiyang/cmake-3.18.0/bin/cmake  ../aws-sdk-cpp-1.7.178 -DBUILD_ONLY="s3;elasticache;sns;sqs;lambda;ssm" -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/data/aws -DBUILD_SHARED_LIBS=ON -DCUSTOM_MEMORY_MANAGEMENT=OFF

**static library**

/data/haiyang/cmake-3.18.0/bin/cmake  ../aws-sdk-cpp-1.7.178 -DBUILD_ONLY="s3;elasticache;sns;sqs;lambda;ssm" -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/data/aws -DBUILD_SHARED_LIBS=OFF -DCUSTOM_MEMORY_MANAGEMENT=OFF

make make install

Windows:

[https://www.megalacant.com/techblog/2019/02/28/building-aws-cpp-sdk-windows.html](https://www.megalacant.com/techblog/2019/02/28/building-aws-cpp-sdk-windows.html)

cmake D:\running\aws-sdk-cpp-1.7.178 -G "Visual Studio 14 Win64" -DBUILD_ONLY="s3;elasticache;sns;sqs;lambda" -DBUILD_SHARED_LIBS=OFF -DCUSTOM_MEMORY_MANAGEMENT=OFF

cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=D:\awssdk -DCMAKE_PREFIX_PATH=D:\awssdk --build .

msbuild INSTALL.vcxproj /p:Configuration=Release

msbuild INSTALL.vcxproj /p:Configuration=Debug

mkdir build

cd crt

git clone --recurse-submodules [https://github.com/awslabs/aws-crt-cpp.git](https://github.com/awslabs/aws-crt-cpp.git)

git checkout b5577fa39c3a11f09c06db10ac6eaaca3910cbe2

cmake ../../aws-sdk-cpp-1.11.479 -DBUILD_ONLY="s3;" -DBUILD_SHARED_LIBS=OFF -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=../lib64

cmake --build .

cmake --install .