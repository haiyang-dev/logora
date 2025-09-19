1. 使用grpc，需要先定义proto文件

```javascript
syntax = "proto2";

import "google/protobuf/empty.proto";

option java_package = "com.refinitiv.timeseries.snapshot";
option java_outer_classname = "SnapshotProto";

package Snapshot;

service SnapshotService
{
    rpc SendRequest(SnapshotRequest) returns (SnapshotAck);   // for Schedule POST, PUT
}

message SnapshotAck
{
    optional bool    success   = 1;
    optional string  errmsg    = 2;
}
```



2. 然后用命令生成代码

https://grpc.io/docs/languages/cpp/basics/

- route_guide.pb.h, the header which declares your generated message classes

- route_guide.pb.cc, which contains the implementation of your message classes

- route_guide.grpc.pb.h, the header which declares your generated service classes

- route_guide.grpc.pb.cc, which contains the implementation of your service classes

3. 在service端添加方法 SendRequest

```javascript
::grpc::Status CSyncSnapshotService::SendRequest(::grpc::ServerContext* context, const ::Snapshot::SnapshotRequest* request,
        ::Snapshot::SnapshotAck* response)
```

4. 在client端调用service方法

```javascript
bool CSnapshotServiceClient::SendRequest(const std::string& requestID, bool replace, const std::string snampshotTime, 
        const std::string& rics, std::string &errMsg)
    {
        SnapshotRequest request;
        request.set_requestid(requestID);
        request.set_replace(replace);
        if (!snampshotTime.empty())
        {
            request.set_snapshottime(snampshotTime);
        }
        if (rics.empty())
        {
            errMsg.assign("request ric list should not be empty");
            return false;
        }
        request.set_rics(rics);

        SnapshotAck   ack;
        grpc::ClientContext context;
        grpc::Status status = stub_->SendRequest(&context, request, &ack);
        // Act upon its status.
        if (status.ok())
        {
            return true;
        }
        else
        {
            errMsg.assign("SendRequest failed: {" + std::to_string(status.error_code()) + " " + status.error_message() + "}");
            return false;
        }
    }
```

5. 写一个main函数，调用client函数

