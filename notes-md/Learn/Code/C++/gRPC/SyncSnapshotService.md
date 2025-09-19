SyncSnapshotService.h

```javascript
#pragma once

#include <grpcpp/grpcpp.h>
#include <grpcpp/health_check_service_interface.h>
#include <grpcpp/ext/proto_server_reflection_plugin.h>

#include <boost/filesystem/operations.hpp>
#include <boost/filesystem/path.hpp>

#include "SnapshotService.grpc.pb.h"
#include "SnapshotConstant.h"

class ISnapshotCapsule;


/**
 * 
 *  Ref: https://www.gresearch.co.uk/article/lessons-learnt-from-writing-asynchronous-streaming-grpc-services-in-c/
 */
namespace Snapshot
{
    //! @brief Constants namespace
    namespace Constants
    {
        static const std::string SOURCE_ELEMENT_SEPARATOR = "_";
    }

    // forward delcaration
    class CSnapshotDispatcher;

    struct SnapshotBuffer
    {
        SnapshotBuffer(int32_t size);
        ~SnapshotBuffer();

        const int32_t    alloc;
        int32_t          used;
        void            *buf;
    };


    //! @brief Synchronous gRPC SnapshotService
    class CSyncSnapshotService :
        public Snapshot::SnapshotService::Service
    {
    public:
        CSyncSnapshotService(CSnapshotDispatcher *parent);
        virtual ~CSyncSnapshotService();
        //! @brief Assignment operator
        CSyncSnapshotService& operator=(const CSyncSnapshotService&) = delete;
        //! @brief Copy constructor
        CSyncSnapshotService(const CSyncSnapshotService &) = delete;

        // for Schedule POST, PUT
        virtual ::grpc::Status SendRequest(::grpc::ServerContext* context, const ::Snapshot::SnapshotRequest* request, 
            ::Snapshot::SnapshotAck* response);
        // for Schedule DELETE
        virtual ::grpc::Status CancelRequest(::grpc::ServerContext* context, const ::Snapshot::SnapshotRequest* request, 
            ::Snapshot::SnapshotAck* response);
        // for Immediate POST, Schedule GET
        virtual ::grpc::Status GetSnapshotResult(::grpc::ServerContext* context, const ::Snapshot::SnapshotRequest* request, 
            ::grpc::ServerWriter< ::Snapshot::SnapshotResponse>* writer);

	    // for internal use
	    ::grpc::Status GetActiveRicNames(::grpc::ServerContext* context, const ::google::protobuf::Empty* request, ::google::protobuf::Empty* response);
	    ::grpc::Status DumpRicImage(::grpc::ServerContext* context, const ::Snapshot::SnapshotDumpRicName* request, ::google::protobuf::Empty* response);
        ::grpc::Status CacheServerHealthCheck(::grpc::ServerContext* context, const ::google::protobuf::Empty* request,
            ::Snapshot::CacheServerHealthCheckStatus* response);

    private:
        virtual ::grpc::Status GetOnDemandSnapshotResult(::grpc::ServerContext* context, const ::Snapshot::SnapshotRequest* request,
            ::grpc::ServerWriter< ::Snapshot::SnapshotResponse>* writer);

        bool ReplyData(const std::string& requestID, ISnapshotCapsule *pResponseCapsule, 
            ::grpc::ServerWriter< ::Snapshot::SnapshotResponse>* writer, SnapshotBuffer *snapshotBuf);
        bool SendData(::grpc::ServerWriter< ::Snapshot::SnapshotResponse>* writer, SnapshotBuffer *snapshotBuf);
        grpc::StatusCode ReplyDataFile(const std::string& requestID, ::grpc::ServerWriter< ::Snapshot::SnapshotResponse>* writer,
            const std::string &dataFilename, std::string &errMsg);

        CSnapshotDispatcher    *m_Parent;
        std::string             m_SnapshotResponseFileHeader;

    };

    class CSyncSnapshotServerImpl
    {
    public:
        CSyncSnapshotServerImpl(CSnapshotDispatcher *parent);
        virtual ~CSyncSnapshotServerImpl();
        //! @brief Assignment operator
        CSyncSnapshotServerImpl& operator=(const CSyncSnapshotServerImpl&) = delete;
        //! @brief Copy constructor
        CSyncSnapshotServerImpl(const CSyncSnapshotServerImpl &) = delete;

        void Run();
        void Shutdown();

    private:
        CSnapshotDispatcher           *m_Parent;
        std::unique_ptr<grpc::Server>  m_Server;
    };
}


```

