https://grpc.io/docs/languages/cpp/

https://doc.oschina.net/grpc?t=57966

https://github.com/grpc/grpc/releases



https://developers.google.com/protocol-buffers/docs/cpptutorial



git clone --recurse-submodules -b v1.30.0 https://github.com/grpc/grpc

cmake -S. -Bcmake-out \


	  -DCMAKE_INSTALL_PREFIX=/workspaces/ets-qe/extern/opentelemetry/protobuf \


	  -DCMAKE_CXX_STANDARD=17 \


	  -DCMAKE_PREFIX_PATH=/haiyang/absl  # Path to where I installed Abseil





cmake --build /workspaces/ets-qe/extern/opentelemetry/protobuf/cmake-out --config Release --target install



export PATH=${PATH}:/data/grpc/install/bin



$ protoc -I ../../Protobuf --grpc_out=. --plugin=protoc-gen-grpc=`which grpc_cpp_plugin` ../../Protobuf/SnapshotService.proto

$ protoc -I ../../Protobuf --cpp_out=. ../../Protobuf/SnapshotService.proto

$ protoc -I . --cpp_out=. ./SnapshotResponseHeader.proto



SnapshotService.proto ==> gRPC service definition used to define interface betwwen Snapshot Cache Server and Snapshot Web Server

SnapshotResponseHeader.proto ==> Proto definition for Snapshot Response message Header



protoc -I . --grpc_out=. --plugin=protoc-gen-grpc=`which grpc_cpp_plugin` ./SnapshotService.proto

protoc -I . --cpp_out=. ./SnapshotService.proto