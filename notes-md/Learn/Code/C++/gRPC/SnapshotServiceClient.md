SnapshotServiceClient.h

```javascript
#pragma once

#include <grpcpp/grpcpp.h>

#include "SnapshotService.grpc.pb.h"

#include <stdio.h>
#include <iostream>
#include <string>

/**
 * 
 *  Ref: https://www.gresearch.co.uk/article/lessons-learnt-from-writing-asynchronous-streaming-grpc-services-in-c/
 */
namespace Snapshot
{
    //! @brief gRPC SnapshotServiceClient
    class CSnapshotServiceClient
    {
    public:
        CSnapshotServiceClient(std::shared_ptr<grpc::Channel> channel);
        virtual ~CSnapshotServiceClient();
        //! @brief Assignment operator
        CSnapshotServiceClient& operator=(const CSnapshotServiceClient&) = delete;
        //! @brief Copy constructor
        CSnapshotServiceClient(const CSnapshotServiceClient &) = delete;

        // for Schedule POST, PUT
        bool SendRequest(const std::string& requestID, bool replace, const std::string snampshotTime, const std::string& rics, std::string &errMsg);
        // for Schedule DELETE
        bool CancelRequest(const std::string& requestID, std::string &errMsg);
        // for Immediate POST, Schedule GET
        bool GetSnapshotResult(const std::string& requestID, const std::string snampshotTime, const std::string& rics,
            std::string &errMsg, FILE *fp = stdout);
        // for cache server health check
        bool CacheServerHealthCheck(std::string &strMsg);

	// for internal debug
	bool GetActiveRicName(std::string &errMsg);
	bool DumpRicImage(const std::string &aRicName, std::string &errMsg);


    private:
        std::unique_ptr<SnapshotService::Stub> stub_;
    };
}


```

SnapshotServiceClient.cpp

```javascript
#include <thread>
#include <chrono>

#ifdef __linux__
#include <arpa/inet.h>
#endif

#include "SnapshotService.pb.h"
#include "SnapshotResponseHeader.pb.h"
#include "SnapshotServiceClient.h"

namespace Snapshot
{
    CSnapshotServiceClient::CSnapshotServiceClient(std::shared_ptr<grpc::Channel> channel): stub_(SnapshotService::NewStub(channel))
    {
    }


    CSnapshotServiceClient::~CSnapshotServiceClient()
    {
    }

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

    bool CSnapshotServiceClient::CancelRequest(const std::string& requestID, std::string &errMsg)
    {
        SnapshotRequest request;
        request.set_requestid(requestID);

        SnapshotAck   ack;
        grpc::ClientContext context;
        grpc::Status status = stub_->CancelRequest(&context, request, &ack);
        // Act upon its status.
        if (status.ok())
        {
            return true;
        }
        else
        {
            errMsg.assign("CancelRequest failed: {" + std::to_string(status.error_code()) + " " + status.error_message() + "}");
            return false;
        }
    }

    bool CSnapshotServiceClient::GetSnapshotResult(const std::string& requestID, const std::string snampshotTime,
        const std::string& rics, std::string &errMsg, FILE *fp)
    {
        SnapshotRequest request;
        request.set_requestid(requestID);
        if (!snampshotTime.empty())
        {
            request.set_snapshottime(snampshotTime);
        }
        if (!rics.empty())
        {
            request.set_rics(rics);
        }

        SnapshotResponse   response;
        grpc::ClientContext context;
        auto stream =  stub_->GetSnapshotResult(&context, request);
        bool hasProcessedFileheader = false;
        while (stream->Read(&response))
        {
            bool success = response.success();
            if (!success)
            {
                errMsg.assign("GetSnapshotResult failed: " + response.errmsg());
                return false;
            }
            if (!hasProcessedFileheader && response.has_headerdata())
            {
                fwrite(response.headerdata().data(), 1, response.headerdata().size(), fp);
                hasProcessedFileheader = true;
            }
            if (response.has_streamdata())
            {
                fwrite(response.streamdata().data(), 1, response.streamdata().size(), fp);
            }
        }

        return true;
    }

    bool CSnapshotServiceClient::GetActiveRicName(std::string &errMsg)
    {
        ::google::protobuf::Empty reEmpty;

        grpc::ClientContext context;
        grpc::Status status = stub_->GetActiveRicNames(&context, reEmpty, &reEmpty);
        if (status.ok())
        {
            return true;
        }
        else
        {
            errMsg.assign("GetActiveRicName failed: {" + std::to_string(status.error_code()) + " " + status.error_message() + "}");
            return false;
        }
    }

    bool CSnapshotServiceClient::DumpRicImage(const std::string &ricname, std::string &errMsg )
    {
        if (ricname.empty())
        {
            errMsg.assign("request ric name should not be empty");
            return false;
        }
        ::Snapshot::SnapshotDumpRicName request;
        request.set_ricname(ricname);

        ::google::protobuf::Empty reEmpty;
        grpc::ClientContext context;
        grpc::Status status = stub_->DumpRicImage(&context, request, &reEmpty);
        // Act upon its status.
        if (status.ok())
        {
            return true;
        }
        else
        {
            errMsg.assign("DumpRicImage failed: {" + std::to_string(status.error_code()) + " " + status.error_message() + "}");
            return false;
        }
    }

    bool CSnapshotServiceClient::CacheServerHealthCheck(std::string &strMsg)
    {
        std::string strFlag = "Not OK";
        ::google::protobuf::Empty reEmpty;
        CacheServerHealthCheckStatus response;
        grpc::ClientContext context;
        grpc::Status status = stub_->CacheServerHealthCheck(&context, reEmpty, &response);
        // status.
        if (status.ok())
        {
            std::string healthStatus = response.healthstatus();
            std::string::size_type idx = healthStatus.find(strFlag);

            if (idx != std::string::npos)
            {
                strMsg.assign(healthStatus);
                return false;
            }
            else
            {
                strMsg.assign(healthStatus);
                return true;
            }
        }
        else
        {
            strMsg.assign("CacheServer HealthCheck failed: {" + std::to_string(status.error_code()) + " " + status.error_message() + "}");
            return false;
        }
    }
}

```