SyncSnapshotService.cpp

```javascript
#include "stdafx.h"

#include <thread>
#include <chrono>
#include <memory>
#ifdef __linux__
#include <arpa/inet.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#endif

#include "ISnapshotCapsule.h"

#include "SnapshotService.pb.h"
#include "SnapshotResponseHeader.pb.h"
#include "SnapshotHelper.h"
#include "SnapshotEventIds.h"
#include "SnapshotFileFormat.h"

#include "SnapshotDispatcherImpl/SyncSnapshotService.h"
#include "SnapshotDispatcherImpl/SnapshotDispatcher.h"

namespace Snapshot
{
    SnapshotBuffer::SnapshotBuffer(int32_t size): alloc(size), used(0)
    {
        buf = malloc(size);
    }

    SnapshotBuffer::~SnapshotBuffer()
    {
        if (buf)
        {
            free(buf);
            buf = nullptr;
        }
    }

    CSyncSnapshotService::CSyncSnapshotService(CSnapshotDispatcher *parent)
        : m_Parent(parent)
    {
        m_SnapshotResponseFileHeader = GetSnapshotFileHeader();
    }


    CSyncSnapshotService::~CSyncSnapshotService()
    {
    }

    ::grpc::Status CSyncSnapshotService::GetActiveRicNames(::grpc::ServerContext* context, const ::google::protobuf::Empty* request, 
        ::google::protobuf::Empty* response) 
    {
        return ::grpc::Status(m_Parent->GetActiveRicName(), "");
    }

    ::grpc::Status CSyncSnapshotService::DumpRicImage(::grpc::ServerContext* context, const ::Snapshot::SnapshotDumpRicName* request, 
        ::google::protobuf::Empty* response) 
    {
        return ::grpc::Status(m_Parent->DumpRicImage(request->ricname()), "");
    }

    ::grpc::Status CSyncSnapshotService::CacheServerHealthCheck(::grpc::ServerContext* context, const ::google::protobuf::Empty* request,
        ::Snapshot::CacheServerHealthCheckStatus* response)
    {
        std::string errMsg;
        std::string healthCheckStatus;
        grpc::StatusCode statusCode;
        statusCode = m_Parent->HealthCheck(healthCheckStatus);
        if (statusCode == grpc::StatusCode::OK)
        {
            response->set_healthstatus(healthCheckStatus);
            return ::grpc::Status::OK;
        }
        else
        {
            return ::grpc::Status(statusCode, healthCheckStatus);
        }
    }

    ::grpc::Status CSyncSnapshotService::SendRequest(::grpc::ServerContext* context, const ::Snapshot::SnapshotRequest* request,
        ::Snapshot::SnapshotAck* response)
    {
        static wchar_t pszMethod[] = L"CSyncSnapshotService::SendRequest";

        const std::string& requestID = request->requestid();
        std::string snapshotTime;
        if (request->has_snapshottime())
        {
            snapshotTime = request->snapshottime();
        }
        bool replace = false;
        if (request->has_replace())
        {
            replace = request->replace();
        }
        if (m_Parent->GetDebugAll())
        {
            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_RECEIVED_REQUEST_PARAMETER_INFO,
                m_Parent->GetComponentType(), requestID, snapshotTime, request->has_rics(), replace);
        }
        const std::string& rics = request->rics();
        std::string errMsg;
        grpc::StatusCode statusCode;
        statusCode = m_Parent->SnapShotScheduleRequest(requestID, snapshotTime, replace, rics, errMsg);
        if (statusCode == grpc::StatusCode::OK)
        {
            response->set_success(true);
            return ::grpc::Status::OK;
        }
        else
        {
            response->set_errmsg(errMsg);
            response->set_success(false);
        }

        return ::grpc::Status(statusCode, errMsg);
    }

    ::grpc::Status CSyncSnapshotService::CancelRequest(::grpc::ServerContext* context, const ::Snapshot::SnapshotRequest* request,
        ::Snapshot::SnapshotAck* response)
    {
        static wchar_t pszMethod[] = L"CSyncSnapshotService::CancelRequest";

        const std::string& requestID = request->requestid();
        std::string snapshotTimestamp;
        if (request->has_snapshottime())
        {
            snapshotTimestamp = request->snapshottime();
        }
        if (m_Parent->GetDebugAll())
        {
            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_RECEIVED_REQUEST_PARAMETER_INFO,
                m_Parent->GetComponentType(), requestID, snapshotTimestamp, request->has_rics(), false);
        }

        std::string errMsg;
        grpc::StatusCode statusCode = m_Parent->CancelScheduleRequest(requestID, true, errMsg);
        if (statusCode == grpc::StatusCode::OK)
        {
            response->set_success(true);
            return ::grpc::Status::OK;
        }
        else
        {
            response->set_errmsg(errMsg);
            response->set_success(false);
        }

        return ::grpc::Status(statusCode, errMsg);
    }

    ::grpc::Status CSyncSnapshotService::GetSnapshotResult(::grpc::ServerContext* context, 
        const ::Snapshot::SnapshotRequest* request,
        ::grpc::ServerWriter< ::Snapshot::SnapshotResponse>* writer)
    {
        static wchar_t pszMethod[] = L"CSyncSnapshotService::GetSnapshotResult";
        grpc::StatusCode statusCode = grpc::StatusCode::OK;
        bool   bSendResult = true;

        // context->set_compression_algorithm(GRPC_COMPRESS_GZIP);
        // context->set_compression_level(GRPC_COMPRESS_LEVEL_HIGH);
        auto startTime = std::chrono::high_resolution_clock::now();
        std::string requestID = request->requestid();
        std::string snapshotTimestamp;
        if (request->has_snapshottime())
        {
            snapshotTimestamp  = request->snapshottime();
        }
        if (m_Parent->GetDebugAll())
        {
            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_RECEIVED_REQUEST_PARAMETER_INFO,
                m_Parent->GetComponentType(), requestID, snapshotTimestamp, request->has_rics(), false);
        }
        if (snapshotTimestamp.empty() || snapshotTimestamp == "0")  // immediate request
        {
            return GetOnDemandSnapshotResult(context, request, writer);
        }
        
        std::string errMsg;
        ::Snapshot::SnapshotResponse snapshotResponse;
        if (m_Parent->GetDebugAll())
        {
            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_4,
                m_Parent->GetComponentType(), std::string("perf measure sync snapshotservice #"), 
                requestID, std::string("onScheduleRequest"));
        }

        ScheduleResponseEntry *pEntry = nullptr;
        statusCode = m_Parent->GetSnapshotResponseBlocking(requestID, &pEntry, errMsg);
        if (m_Parent->GetDebugAll())
        {
            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_5,
                m_Parent->GetComponentType(), std::string("GetSnapshotResponseBlocking return"), statusCode,
                std::string("requestID"), requestID);
        }
        if (statusCode == grpc::StatusCode::OK)
        {
            bool hasValidResponse = false;
            {
                boost::unique_lock<boost::shared_mutex> writeLock(*(pEntry->mutext));
                bool hasSendHeader = false;
                SnapshotBuffer  snapshotBuf(m_Parent->m_Configs.sendPacaketSize);
                if (pEntry->l1_responses)     // first retrieval
                {
                    ISnapshotCapsule *pSnapshotCapsule = nullptr;
                    bool bPopResult = false;
                    while (true)
                    {
                        bPopResult = pEntry->l1_responses->pop(pSnapshotCapsule);
                        if (bPopResult)
                        {
                            if (pSnapshotCapsule->IsCompleteRecord())
                            {
                                if (m_Parent->GetDebugAll())
                                {
                                    m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_3,
                                        m_Parent->GetComponentType(), std::string("snapshot receive finish data"), requestID);
                                }
                                pSnapshotCapsule->RelRef();

                                break;
                            }

                            if (!hasSendHeader)
                            {
                                snapshotResponse.set_success(true);
                                snapshotResponse.set_headerdata(m_SnapshotResponseFileHeader);
                                bSendResult = writer->Write(snapshotResponse);
                                if (!bSendResult)
                                {
                                    m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::FAILED_IN_DATA_TRANSFER,
                                        m_Parent->GetComponentType(), requestID, std::string("write header"));
                                    return ::grpc::Status::CANCELLED;
                                }
                                hasSendHeader = true;
                            }

                            bSendResult = ReplyData(requestID, pSnapshotCapsule, writer, &snapshotBuf);
                            pSnapshotCapsule->RelRef();
                            if (!bSendResult)
                            {
                                m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::FAILED_IN_DATA_TRANSFER,
                                    m_Parent->GetComponentType(), requestID, std::string("write message"));
                                return ::grpc::Status::CANCELLED;
                            }
                            else
                            {
                                hasValidResponse = true;
                            }
                        }
                        else
                        {
                            std::this_thread::sleep_for(std::chrono::milliseconds(1));
                            auto now = std::chrono::high_resolution_clock::now();
                            int64 usedTime = std::chrono::duration_cast<std::chrono::nanoseconds>(now - startTime).count();
                            if (usedTime >= m_Parent->m_Configs.requestTimeoutInNano)
                            {
                                m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_PROCESSING_TIMEOUT,
                                    m_Parent->GetComponentType(), requestID,
                                    m_Parent->m_Configs.requestTimeoutInNano, pEntry->requestStreams.count());
                                break;
                            }
                        }
                    }
                }
                else if (!pEntry->l2_responses.empty())       // later retrieval and in one minute
                {
                    if (m_Parent->GetDebugAll())
                    {
                        m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_3,
                            m_Parent->GetComponentType(), std::string("l2_responses will begin to send response for #"), requestID);
                    }

                    if (!pEntry->l2_responses.empty())
                    {
                        snapshotResponse.set_success(true);
                        snapshotResponse.set_headerdata(m_SnapshotResponseFileHeader);
                        bSendResult = writer->Write(snapshotResponse);
                        if (!bSendResult)
                        {
                            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::FAILED_IN_DATA_TRANSFER,
                                m_Parent->GetComponentType(), requestID, std::string(" header from l2 response"));
                            return ::grpc::Status::CANCELLED;
                        }
                        else
                        {
                            hasValidResponse = true;
                        }
                    }

                    for (auto it = pEntry->l2_responses.begin(); it != pEntry->l2_responses.end(); ++it)
                    {
                        bSendResult = ReplyData(requestID, *it, writer, &snapshotBuf);
                        if (!bSendResult)
                        {
                            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::FAILED_IN_DATA_TRANSFER,
                                m_Parent->GetComponentType(), requestID, std::string("l2 response cache"));
                            return ::grpc::Status::CANCELLED;
                        }
                    }
                }
                else
                {
                    m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_CACHE_NOTFOUND,
                        m_Parent->GetComponentType(), requestID, std::string("no l1 and l2 cache found"));
                    return ::grpc::Status(grpc::StatusCode::NOT_FOUND, "no l1 and l2 cache found");
                }
                if (snapshotBuf.used > 0)
                {
                    SendData(writer, &snapshotBuf);
                }
            }

            pEntry->CleanupL1WithoutLock();
            if (m_Parent->GetDebugAll())
            {
                m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_4,
                    m_Parent->GetComponentType(), std::string("perf measure sync snapshotservice #"), 
                    requestID, std::string("finished"));
            }

            if (!hasValidResponse)
            {
                m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_CACHE_NOTFOUND,
                    m_Parent->GetComponentType(), requestID, std::string("no valid data found"));
                return ::grpc::Status(grpc::StatusCode::NOT_FOUND, "no valid data found");
            }
            return ::grpc::Status::OK;
        }        
        else
        {
            // not cached, check whether it exists on local disk
            std::string  responseFilename = m_Parent->GetScheduleLocalFilename(requestID);
            if (boost::filesystem::is_regular_file(responseFilename))
            {
                grpc::StatusCode status = ReplyDataFile(requestID, writer, responseFilename, errMsg);
                if (status != grpc::StatusCode::OK)
                {
                    m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_PROCESS_DATAFILE_FAILED,
                        m_Parent->GetComponentType(), requestID, responseFilename, errMsg);
                    snapshotResponse.set_success(false);
                    snapshotResponse.set_errmsg(errMsg);
                    writer->Write(snapshotResponse);
                    return ::grpc::Status(status, errMsg);
                }
                else
                {
                    return ::grpc::Status::OK;
                }
            }

            errMsg.assign(std::string("no corresponding schedule result file found: ") + responseFilename);
            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_PROCESS_FAILED,
                m_Parent->GetComponentType(), requestID, errMsg);
            snapshotResponse.set_success(false);
            snapshotResponse.set_errmsg(errMsg);
            writer->Write(snapshotResponse);
            return ::grpc::Status(statusCode, errMsg);
        }

        return ::grpc::Status::OK;
    }

    ::grpc::Status CSyncSnapshotService::GetOnDemandSnapshotResult(::grpc::ServerContext* context, 
        const ::Snapshot::SnapshotRequest* request,
        ::grpc::ServerWriter< ::Snapshot::SnapshotResponse>* writer)
    {
        static wchar_t pszMethod[] = L"CSyncSnapshotService::GetOnDemandSnapshotResult";
        grpc::StatusCode statusCode = grpc::StatusCode::OK;
        bool   bSendResult = true;

        auto startTime = std::chrono::high_resolution_clock::now();
        std::string requestID = request->requestid();
        if (m_Parent->GetDebugAll())
        {
            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_4,
                m_Parent->GetComponentType(), std::string("perf measure sync snapshotservice #"), 
                requestID, std::string("onDemandRequest"));
        }

        const std::string& rics = request->rics();
        int32_t     ricCount = 0;
        std::string errMsg;
        ::Snapshot::SnapshotResponse snapshotResponse;
        std::shared_ptr<OnDemandResponseEntry> pEntry(new OnDemandResponseEntry,
                                                 [](OnDemandResponseEntry *p)
                                                 {
                                                      p->CleanupL1WithoutLock();
                                                      delete p;
                                                 });
        statusCode = m_Parent->SnapShotOnDemandRequest(pEntry.get(), requestID, rics, &ricCount, errMsg);
        if (statusCode != grpc::StatusCode::OK)
        {
            snapshotResponse.set_success(false);
            snapshotResponse.set_errmsg(errMsg);
            writer->Write(snapshotResponse);
            return ::grpc::Status(statusCode, errMsg);
        }

        bool hasValidResponse = false;
        // calculate ready time
        {
            ++m_Parent->m_DispatcherStats.m_TotImmediateRequestCount;
            auto endTime = std::chrono::high_resolution_clock::now();
            int64 usedTime = std::chrono::duration_cast<std::chrono::nanoseconds>(endTime - startTime).count();
            m_Parent->m_DispatcherStats.m_TotImmediateReadyTime += usedTime;
            m_Parent->m_ImmediateReadyLatencyMetric->IncreaseMolecular(usedTime);
            m_Parent->m_ImmediateReadyLatencyMetric->IncreaseDenominator(ricCount);
        }

        bool hasSendHeader = false;
        SnapshotBuffer  snapshotBuf(m_Parent->m_Configs.sendPacaketSize);
        ISnapshotCapsule *pSnapshotCapsule = nullptr;
        bool bPopResult = false;
        while (true)
        {
            bPopResult = pEntry->l1_responses->pop(pSnapshotCapsule);
            if (bPopResult)
            {
                if (pSnapshotCapsule->IsCompleteRecord())
                {
                    if (m_Parent->GetDebugAll())
                    {
                        m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_3,
                            m_Parent->GetComponentType(), std::string("snapshot receive finish data"), requestID);
                    }
                    pSnapshotCapsule->RelRef();

                    break;
                }

                if (!hasSendHeader)
                {
                    snapshotResponse.set_success(true);
                    snapshotResponse.set_headerdata(m_SnapshotResponseFileHeader);
                    bSendResult = writer->Write(snapshotResponse);
                    if (!bSendResult)
                    {
                        m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::FAILED_IN_DATA_TRANSFER,
                            m_Parent->GetComponentType(), requestID, std::string("write header"));
                        return ::grpc::Status::CANCELLED;
                    }
                    hasSendHeader = true;
                }

                bSendResult = ReplyData(requestID, pSnapshotCapsule, writer, &snapshotBuf);
                pSnapshotCapsule->RelRef();
                if (!bSendResult)
                {
                    m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::FAILED_IN_DATA_TRANSFER,
                        m_Parent->GetComponentType(), requestID, std::string("write message"));
                    return ::grpc::Status::CANCELLED;
                }
                else
                {
                    hasValidResponse = true;
                }
            }
            else
            {
                std::this_thread::sleep_for(std::chrono::milliseconds(1));
                auto now = std::chrono::high_resolution_clock::now();
                int64 usedTime = std::chrono::duration_cast<std::chrono::nanoseconds>(now - startTime).count();
                if (usedTime >= m_Parent->m_Configs.requestTimeoutInNano)
                {
                    m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_PROCESSING_TIMEOUT,
                        m_Parent->GetComponentType(), requestID,
                        m_Parent->m_Configs.requestTimeoutInNano, pEntry->requestStreams.count());
                    break;
                }
            }
        }
        if (snapshotBuf.used > 0)
        {
            SendData(writer, &snapshotBuf);
        }

        if (m_Parent->GetDebugAll())
        {
            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_4,
                m_Parent->GetComponentType(), std::string("perf measure sync snapshotservice #"),
                requestID, std::string("finished"));
        }
        // calculate overall roundtrip time
        {
            auto endTime = std::chrono::high_resolution_clock::now();
            int64 usedTime = std::chrono::duration_cast<std::chrono::nanoseconds>(endTime - startTime).count();
            m_Parent->m_DispatcherStats.m_TotImmediateProcessedTime += usedTime;
            m_Parent->m_ImmediateProcessLatencyMetric->IncreaseMolecular(usedTime);
            m_Parent->m_ImmediateProcessLatencyMetric->IncreaseDenominator(ricCount);
        }

        if (!hasValidResponse)
        {
            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_CACHE_NOTFOUND,
                m_Parent->GetComponentType(), requestID, std::string("no valid data found"));
            return ::grpc::Status(grpc::StatusCode::NOT_FOUND, "no valid data found");
        }
        return ::grpc::Status::OK;
    }


    bool CSyncSnapshotService::ReplyData(const std::string& requestID,  ISnapshotCapsule *pCapsule,
        ::grpc::ServerWriter< ::Snapshot::SnapshotResponse>* writer, SnapshotBuffer *snapshotBuf)
    {
        static wchar_t pszMethod[] = L"CSyncSnapshotService::ReplyData";
        bool result = true;

        const char *pActualData = pCapsule->GetActualData();
        int32_t actualDataSize = static_cast<int32_t>(pCapsule->GetActualDataLength());
        if (pActualData == nullptr || actualDataSize == 0)
        {
            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_INVALID_RESPONSE_CAPSULE_MSG,
                m_Parent->GetComponentType(), requestID, pCapsule->GetRicName());
            return result;
        }

        SnapshotResponseHeader msgHeader;
        std::string msgHeaderStr;
        msgHeader.set_ricname(pCapsule->GetRicName());
        msgHeader.set_snapshottime(pCapsule->GetSnapshotTime());
        msgHeader.set_lastupdatetime(pCapsule->GetLastUpdateTime());
        msgHeader.set_snapshotrequestid(requestID);
        msgHeader.SerializeToString(&msgHeaderStr);
        int16_t headerSize = static_cast<int16_t>(msgHeaderStr.size());

        // mark total size
        int32_t totalSize = Snapshot::Functors::GetFixedHeaderSize() + headerSize + actualDataSize;
        if (snapshotBuf->used + totalSize > snapshotBuf->alloc)
        {
            result = SendData(writer, snapshotBuf);
        }

        char *pTargetBuf = (char *)snapshotBuf->buf + snapshotBuf->used;
        *(uint32 *)pTargetBuf = htonl((uint32)totalSize);
        pTargetBuf += 4;
        // mark header size
        *(uint16 *)pTargetBuf = htons((uint16)headerSize);
        pTargetBuf += 2;
        // fill header properties
        memcpy(pTargetBuf, msgHeaderStr.c_str(), headerSize);
        pTargetBuf += headerSize;
        // fill paylaod
        if (actualDataSize > 0)
        {
            memcpy(pTargetBuf, pActualData, actualDataSize);
        }
        snapshotBuf->used += totalSize;

        return result;
    }

    grpc::StatusCode CSyncSnapshotService::ReplyDataFile(const std::string& requestID, 
        ::grpc::ServerWriter<::Snapshot::SnapshotResponse>* writer, 
        const std::string &dataFilename, std::string &errMsg)
    {
        static wchar_t pszMethod[] = L"CSyncSnapshotService::ReplyDataFile";
        char cBuf[64];

        SnapshotBuffer  snapshotBuf(m_Parent->m_Configs.sendPacaketSize);
        int fd = open(dataFilename.c_str(), O_RDONLY);
        if (fd < 0)
        {
            errMsg = strerror(errno);
            return grpc::StatusCode::INTERNAL;
        }
        read(fd, cBuf, m_SnapshotResponseFileHeader.size());

        ::Snapshot::SnapshotResponse snapshotResponse;
        snapshotResponse.set_success(true);
        snapshotResponse.set_headerdata(cBuf, m_SnapshotResponseFileHeader.size());
        bool bSendResult = writer->Write(snapshotResponse);
        if (!bSendResult)
        {
            m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::FAILED_IN_DATA_TRANSFER,
                m_Parent->GetComponentType(), requestID, dataFilename);
            close(fd);
            return ::grpc::StatusCode::UNKNOWN;
        }
        else
        {
            if (m_Parent->GetDebugAll())
            {
                m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_4,
                    m_Parent->GetComponentType(), requestID, std::string("send snapshot response header from"), dataFilename);
            }
        }
        while ((snapshotBuf.used = read(fd, snapshotBuf.buf, snapshotBuf.alloc)) > 0)
        {
            if (!SendData(writer, &snapshotBuf))
            {
                m_Parent->GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::FAILED_IN_DATA_TRANSFER,
                    m_Parent->GetComponentType(), requestID, std::string("record from file") + dataFilename);
                close(fd);
                return ::grpc::StatusCode::UNKNOWN;
            }
        }

        close(fd);
        return grpc::StatusCode::OK;
    }

    bool CSyncSnapshotService::SendData(::grpc::ServerWriter< ::Snapshot::SnapshotResponse>* writer, SnapshotBuffer *snapshotBuf)
    {
        ::Snapshot::SnapshotResponse response;
        response.set_success(true);
        response.set_streamdata(snapshotBuf->buf, snapshotBuf->used);
        bool result = writer->Write(response);

        m_Parent->m_DispatcherStats.m_ReceievedSnapshotResponseBytes += snapshotBuf->used;
        snapshotBuf->used = 0;

        return result;
    }

    CSyncSnapshotServerImpl::CSyncSnapshotServerImpl(CSnapshotDispatcher *parent) : m_Parent(parent)
    {
    }


    CSyncSnapshotServerImpl::~CSyncSnapshotServerImpl()
    {
        Shutdown();
    }

    void CSyncSnapshotServerImpl::Run()
    {
        char cListenAddress[Snapshot::Constants::Defaults::MAX_RICNAME_LEN];
        sprintf(cListenAddress, "%s:%d", m_Parent->m_Configs.listenAddress.c_str(), m_Parent->m_Configs.listenPort);

        CSyncSnapshotService syncSnapshotService(m_Parent);
        grpc::EnableDefaultHealthCheckService(true);
        grpc::reflection::InitProtoReflectionServerBuilderPlugin();
        grpc::ServerBuilder builder;
        // Listen on the given address without any authentication mechanism.
        builder.AddListeningPort(cListenAddress, grpc::InsecureServerCredentials());
        // specify thread pool size
        builder.SetSyncServerOption(grpc::ServerBuilder::SyncServerOption::MIN_POLLERS, m_Parent->m_Configs.minPollers);
        builder.SetSyncServerOption(grpc::ServerBuilder::SyncServerOption::MAX_POLLERS, m_Parent->m_Configs.maxPollers);
        // Register "service" as the instance through which we'll communicate with
        // clients. In this case it corresponds to an *synchronous* service.
        builder.RegisterService(&syncSnapshotService);
        // Finally assemble the server.
        m_Server = builder.BuildAndStart();

        m_Parent->LogMessage(WARNING_LEVEL_INFORMATION, L"grpc service is now listening on %s", cListenAddress);

        // Wait for the server to shutdown. Note that some other thread must be
        // responsible for shutting down the server for this call to ever return.
        m_Server->Wait();
    }

    void CSyncSnapshotServerImpl::Shutdown()
    {
        if (m_Server)
        {
            m_Server->Shutdown();
        }
    }
}

```

