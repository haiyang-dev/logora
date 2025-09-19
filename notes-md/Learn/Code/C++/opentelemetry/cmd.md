[https://github.com/open-telemetry/opentelemetry-cpp/tree/main](https://github.com/open-telemetry/opentelemetry-cpp/tree/main)

```bash
git clone https://github.com/abseil/abseil-cpp.git
mkdir abseil-install
cd abseil-cpp
mkdir build && cd build
cmake -DABSL_BUILD_TESTING=OFF -DCMAKE_BUILD_TYPE=Release -DABSL_USE_GOOGLETEST_HEAD=ON -DCMAKE_CXX_STANDARD=17 -DCMAKE_INSTALL_PREFIX=/workspaces/ets-qe/extern/opentelemetry/abseil-install ..
cmake --build . --target install
```

```
git clone --recurse-submodules --shallow-submodules -b v28.2 https://github.com/protocolbuffers/protobuf.git
mkdir protobuf-install
cd protobuf
cmake -S. -Bcmake-out \
	  -DCMAKE_INSTALL_PREFIX=/workspaces/ets-qe/extern/opentelemetry/protobuf-install \
	  -DCMAKE_CXX_STANDARD=17 \
	  -Dprotobuf_BUILD_TESTS=OFF \
	  -Dprotobuf_LOCAL_DEPENDENCIES_ONLY=ON \
	  -DCMAKE_BUILD_TYPE=Release \
	  -DCMAKE_PREFIX_PATH=/workspaces/ets-qe/extern/opentelemetry/abseil-install
	  
cmake --build /workspaces/ets-qe/extern/opentelemetry/protobuf/cmake-out --config Release --target install
```

```bash
git clone --recurse-submodules -b v1.67.0 --depth 1 --shallow-submodules https://github.com/grpc/grpc
mkdir grpc-install
cd grpc
mkdir -p cmake/build
pushd cmake/build
cmake -DgRPC_INSTALL=ON \
      -DgRPC_BUILD_TESTS=OFF \
      -DCMAKE_CXX_STANDARD=17 \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_INSTALL_PREFIX=/workspaces/ets-qe/extern/opentelemetry/grpc-install \
      ../..
make -j 4
make install
popd
```

```bash
export Protobuf_DIR=/workspaces/ets-qe/extern/opentelemetry/protobuf-install/lib64/cmake/protobuf
export gRPC_DIR=/workspaces/ets-qe/extern/opentelemetry/grpc-install/lib/cmake/grpc
export absl_DIR=/workspaces/ets-qe/extern/opentelemetry/abseil-install/lib64/cmake/absl
export utf8_range_DIR=/workspaces/ets-qe/extern/opentelemetry/protobuf-install/lib64/cmake/utf8_range 

git clone --recurse-submodules -b v1.19.0 --shallow-submodules https://github.com/open-telemetry/opentelemetry-cpp.git
mkdir opentelemetry-install
cd opentelemetry-cpp
mkdir build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_STANDARD=17 -DCMAKE_POSITION_INDEPENDENT_CODE=ON -DBUILD_TESTING=OFF -DWITH_OTLP_GRPC=ON -DWITH_OTLP_HTTP=ON -DWITH_PROMETHEUS=ON -DWITH_PROTOBUF=ON -DWITH_DEPRECATED_SDK_FACTORY=OFF -DCMAKE_INSTALL_PREFIX=/workspaces/ets-qe/extern/opentelemetry/opentelemetry-install
```

要小心不要-DWITH_ABSEIL=ON，好像有问题

-DCMAKE_BUILD_TYPE=Release 没完全测试过