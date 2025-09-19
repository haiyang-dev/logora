> cmake -S . -B build -G "Visual Studio 17 2022" -A x64


生成visual studio 2022 sln文件

> cmake -S . -B build
> cmake --build build 相当于make & make install


cmake编译时要注意几点，首先类似于grpc、protobuf这种库，要*_BUILD_TESTING=OFF # 防止后续编译时找不到gtest 库，麻烦死

-DCMAKE_BUILD_TYPE=Release # 提升性能，但要从最底层的依赖库开始都要打开

一般执行完cmake命令后， 都会告诉你他生成在哪里了方便后续build and install

```
-- Configuring done (13.3s)
-- Generating done (30.2s)
-- Build files have been written to: /workspaces/ets-qe/extern/opentelemetry/opentelemetry-cpp/build
```

有些项目是需要进到source code后，创建一个build文件夹，但也有智障的，例如grpc,需要

```
mkdir -p cmake/build
pushd cmake/build
```

一般下载代码都需要下载thrid party, 例如

git clone --recurse-submodules --shallow-submodules -b v28.2 [https://github.com/protocolbuffers/protobuf.git](https://github.com/protocolbuffers/protobuf.git)

-DCMAKE_PREFIX_PATH=/workspaces/ets-qe/extern/opentelemetry/abseil-install

这个是说要去哪找相关的库，如果制定了prefix, 那先从这个路径找，然后再去/usr/lib64， 多个路径分号隔开"/usr;/usr/lib64;/usr/include;/workspaces/ets-qe/extern/protobuf.v28.2;/workspaces/ets-qe/extern/grpc.v1.67.0"

export Protobuf_DIR=/workspaces/ets-qe/extern/protobuf.v28.2/lib64/cmake/protobuf 效果和-DProtobuf_DIR=/workspaces/ets-qe/extern/protobuf.v28.2/lib64/cmake/protobuf 一致