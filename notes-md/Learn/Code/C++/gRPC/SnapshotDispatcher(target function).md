SnapshotDispatcher.h

```javascript
/////////////////////////////////////////////////////////
//
//         File: SnapshotDispatcher.h
//  Description: Declaration of the CSnapshotDispatcher
//  class.
//  
// Copyright (c) 2017 by Thomson Reuters. All rights reserved.
//
// No portion of this software in any form may be used or 
// reproduced in any manner without written consent from 
// Thomson Reuters
//

#pragma once
#include "QFStandardHeader.h"

#include <bitset>
#include <unordered_map>
#include <vector>
#include <boost/lockfree/spsc_queue.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/filesystem/path.hpp>
#include <boost/thread.hpp>

#include <grpcpp/grpcpp.h>

#include "ETSCommDefs.h"
#include "ISnapshotCapsule.h"
#include "TSMetric.h"
#include "TSRatioMetric.h"

class IStatisticsGroup;
class ISnapshotRequestCapsuleFactory;
class ISnapshotCapsuleCollectionFactory;
class ISnapshotResponse;
class ISnapshotRequestCapsule;
class ISnapshotCapsuleCollection;

#pragma warning( push )
#pragma warning( disable : 4275 )

#ifdef QUANTUM_UNITTEST
#define private public
#define protected public
#endif

//! @brief Snapshot namespace
namespace Snapshot
{
	//! @brief Configuration namespace
	namespace Configuration
	{
        static const std::wstring LISTEN_ADDRESS    = L"listen_address";
        static const std::wstring LISTEN_PORT       = L"listen_port";
        static const std::wstring SYNCHRONOUS       = L"synchronous";
        static const std::wstring SEND_PACKET_SIZE  = L"sendpacketsize";
        static const std::wstring MIN_POLLERS       = L"min_pollers";
        static const std::wstring MAX_POLLERS       = L"max_pollers";

        static const std::wstring REQUEST_TIMEOUT_NANO = L"requesttimeoutinnano";
        static const std::wstring CACHE_TIMEOUT_NANO   = L"service_cachetimeoutinnano";
	}
	//! @brief Constants namespace
	namespace Constants
	{
        static const std::wstring SNAPSHOT_SCHEDULE_DISPATCHER_TO_PIPELINE_CHANNEL = L"snapshotscheduledispatcher-vacache";
        static const std::wstring SNAPSHOT_DEMAND_DISPATCHER_TO_PIPELINE_CHANNEL   = L"snapshotdemanddispatcher-vacache";
        static const std::wstring CMD_CHANNEL_SUFFIX = L"-channel";

        static const int32_t   MAX_STREAM_NUM = 16;
	}
	//! @brief Defaults namespace
	namespace Defaults
	{
        static const int32_t   DEFAULT_RPC_SEND_PACKET_SIZE = 16384;
	}
	//! @brief Sinks namespace
	namespace Sinks
	{
	}	
	//! @brief Signals namespace
	namespace Signals
	{
	}	
	//! @brief Sources namespace
	namespace Sources
	{
        static const std::wstring OUTGOING_SNAPSHOT_SCHEDULE_TO_PIPELINE_SOURCE = L"outgoingsnapshotschedulesource";
        static const std::wstring OUTGOING_SNAPSHOT_DEMAND_TO_PIPELINE_SOURCE = L"outgoingsnapshotdemandsource";
        static const std::wstring OUTGOING_SUBSCRIBE_SOURCE = L"outgoingsubscribesource";
	}
	//! @brief Stats namespace
	namespace Stats
	{
        static const std::wstring TOTAL_SNAPSHOT_SEND_REQUEST_COUNT = L"Total Snapshot Send Request Count";
        static const std::wstring TOTAL_SNAPSHOT_CANCEL_REQUEST_COUNT = L"Total Snapshot Cancel Request Count";
        static const std::wstring TOTAL_SNAPSHOT_GET_REQUEST_COUNT = L"Total Snapshot Get Request Count";
        static const std::wstring TOTAL_RECEIVE_SNASHOT_RESPONSE_Count = L"Total Receive Snapshot Response Count";
        static const std::wstring TOTAL_RECEIVE_SNASHOT_RESPONSE_CAPSULE__Count = L"Total Receive Snapshot Response Capsule Count";
        static const std::wstring TOTAL_RECEIVE_SNASHOT_RESPONSE_Bytes = L"Total Receive Snapshot Response Bytes";

        static const std::wstring TOTAL_SNAPSHOT_IMMEDAITE_Count = L"Total Receive Snapshot Imemdiate Count";
        static const std::wstring TOTAL_SNAPSHOT_IMMEDAITE_PROCESS_TIME = L"Total Snapshot Immediate Process Time Nano";
        static const std::wstring TOTAL_SNAPSHOT_IMMEDAITE_READY_TIME = L"Total Snapshot Immediate Ready Time Nano";

        static const std::wstring CURRENT_SNAPSHOT_RESPONSE_COLLECTION_COUNT = L"Current Snapshot Response Collection Count";

        static const std::wstring TOTAL_REQUEST_IMMEDAITE_RIC_COUNT = L"Total Request Immediate RIC Count";
        static const std::wstring TOTAL_REQUEST_SCHEDULE_RIC_COUNT = L"Total Request Schedule RIC Count";
        static const std::wstring TOTAL_ERROR_COUNT = L"Total Error Count";

        static const std::wstring SNAPSHOT_SEND_REQUEST_COUNT = L"send_request_count";
        static const std::wstring SNAPSHOT_GET_REQUEST_COUNT  = L"get_request_count";
        static const std::wstring IMMEDIATE_REQUEST_RIC_COUNT = L"immediate_request_ric_count";
        static const std::wstring SCHEDULE_REQUEST_RIC_COUNT  = L"schedule_request_ric_count";
        static const std::wstring AVG_SNAPSHOT_IMMEDIATE_PROCESS_TIME = L"avg_immediate_process_nano";
        static const std::wstring AVG_SNAPSHOT_IMMEDIATE_READY_TIME   = L"avg_immediate_ready_nano";
    }

    struct SnapshotDispatcherStats
    {
        SnapshotDispatcherStats()
        {
            memset(this, 0x00, sizeof(*this));
        }

        uint64_t    m_TotalSnapshotSendRequestCount;
        uint64_t    m_TotalSnapshotCancelRequestCount;
        uint64_t    m_TotalSnapshotGetRequestCount;
        uint64_t    m_ReceievedSnapshotResponseCount;
        uint64_t    m_ReceievedSnapshotResponseCapsuleCount;
        uint64_t    m_ReceievedSnapshotResponseBytes;
        uint64_t    m_TotImmediateRequestCount;
        uint64_t    m_TotImmediateProcessedTime;
        uint64_t    m_TotImmediateReadyTime;
        uint64_t    m_CurrentSnapshotResponseCollectionCount;

        uint64_t    m_TotalRequestImmediateRICCount;
        uint64_t    m_TotalRequestScheduleRICCount;
        uint64_t    m_TotalErrorCount;
    };

    struct OnDemandResponseEntry
    {
        OnDemandResponseEntry() : l1_responses(nullptr)
        {
        }

        void CleanupL1WithoutLock()
        {
            if (l1_responses)
            {
                ISnapshotCapsule *pSnapshotCapsule = nullptr;
                while (l1_responses->pop(pSnapshotCapsule))
                {
                    pSnapshotCapsule->RelRef();
                }
                delete l1_responses;
                l1_responses = nullptr;
            }
        }

        boost::lockfree::spsc_queue<ISnapshotCapsule*>  *l1_responses;
        std::bitset<Constants::MAX_STREAM_NUM>           requestStreams;
    };

    struct ScheduleResponseEntry: public OnDemandResponseEntry
    {
        ScheduleResponseEntry() : mutext(new boost::shared_mutex()), snapshotTime(0)
        {
        }

        void CleanupL1()
        {
            boost::unique_lock<boost::shared_mutex> writeLock(*mutext);
            CleanupL1WithoutLock();
        }

        void CleanupL2()
        {
            boost::unique_lock<boost::shared_mutex> writeLock(*mutext);
            CleanupL2WithoutLock();
        }

        void Cleanup()
            {
                {
                boost::unique_lock<boost::shared_mutex> writeLock(*mutext);
                CleanupWithoutLock();
                }
            delete mutext;
            mutext = nullptr;
            }

        void CleanupWithoutLock()
        {
            CleanupL1WithoutLock();
            CleanupL2WithoutLock();
        }

        bool TryCleaup()
        {
            bool result = mutext->try_lock();
            if (!result)
            {
                return false;
            }
            CleanupWithoutLock();
            mutext->unlock();
            delete mutext;
            mutext = nullptr;

            return true;
        }

        boost::shared_mutex            *mutext;
        NSTime                         snapshotTime;
        std::vector<ISnapshotCapsule*> l2_responses;      // only scheduled request has it
    private:
        void CleanupL2WithoutLock()
        {
            if (!l2_responses.empty())
            {
                for (auto it = l2_responses.begin(); it != l2_responses.end(); ++it)
                {
                    (*it)->RelRef();
                }
                l2_responses.clear();
            }
        }
    };

    class CSyncSnapshotServerImpl;
	//! @brief SnapshotDispatcher
	//! @todo Fill in your class documentation here
	class SNAPSHOTDISPATCHER_API CSnapshotDispatcher :
		public QuantumComponent
	{
        struct ComponentConfigs
        {
            ComponentConfigs() : requestTimeoutInNano(Snapshot::Constants::Defaults::SECS_TO_NANO * 30),
                cacheTimeoutInNano(Snapshot::Constants::Defaults::MINUTE_TO_NANO),
                localDataFilePath("./datafiles"),
                minPollers(1),
                maxPollers(4),
                sendPacaketSize(Defaults::DEFAULT_RPC_SEND_PACKET_SIZE),
                listenPort(443),
                totalPipeline(4),
                synchronous(true)
            {
            }

            int64_t     requestTimeoutInNano;
            int64_t     cacheTimeoutInNano;
            std::string listenAddress;
            std::string partitionID;
            std::string localDataFilePath;
            int32_t     minPollers;
            int32_t     maxPollers;
            int32_t     sendPacaketSize;
            uint16      listenPort;
            uint16		totalPipeline;
            bool        synchronous;
        };

	public:
        std::string GetScheduleLocalFilename(const std::string& requestID);

		//! @brief Constructor
		CSnapshotDispatcher();
		//! @brief Destructor
		~CSnapshotDispatcher();
        //! @brief Assignment operator
        CSnapshotDispatcher& operator=(const CSnapshotDispatcher&) = delete;
        //! @brief Copy constructor
        CSnapshotDispatcher(const CSnapshotDispatcher &) = delete;

        //! @brief Gets the type of the component
        //! @returns A string describing the component type
        const std::wstring&	GetComponentType() const;

        //! @brief This method will add the sink to a named list of sinks
        //! @param[in] strSourceName Source to add the sink to.
        //! @param[in] pSink Sink to add to the Source
        //! @param[in] bConnectDuplicatedSinks If the same sink has been added to the source more than once,
        //! this allows the sink to either be discarded or added
        //! @returns true pSink is valid and has been added to the Source List, false if pSink is invalid
        virtual bool ConnectSinkToSource(std::wstring strSourceName, Framework::Functors::CFunctorBase *pSink, bool bConnectDuplicatedSinks);

        //! @brief This method will send scheduled snapshot request to all streams
        //! @param[in] requestID snapshot request id, mandatory
        //! @param[in] requestTS the scheduled snapshot timestamp
        //! @param[in] replace whether this is used to replace existing snapshot request of requestID
        //! @param[in] rics snapshot ric list
        //! @param[out] errMsg wherr detailed error message will output
        //! @returns StatusCode::OK on success, other values otherwise
        grpc::StatusCode SnapShotScheduleRequest(const std::string& requestID, const std::string& requestTS, bool replace,
            const std::string& rics, std::string& errMsg);
        //! @brief This method will cancel existing scheduled snapshot request
        //! @param[in] requestID snapshot request id, mandatory
        //! @param[in] fromClient whether it comes from client invoking or just internall invoking
        //! @param[out] errMsg wherr detailed error message will output
        //! @returns StatusCode::OK on success, other values otherwise
        grpc::StatusCode CancelScheduleRequest(const std::string& requestID, bool fromClient, std::string& errMsg);
        //! @brief This method will send scheduled snapshot request to all streams
        //! @param[in/out] pEntry snapshot request metadata, mandatory
        //! @param[in] requestID snapshot request id, mandatory
        //! @param[in] requestTS the scheduled snapshot timestamp
        //! @param[in] rics snapshot ric list
        //! @param[out] ric count
        //! @param[out] errMsg wherr detailed error message will output
        //! @returns StatusCode::OK on success, other values otherwise
        grpc::StatusCode SnapShotOnDemandRequest(OnDemandResponseEntry *pEntry, const std::string& requestID, const std::string& ricList,
            int32_t *ricCount, std::string& errMsg);

        grpc::StatusCode HealthCheck(std::string& healthCheckStatus);

        inline bool GetDebugAll() const
        {
            return m_DebugAll;
        }
        grpc::StatusCode GetSnapshotResponseBlocking(const std::string& requestID, ScheduleResponseEntry**pResoonseEntry, std::string &errMsg);
        void CleanupSnapshotResponse(const std::string& requestID);

        grpc::StatusCode GetActiveRicName();
        grpc::StatusCode DumpRicImage(const std::string &ricName);
		
        ComponentConfigs           m_Configs;
        SnapshotDispatcherStats    m_DispatcherStats;
        Snapshot::TSMetric<int64>                                *m_SendRequestCount;
        Snapshot::TSMetric<int64>                                *m_GetRequestCount;
        Snapshot::TSMetric<int64>                                *m_ImmediateRequestRICCount;
        Snapshot::TSMetric<int64>                                *m_ScheuleRequestRICCount;
        Snapshot::TSRatioMetric<int64_t>                         *m_ImmediateProcessLatencyMetric;
        Snapshot::TSRatioMetric<int64_t>                         *m_ImmediateReadyLatencyMetric;
	private:
		//! @brief Initialise method passed to RegisterInitialise
		//! @returns True on success, otherwise false
		//! @todo Any Initialisation for this component.
		bool			Initialise();
		//! @brief Activate method passed to RegisterActivate
		//! @returns True on success, otherwise false
		//! @todo Any Activation for this component.
		bool			Activate();
		//! @brief Deactivate method passed to RegisterDeactivate
		//! @returns True on success, otherwise false
		//! @todo Any Deactivationfor this component.
		bool			Deactivate();
		//! @brief Shutdown method passed to RegisterShutdown
		//! @returns True on success, otherwise false
		//! @todo Any Shutdown for this component.
		bool			Shutdown();

		//! @brief Allows a component to be configured
		//! @param[in] pIConfiguration The configuration information for this instance
		//! @returns True if configuration succeeded, false if it failed
		//! @todo Your configuration details.
		bool		Configure( IConfigureComponent* pIConfiguration);

        //! @brief Sink to process incoming data
        void		OnReceiveData(ISnapshotResponse *pResponse);

        //! @brief Sink to process incoming ondemand data
        void		OnReceivOnDemandData(ISnapshotResponse *pResponse);

		void OnReceiveActiveRicname(IMemory *pMemory);

        //! @brief  do some potential flushes
        void        OnTimerTick();

		//! @brief Internal sink called when stats are required
		void		OnPublishStats();

        static void   StartDisptacherServer(void *parent);

        void OnHealthCheckNotify(IControlMessage *pMessage);

		//! @brief Statistics group object
		IStatisticsGroup                                         *m_pIStatsGroup;

        TStandardFunctorContainer<ISnapshotCapsuleCollection>    *m_pOutgoingDataSource;
        std::vector<TStandardFunctor<ISnapshotRequestCapsule>*>   m_pSnapshotScheduleRequestChannels;
        ISnapshotRequestCapsuleFactory                           *m_SnapshotRequestCapsuleFactory;
        ISnapshotCapsuleCollectionFactory                        *m_SnapshotCapsuleCollectionFactory;
        std::unordered_map<std::string, ScheduleResponseEntry>    m_ScheduleResponseCollection;
        boost::shared_mutex                                       m_ScheduleResponseCollectionSharedMutex;
        std::string                                               m_SnapshotFileHeader;
        CSyncSnapshotServerImpl                                  *m_pRpcServerImpl;
        bool                                                      m_DebugAll;
        std::string                                               m_HealthCheckStatus;
	};
}

#pragma warning( pop )

```

SnapshotDispatcher.cpp

```javascript
/////////////////////////////////////////////////////////
//
//         File: SnapshotDispatcher.cpp
//  Description: Implements the methods of the class 
//		CSnapshotDispatcher. 
//		
// Copyright (c) 2017 by Thomson Reuters. All rights reserved.
//
// No portion of this software in any form may be used or 
// reproduced in any manner without written consent from 
// Thomson Reuters
//

#include "stdafx.h"

#include "FrameworkConstants.h"
#include "IStatisticsGroup.h"
#include "SignalFunctor.h"
#include "IProperty.h"

#include <stdlib.h>
#include <thread>
#include <boost/algorithm/string.hpp>

#include <grpcpp/grpcpp.h>
#include <grpcpp/health_check_service_interface.h>
#include <grpcpp/ext/proto_server_reflection_plugin.h>

#include "SnapshotConstant.h"
#include "SnapshotHelper.h"
#include "SnapshotEventIds.h"
#include "SnapshotFileFormat.h"

#include "ISnapshotRequestCapsule.h"
#include "RWFEncoderImpl/SnapshotCapsuleFactory.h"
#include "SnapshotDispatcherImpl/SnapshotRequestCapsuleFactory.h"
#include "ISnapshotResponse.h"
#include "SnapshotDispatcherImpl/SyncSnapshotService.h"
#include "SnapshotDispatcherImpl/SnapshotDispatcher.h"
#include "SnapshotDispatcherImpl/SnapshotCapsuleCollectionFactory.h"

using Framework::Functors::TSignalFunctor;
using namespace Framework;

namespace Snapshot
{
    std::string CSnapshotDispatcher::GetScheduleLocalFilename(const std::string& requestID)
    {
        return Snapshot::Functors::GetSnapshotResponseFilename(m_Configs.localDataFilePath, requestID);
    }
	
	/////////////////////////////////////////////////////////////////////////////////
	// Function:    CSnapshotDispatcher
	/////////////////////////////////////////////////////////////////////////////////
	CSnapshotDispatcher::CSnapshotDispatcher()
		: m_SendRequestCount(nullptr)
        , m_GetRequestCount(nullptr)
        , m_ImmediateRequestRICCount(nullptr)
        , m_ScheuleRequestRICCount(nullptr)
        , m_ImmediateProcessLatencyMetric(nullptr)
        , m_ImmediateReadyLatencyMetric(nullptr)
        , m_pIStatsGroup(nullptr)
        , m_pOutgoingDataSource(nullptr)
        , m_SnapshotRequestCapsuleFactory(nullptr)
        , m_SnapshotCapsuleCollectionFactory(nullptr)
        , m_DebugAll(false)
        , m_HealthCheckStatus("")
	{
		//OnPublishStats is a private sink, and should not be added to any schema files
		QuantumComponent::DefineCustomSink<TSignalFunctor>( this, &CSnapshotDispatcher::OnPublishStats, Framework::Constants::Sinks::PUBLISH_STATS_SINK );

		QuantumComponent::RegisterLifeCycleTransitionMethod( eInitialised, this, &CSnapshotDispatcher::Initialise );
		QuantumComponent::RegisterLifeCycleTransitionMethod( eActivated, this, &CSnapshotDispatcher::Activate );
		QuantumComponent::RegisterLifeCycleTransitionMethod( eDeactivated, this, &CSnapshotDispatcher::Deactivate );
		QuantumComponent::RegisterLifeCycleTransitionMethod( eUninitialised, this, &CSnapshotDispatcher::Shutdown);

        QuantumComponent::DefineCustomSink<TSignalFunctor>(this, &CSnapshotDispatcher::OnTimerTick, Snapshot::Constants::Sinks::TIMER_TICK_SINK);
        QuantumComponent::DefineStandardSink<ISnapshotResponse>(this, &CSnapshotDispatcher::OnReceiveData, Snapshot::Constants::Sinks::INCOMING_DATA_SINK);

        QuantumComponent::RegisterWantedComponentType(Snapshot::Constants::ComponentTypes::SNAPSHOT_REQUEST_CAPSULE_FACTORY,
            &m_SnapshotRequestCapsuleFactory, WARNING_LEVEL_WARNING);
        QuantumComponent::RegisterWantedComponentType(Snapshot::Constants::ComponentTypes::SNAPSHOT_CAPSULE_COLLECTION_FACTORY,
            &m_SnapshotCapsuleCollectionFactory, WARNING_LEVEL_WARNING);

        QuantumComponent::DefineSource(Snapshot::Constants::Sources::OUTGOING_SNAPSHOT_RESPONSE_COLLECTION_SOURCE, &m_pOutgoingDataSource, WARNING_LEVEL_NONE);

        QuantumComponent::DefineControlMessageSink(Snapshot::Constants::Controls::Sanpshot_Health_Check_Notification, this, &CSnapshotDispatcher::OnHealthCheckNotify);

        m_pRpcServerImpl = new CSyncSnapshotServerImpl(this);
	}

	/////////////////////////////////////////////////////////////////////////////////
	// Function:    ~CSnapshotDispatcher
	/////////////////////////////////////////////////////////////////////////////////
	CSnapshotDispatcher::~CSnapshotDispatcher()
	{
        if (m_pRpcServerImpl)
        {
            delete m_pRpcServerImpl;
            m_pRpcServerImpl = nullptr;
        }

        if (m_SendRequestCount)
        {
            delete m_SendRequestCount;
            m_SendRequestCount = nullptr;
        }

        if (m_GetRequestCount)
        {
            delete m_GetRequestCount;
            m_GetRequestCount = nullptr;
        }

        if (m_ImmediateRequestRICCount)
        {
            delete m_ImmediateRequestRICCount;
            m_ImmediateRequestRICCount = nullptr;
        }

        if (m_ScheuleRequestRICCount)
        {
            delete m_ScheuleRequestRICCount;
            m_ScheuleRequestRICCount = nullptr;
        }

        if (m_ImmediateProcessLatencyMetric)
        {
            delete m_ImmediateProcessLatencyMetric;
            m_ImmediateProcessLatencyMetric = nullptr;
        }

        if (m_ImmediateReadyLatencyMetric)
        {
            delete m_ImmediateReadyLatencyMetric;
            m_ImmediateReadyLatencyMetric = nullptr;
        }
	}

    /////////////////////////////////////////////////////////////////////////////////
    // Function:    GetComponentType
    /////////////////////////////////////////////////////////////////////////////////
    const std::wstring& CSnapshotDispatcher::GetComponentType() const
    {
        return Snapshot::Constants::ComponentTypes::SNAPSHOT_DISPATCHER;
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Function:    Configure
    /////////////////////////////////////////////////////////////////////////////////
    bool CSnapshotDispatcher::Configure(IConfigureComponent* pIConfiguration)
    {
        bool bResult = true;
        if (false == QuantumComponent::Configure(pIConfiguration))
        {
            bResult = false;
        }
        else
        {
            // Do your configuration here
            std::wstring wsSect;
            pIConfiguration->GetSectionName(wsSect);
            if (wsSect != Snapshot::Constants::Defaults::GLOBAL_SECTION_NAME_CAPITAL &&
                wsSect != Snapshot::Constants::Defaults::GLOBAL_SECTION_NAME)
            {
                //Do your configuration here
                pIConfiguration->GetItem(Configuration::LISTEN_ADDRESS, m_Configs.listenAddress);
                const char *pTemp = getenv(Snapshot::Constants::EnvironmentVariables::MY_POD_IP.c_str());
                if (pTemp != nullptr && pTemp[0] != '\0')
                {
                    m_Configs.listenAddress = pTemp;
                }
                pIConfiguration->GetItem(Configuration::LISTEN_PORT, m_Configs.listenPort);
                pTemp = getenv(Snapshot::Constants::EnvironmentVariables::GRPC_LISTEN_PORT.c_str());
                if (pTemp != nullptr && pTemp[0] != '\0')
                {
                    m_Configs.listenPort = atoi(pTemp);
                }
                pIConfiguration->GetItem(Configuration::SYNCHRONOUS, m_Configs.synchronous);
                pIConfiguration->GetItem(Configuration::REQUEST_TIMEOUT_NANO, m_Configs.requestTimeoutInNano);
                pTemp = getenv(Snapshot::Constants::EnvironmentVariables::SERVICE_REQUEST_TIMEOUT_INNANO.c_str());
                if (pTemp != nullptr && pTemp[0] != '\0')
                {
                    m_Configs.requestTimeoutInNano = atoll(pTemp);
                }
                pIConfiguration->GetItem(Configuration::CACHE_TIMEOUT_NANO, m_Configs.cacheTimeoutInNano);
                pTemp = getenv(Snapshot::Constants::EnvironmentVariables::SERVICE_CACHE_TIMEOUT_INNANO.c_str());
                if (pTemp != nullptr && pTemp[0] != '\0')
                {
                    m_Configs.cacheTimeoutInNano = atoll(pTemp);
                }
                pIConfiguration->GetItem(Configuration::SEND_PACKET_SIZE, m_Configs.sendPacaketSize);
                pTemp = getenv(Snapshot::Constants::EnvironmentVariables::GRPC_SEND_PACKET_SIZE.c_str());
                if (pTemp != nullptr && pTemp[0] != '\0')
                {
                    m_Configs.sendPacaketSize = atoi(pTemp);
                }
                pIConfiguration->GetItem(Configuration::MIN_POLLERS, m_Configs.minPollers);
                pTemp = getenv(Snapshot::Constants::EnvironmentVariables::GRPC_MIN_POLLERS.c_str());
                if (pTemp != nullptr && pTemp[0] != '\0')
                {
                    m_Configs.minPollers = atoi(pTemp);
                }
                pIConfiguration->GetItem(Configuration::MAX_POLLERS, m_Configs.maxPollers);
                pTemp = getenv(Snapshot::Constants::EnvironmentVariables::GRPC_MAX_POLLERS.c_str());
                if (pTemp != nullptr && pTemp[0] != '\0')
                {
                    m_Configs.maxPollers = atoi(pTemp);
                }
                pIConfiguration->GetItem(Snapshot::Constants::Configurations::DEBUG_ALL, m_DebugAll);
            }
            else // assume in global
            {
                pIConfiguration->GetItem(Snapshot::Constants::Configurations::PIPELINES_PER_PARTITION, m_Configs.totalPipeline);
                pIConfiguration->GetItem(Snapshot::Constants::Configurations::PARTITION_ID, m_Configs.partitionID);
                pIConfiguration->GetItem(Snapshot::Constants::Configurations::DATA_FILE_PATH, m_Configs.localDataFilePath);
                auto adsolutePath = boost::filesystem::absolute(m_Configs.localDataFilePath);
                m_Configs.localDataFilePath = boost::filesystem::canonical(adsolutePath).string();
                LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher %ls = %u", Snapshot::Constants::Configurations::PIPELINES_PER_PARTITION.c_str(), m_Configs.totalPipeline);
                LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher %ls = %s", Snapshot::Constants::Configurations::PARTITION_ID.c_str(), m_Configs.partitionID.c_str());
                LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher %ls = %s", Snapshot::Constants::Configurations::DATA_FILE_PATH.c_str(), m_Configs.localDataFilePath.c_str());
                if (m_Configs.totalPipeline > 0)
                {
                    for (int32 i = 0; i < m_Configs.totalPipeline; ++i)
                    {
                        m_pSnapshotScheduleRequestChannels.push_back(nullptr);
                        // m_pSnapshotDemandRequestChannels.push_back(nullptr);
                    }
                }
            }
            LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher %ls = %zd", Configuration::CACHE_TIMEOUT_NANO.c_str(), m_Configs.cacheTimeoutInNano);
            LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher %ls = %s", Configuration::LISTEN_ADDRESS.c_str(), m_Configs.listenAddress.c_str());
            LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher %ls = %u", Configuration::LISTEN_PORT.c_str(), m_Configs.listenPort);
            LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher %ls = %d", Configuration::SYNCHRONOUS.c_str(), m_Configs.synchronous);
            LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher %ls = %d", Configuration::SEND_PACKET_SIZE.c_str(), m_Configs.sendPacaketSize);
            LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher %ls = %d", Configuration::MIN_POLLERS.c_str(), m_Configs.minPollers);
            LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher %ls = %d", Configuration::MAX_POLLERS.c_str(), m_Configs.maxPollers);
        }
        return bResult;
    }

	/////////////////////////////////////////////////////////////////////////////////
	// Function:    Initialise
	/////////////////////////////////////////////////////////////////////////////////
	bool CSnapshotDispatcher::Initialise()
	{
		bool bReturn = true;
		
		//this stats group is created with your instance name.  If you require a different name then change it.
		m_pIStatsGroup = QuantumComponent::CreateStatisticsGroup( GetInstanceName() );
		
		if (nullptr != m_pIStatsGroup )
		{
			// add your stats here
            m_pIStatsGroup->RegisterNewStatistic(Stats::TOTAL_SNAPSHOT_SEND_REQUEST_COUNT, STAT_UINT64 | STAT_OPTION_TOTAL,
                &m_DispatcherStats.m_TotalSnapshotSendRequestCount, StatsActionSetValue, false);
            m_pIStatsGroup->RegisterNewStatistic(Stats::TOTAL_SNAPSHOT_CANCEL_REQUEST_COUNT, STAT_UINT64 | STAT_OPTION_TOTAL,
                &m_DispatcherStats.m_TotalSnapshotCancelRequestCount, StatsActionSetValue, false);
            m_pIStatsGroup->RegisterNewStatistic(Stats::TOTAL_SNAPSHOT_GET_REQUEST_COUNT, STAT_UINT64 | STAT_OPTION_TOTAL,
                &m_DispatcherStats.m_TotalSnapshotGetRequestCount, StatsActionSetValue, false);
            m_pIStatsGroup->RegisterNewStatistic(Stats::TOTAL_RECEIVE_SNASHOT_RESPONSE_Count, STAT_UINT64 | STAT_OPTION_TOTAL,
                &m_DispatcherStats.m_ReceievedSnapshotResponseCount, StatsActionSetValue, false);
            m_pIStatsGroup->RegisterNewStatistic(Stats::TOTAL_RECEIVE_SNASHOT_RESPONSE_CAPSULE__Count, STAT_UINT64 | STAT_OPTION_TOTAL,
                &m_DispatcherStats.m_ReceievedSnapshotResponseCapsuleCount, StatsActionSetValue, false);
            m_pIStatsGroup->RegisterNewStatistic(Stats::TOTAL_RECEIVE_SNASHOT_RESPONSE_Bytes, STAT_UINT64 | STAT_OPTION_TOTAL,
                &m_DispatcherStats.m_ReceievedSnapshotResponseBytes, StatsActionSetValue, false);
            m_pIStatsGroup->RegisterNewStatistic(Stats::TOTAL_SNAPSHOT_IMMEDAITE_Count, STAT_UINT64 | STAT_OPTION_TOTAL,
                &m_DispatcherStats.m_TotImmediateRequestCount, StatsActionSetValue, false);
            m_pIStatsGroup->RegisterNewStatistic(Stats::TOTAL_SNAPSHOT_IMMEDAITE_PROCESS_TIME, STAT_UINT64 | STAT_OPTION_TOTAL,
                &m_DispatcherStats.m_TotImmediateProcessedTime, StatsActionSetValue, false);
            m_pIStatsGroup->RegisterNewStatistic(Stats::TOTAL_SNAPSHOT_IMMEDAITE_READY_TIME, STAT_UINT64 | STAT_OPTION_TOTAL,
                &m_DispatcherStats.m_TotImmediateReadyTime, StatsActionSetValue, false);
            m_pIStatsGroup->RegisterNewStatistic(Stats::CURRENT_SNAPSHOT_RESPONSE_COLLECTION_COUNT, STAT_UINT64 | STAT_OPTION_TOTAL,
                &m_DispatcherStats.m_CurrentSnapshotResponseCollectionCount, StatsActionSetValue, false);
            m_pIStatsGroup->RegisterNewStatistic(Stats::TOTAL_REQUEST_IMMEDAITE_RIC_COUNT, STAT_UINT64 | STAT_OPTION_TOTAL,
                &m_DispatcherStats.m_TotalRequestImmediateRICCount, StatsActionSetValue, false);
            m_pIStatsGroup->RegisterNewStatistic(Stats::TOTAL_REQUEST_SCHEDULE_RIC_COUNT, STAT_UINT64 | STAT_OPTION_TOTAL,
                &m_DispatcherStats.m_TotalRequestScheduleRICCount, StatsActionSetValue, false);
            m_pIStatsGroup->RegisterNewStatistic(Stats::TOTAL_ERROR_COUNT, STAT_UINT64 | STAT_OPTION_SNAPSHOT,
                &m_DispatcherStats.m_TotalErrorCount, StatsActionSetValue, false);

            m_SendRequestCount = new Snapshot::TSMetric<int64>(m_pIStatsGroup, Stats::SNAPSHOT_SEND_REQUEST_COUNT);
            m_GetRequestCount  = new Snapshot::TSMetric<int64>(m_pIStatsGroup, Stats::SNAPSHOT_GET_REQUEST_COUNT);
            m_ImmediateRequestRICCount = new Snapshot::TSMetric<int64>(m_pIStatsGroup, Stats::IMMEDIATE_REQUEST_RIC_COUNT);
            m_ScheuleRequestRICCount   = new Snapshot::TSMetric<int64>(m_pIStatsGroup, Stats::SCHEDULE_REQUEST_RIC_COUNT);
            m_ImmediateProcessLatencyMetric = new Snapshot::TSRatioMetric<int64_t>(m_pIStatsGroup, Stats::AVG_SNAPSHOT_IMMEDIATE_PROCESS_TIME);
            m_ImmediateReadyLatencyMetric = new Snapshot::TSRatioMetric<int64_t>(m_pIStatsGroup, Stats::AVG_SNAPSHOT_IMMEDIATE_READY_TIME);

			m_pIStatsGroup->SetPublishGroupToManagementStats( GetEnableManagementStats() );
			m_pIStatsGroup->BuildStatistics();
		}
		else
		{
			bReturn = false;
		}
		
        //Do your components Initialisation here
        m_SnapshotFileHeader = GetSnapshotFileHeader();
        LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher m_SnapshotFileHeader = %s, its size is %zd", 
            m_SnapshotFileHeader.c_str(), m_SnapshotFileHeader.size());

		return bReturn;
		
	}

    bool CSnapshotDispatcher::ConnectSinkToSource(std::wstring strSourceName, Framework::Functors::CFunctorBase *pSink, bool bConnectDuplicatedSinks)
    {
        if (strSourceName == Sources::OUTGOING_SNAPSHOT_SCHEDULE_TO_PIPELINE_SOURCE)
        {
            std::wstring wsName = pSink->GetTargetName();
            if (pSink->GetTargetName().find(Constants::SNAPSHOT_SCHEDULE_DISPATCHER_TO_PIPELINE_CHANNEL) != std::string::npos)
            {
                uint32 uLen = wcslen(Constants::SNAPSHOT_SCHEDULE_DISPATCHER_TO_PIPELINE_CHANNEL.c_str());
                uint32 uChannel = wsName.find(Constants::CMD_CHANNEL_SUFFIX, uLen);
                int pipelineID = std::stoi(wsName.substr(uLen, uChannel - uLen));
                LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher ConnectSinkToSource %ls to %ls[%d]",
                    Sources::OUTGOING_SNAPSHOT_SCHEDULE_TO_PIPELINE_SOURCE.c_str(),
                    Constants::SNAPSHOT_SCHEDULE_DISPATCHER_TO_PIPELINE_CHANNEL.c_str(), pipelineID);
                m_pSnapshotScheduleRequestChannels[pipelineID] = dynamic_cast<TStandardFunctor<ISnapshotRequestCapsule>*>(pSink);
                return true;
            }
        }
        /*
        else if (strSourceName == Sources::OUTGOING_SNAPSHOT_DEMAND_TO_PIPELINE_SOURCE)
        {
            std::wstring wsName = pSink->GetTargetName();
            if (pSink->GetTargetName().find(Constants::SNAPSHOT_DEMAND_DISPATCHER_TO_PIPELINE_CHANNEL) != std::string::npos)
            {
                uint32 uLen = wcslen(Constants::SNAPSHOT_DEMAND_DISPATCHER_TO_PIPELINE_CHANNEL.c_str());
                uint32 uChannel = wsName.find(Constants::CMD_CHANNEL_SUFFIX, uLen);
                int pipelineID = std::stoi(wsName.substr(uLen, uChannel - uLen));
                LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher ConnectSinkToSource %ls to %ls[%d]",
                    Sources::OUTGOING_SNAPSHOT_DEMAND_TO_PIPELINE_SOURCE.c_str(),
                    Constants::SNAPSHOT_DEMAND_DISPATCHER_TO_PIPELINE_CHANNEL.c_str(), pipelineID);
                m_pSnapshotDemandRequestChannels[pipelineID] = dynamic_cast<TStandardFunctor<ISnapshotRequestCapsule>*>(pSink);
                return true;
            }
        }
        */
        else
        {
            // Eventing or other source point.
            return QuantumComponent::ConnectSinkToSource(strSourceName, pSink, bConnectDuplicatedSinks);
        }

        return false;
    }

    void CSnapshotDispatcher::StartDisptacherServer(void* parent)
    {
        CSnapshotDispatcher *pDispacther = static_cast<CSnapshotDispatcher*>(parent);
        pDispacther->LogMessage(WARNING_LEVEL_INFORMATION, L"CSnapshotDispatcher service is starting");
        pDispacther->m_pRpcServerImpl->Run();
    }

	/////////////////////////////////////////////////////////////////////////////////
	// Function:    Activate
	/////////////////////////////////////////////////////////////////////////////////
	bool CSnapshotDispatcher::Activate()
	{
		bool bReturn = true;

		m_pIStatsGroup->SetPublishState(true);

		//Do your components Activation here
        std::thread workerThread(StartDisptacherServer, this);
        workerThread.detach();

		return bReturn;
	}

    /////////////////////////////////////////////////////////////////////////////////
    // Function:    OnPublishStats
    /////////////////////////////////////////////////////////////////////////////////
    void CSnapshotDispatcher::OnPublishStats()
    {
        // update your stats here
        m_DispatcherStats.m_CurrentSnapshotResponseCollectionCount = m_ScheduleResponseCollection.size();

        //Stats update is complete
        if (nullptr != m_pIStatsGroup)
        {
            m_pIStatsGroup->PublishRegisteredStats();
            m_pIStatsGroup->PublishStatsComplete();

            m_SendRequestCount->trigger();
            m_GetRequestCount->trigger();
            m_ImmediateRequestRICCount->trigger();
            m_ScheuleRequestRICCount->trigger();
            m_ImmediateProcessLatencyMetric->Trigger();
            m_ImmediateReadyLatencyMetric->Trigger();
        }
    }

	/////////////////////////////////////////////////////////////////////////////////
	// Function:    Deactivate
	/////////////////////////////////////////////////////////////////////////////////
	bool CSnapshotDispatcher::Deactivate()
	{
		bool bReturn = true;

		m_pIStatsGroup->SetPublishState(false);

		//Do your components Deactivation here
        m_pRpcServerImpl->Shutdown();

		return bReturn;
	}

	/////////////////////////////////////////////////////////////////////////////////
	// Function:    Shutdown
	/////////////////////////////////////////////////////////////////////////////////
	bool CSnapshotDispatcher::Shutdown()
	{
		bool bReturn = true;

		//shutdown stats
		QuantumComponent::DestroyStatisticsGroup( m_pIStatsGroup );
		m_pIStatsGroup = nullptr;

		//Do your components shutdown here

		return bReturn;
	}

    grpc::StatusCode CSnapshotDispatcher::HealthCheck(std::string& healthCheckStatus)
    {
        if (m_HealthCheckStatus.length() > 0)
        {
            healthCheckStatus = m_HealthCheckStatus;
            return grpc::StatusCode::OK;
        }
        else
        {
            healthCheckStatus = "Health check not readey.\n";
            return grpc::StatusCode::UNAVAILABLE;
        }
        
    }

    grpc::StatusCode CSnapshotDispatcher::DumpRicImage(const std::string& ricname)
    {
        static wchar_t pszMethod[] = L"CSnapshotDispatcher::DumpRicImage";
        GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_3, 
            GetComponentType(), std::string("will dump image for"), ricname);

        uint32 index = Snapshot::Functors::GetHash(ricname, m_pSnapshotScheduleRequestChannels.size());
        ISnapshotRequestCapsule* pSnapshotRequestCapsule = m_SnapshotRequestCapsuleFactory->Create();
        {
            CSnapshotRequestCapsule *pCSnapshotRequestCapsule = (CSnapshotRequestCapsule *)pSnapshotRequestCapsule;
            pCSnapshotRequestCapsule->SetSnapshotReuestType(SnapshotReuestType::OnDumpRicImage);
            pCSnapshotRequestCapsule->GetRequestRICList().push_back(ricname);
        }
        m_pSnapshotScheduleRequestChannels[index]->Call(pSnapshotRequestCapsule);
        pSnapshotRequestCapsule->RelRef();
        return grpc::StatusCode::OK;
    }

    grpc::StatusCode CSnapshotDispatcher::GetActiveRicName()
    {
        static wchar_t pszMethod[] = L"CSnapshotDispatcher::GetActiveRicName";
        GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_2,
            GetComponentType(), std::string("receive command to dump all ric list"));

        std::vector<ISnapshotRequestCapsule*>  snapshotRequets;
        for (size_t i = 0; i < m_pSnapshotScheduleRequestChannels.size(); ++i)
        {
            ISnapshotRequestCapsule* pSnapshotRequestCapsule = m_SnapshotRequestCapsuleFactory->Create();
            {
                Snapshot::CSnapshotRequestCapsule *pCSnapshotRequestCapsule = (Snapshot::CSnapshotRequestCapsule *)pSnapshotRequestCapsule;
                pCSnapshotRequestCapsule->SetSnapshotReuestType(SnapshotReuestType::OnGetActiveRicNames);
            }

            m_pSnapshotScheduleRequestChannels[i]->Call(pSnapshotRequestCapsule);
            pSnapshotRequestCapsule->RelRef();
        }

        return grpc::StatusCode::OK;
    }

    grpc::StatusCode CSnapshotDispatcher::SnapShotScheduleRequest(const std::string& requestID, const std::string& requestTS, bool replace,
        const std::string& rics, std::string& errMsg)
    {
        static wchar_t pszMethod[] = L"CSnapshotDispatcher::SnapShotScheduleRequest";
        ++m_DispatcherStats.m_TotalSnapshotSendRequestCount;
        m_SendRequestCount->update(1, 0);

        vector<std::string> ricList;
        boost::split(ricList, rics, boost::is_any_of(","));
        if (ricList.empty())
        {
            ++m_DispatcherStats.m_TotalErrorCount;
            GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::INVALID_INPUT_SNAPSHOT_REQUEST_PAREMETER, GetComponentType(), 0, std::string("request ricList"), rics, requestID);
            errMsg.assign("empty snapshot ric list");
            return grpc::StatusCode::INVALID_ARGUMENT;
        }

        if (requestTS.empty())
        {
            ++m_DispatcherStats.m_TotalErrorCount;
            GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::INVALID_INPUT_SNAPSHOT_REQUEST_PAREMETER, GetComponentType(), 0,
                std::string("request timestamp"), rics, requestID);
            errMsg.assign("empty snapshot timestamp");
            return grpc::StatusCode::INVALID_ARGUMENT;
        }
        NSTime  snapshotRequestTime = 0;
        Snapshot::Functors::ParseRFCDateTime(requestTS, &snapshotRequestTime);
        if (0 == snapshotRequestTime)
        {
            ++m_DispatcherStats.m_TotalErrorCount;
            GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::INVALID_INPUT_SNAPSHOT_REQUEST_PAREMETER, GetComponentType(), 0,
                std::string("request timestamp"), requestTS, requestID);
            return grpc::StatusCode::INVALID_ARGUMENT;
        }
        else
        {
            GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_REQUEST_INFORMATION, GetComponentType(),
                std::string("onschedule"), requestID, requestTS, ricList.size());
        }

        // if (replace)
        // {
        //    CancelScheduleRequest(requestID, false, errMsg);
        // }

        std::vector<ISnapshotRequestCapsule*>  snapshotRequets;
        for (size_t i = 0; i < m_pSnapshotScheduleRequestChannels.size(); ++i)
        {
            snapshotRequets.push_back(nullptr);
        }

        for (auto it = ricList.begin(); it != ricList.end(); ++it)
        {
            uint32 index = Snapshot::Functors::GetHash(*it, m_pSnapshotScheduleRequestChannels.size());
            if (snapshotRequets[index] == nullptr)
            {
                ISnapshotRequestCapsule* pSnapshotRequestCapsule = m_SnapshotRequestCapsuleFactory->Create();
                snapshotRequets[index] = pSnapshotRequestCapsule;
                {
                    Snapshot::CSnapshotRequestCapsule *pCSnapshotRequestCapsule = (Snapshot::CSnapshotRequestCapsule *)pSnapshotRequestCapsule;
                    pCSnapshotRequestCapsule->SetSnapshotRequestID(requestID);
                    pCSnapshotRequestCapsule->SetSnapshotReuestType(SnapshotReuestType::OnSchedule);
                    pCSnapshotRequestCapsule->SetSnapshotTime(snapshotRequestTime);
                }
            }
            snapshotRequets[index]->GetRequestRICList().push_back(*it);
        }
        m_DispatcherStats.m_TotalRequestScheduleRICCount += ricList.size();
        m_ScheuleRequestRICCount->update(ricList.size(), 0);

        std::vector<int8_t> streamIds;
        ScheduleResponseEntry responseEntry;
        responseEntry.l1_responses = new boost::lockfree::spsc_queue<ISnapshotCapsule*>(static_cast<int32>(ricList.size() + 100));
        responseEntry.l2_responses.reserve(static_cast<int32>(ricList.size() + 100));
        for (size_t i = 0; i < snapshotRequets.size(); ++i)
        {
            if (snapshotRequets[i] == nullptr)
            {
                continue;
            }
            streamIds.push_back(i);
            responseEntry.requestStreams.set(i, true);
        }
        responseEntry.snapshotTime = snapshotRequestTime;
        {
            boost::unique_lock<boost::shared_mutex> writeLock(m_ScheduleResponseCollectionSharedMutex);
            m_ScheduleResponseCollection.insert(std::make_pair(requestID, responseEntry));
        }

        for (auto it = streamIds.begin(); it != streamIds.end(); ++it)
        {
            m_pSnapshotScheduleRequestChannels[*it]->Call(snapshotRequets[*it]);
            snapshotRequets[*it]->RelRef();
        }
        if (m_DebugAll)
        {
            GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_6, GetComponentType(),
                std::string("perf measure snapshot onschedule request"), requestID, 
                std::string("request time = ") + requestTS, 
                std::string("ricList size = ") + std::to_string(ricList.size()),
                std::string("reuest stream number = ") + std::to_string(responseEntry.requestStreams.count()));
        }

        return grpc::StatusCode::OK;
    }

    grpc::StatusCode CSnapshotDispatcher::CancelScheduleRequest(const std::string& requestID, bool fromClient, std::string& errMsg)
    {
        static wchar_t pszMethod[] = L"CSnapshotDispatcher::CancelScheduleRequest";

        if (fromClient)
        {
            ++m_DispatcherStats.m_TotalSnapshotCancelRequestCount;
        }
        
        std::bitset<Constants::MAX_STREAM_NUM> requestStreams;
        int64 snapshotTime = 0;
        {
            boost::shared_lock<boost::shared_mutex> readLock(m_ScheduleResponseCollectionSharedMutex);
            auto it = m_ScheduleResponseCollection.find(requestID);
            if (it == m_ScheduleResponseCollection.end())
            {
                ++m_DispatcherStats.m_TotalErrorCount;
                GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_CACHE_NOT_FOUND, GetComponentType(), requestID);
                errMsg.assign("no existing schedule request for " + requestID);
                return grpc::StatusCode::NOT_FOUND;
            }
            requestStreams = it->second.requestStreams;
            snapshotTime = it->second.snapshotTime;
        }

        ISnapshotRequestCapsule* pSnapshotRequestCapsule = m_SnapshotRequestCapsuleFactory->Create();
        {
            Snapshot::CSnapshotRequestCapsule *pCSnapshotRequestCapsule = (Snapshot::CSnapshotRequestCapsule *)pSnapshotRequestCapsule;
            pCSnapshotRequestCapsule->SetSnapshotRequestID(requestID);
            pCSnapshotRequestCapsule->SetSnapshotReuestType(SnapshotReuestType::OnSchedule);
            pCSnapshotRequestCapsule->SetSnapshotTime(snapshotTime);
            pCSnapshotRequestCapsule->SetCancelRequest(true);
        }
        for (uint8_t streamId = 0; streamId < Constants::MAX_STREAM_NUM; ++streamId)
        {
            if (requestStreams[streamId])
            {
                m_pSnapshotScheduleRequestChannels[streamId]->Call(pSnapshotRequestCapsule);
            }
        }
        pSnapshotRequestCapsule->RelRef();

        CleanupSnapshotResponse(requestID);

        return grpc::StatusCode::OK;
    }

    grpc::StatusCode CSnapshotDispatcher::SnapShotOnDemandRequest(OnDemandResponseEntry *responseEntry,
        const std::string& requestID, const std::string& rics,
        int32_t *ricCount, std::string& errMsg)
    {
        static wchar_t pszMethod[] = L"CSnapshotDispatcher::SnapShotOnDemandRequest";

        ++m_DispatcherStats.m_TotalSnapshotSendRequestCount;
        m_SendRequestCount->update(1, 0);

        vector<std::string> ricList;
        boost::split(ricList, rics, boost::is_any_of(","));
        *ricCount = static_cast<int32_t>(ricList.size());

        std::vector<ISnapshotRequestCapsule*>  snapshotRequets;
        for (size_t i = 0; i < m_pSnapshotScheduleRequestChannels.size(); ++i)
        {
            snapshotRequets.push_back(nullptr);
        }

        for (auto it = ricList.begin(); it != ricList.end(); ++it)
        {
            uint32 index = Snapshot::Functors::GetHash(*it, m_pSnapshotScheduleRequestChannels.size());
            if (snapshotRequets[index] == nullptr)
            {
                ISnapshotRequestCapsule* pSnapshotRequestCapsule = m_SnapshotRequestCapsuleFactory->Create();
                snapshotRequets[index] = pSnapshotRequestCapsule;
                {
                    Snapshot::CSnapshotRequestCapsule *pCSnapshotRequestCapsule = (Snapshot::CSnapshotRequestCapsule *)pSnapshotRequestCapsule;
                    pCSnapshotRequestCapsule->SetSnapshotRequestID(requestID);
                    pCSnapshotRequestCapsule->SetUserData(responseEntry);
                    pCSnapshotRequestCapsule->SetSnapshotReuestType(SnapshotReuestType::OnDemmand);
                }
            }
            snapshotRequets[index]->GetRequestRICList().push_back(*it);
        }
        m_DispatcherStats.m_TotalRequestImmediateRICCount += ricList.size();
        m_ImmediateRequestRICCount->update(ricList.size(), 0);

        // Note: two loops to ensure when response come from upstream, l1_responses and requestStreams has been ready
        std::vector<uint8_t>  streamIds;
        for (size_t i = 0; i < snapshotRequets.size(); ++i)
        {
            if (snapshotRequets[i] == nullptr)
            {
                continue;
            }
            responseEntry->requestStreams.set(i, true);
            streamIds.push_back(i);
        }
        responseEntry->l1_responses = new boost::lockfree::spsc_queue<ISnapshotCapsule*>(static_cast<int32>(ricList.size() + 100));
        if (m_DebugAll)
        {
            GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_6,
                std::string("perf measure snapshot ondemand request"), requestID,
                std::string("ricList size ="), ricList.size(),
                std::string("request stream number ="), responseEntry->requestStreams.count());
        }

        for (auto it = streamIds.begin(); it != streamIds.end(); ++it)
        {
            m_pSnapshotScheduleRequestChannels[*it]->Call(snapshotRequets[*it]);
            snapshotRequets[*it]->RelRef();
        }

        return grpc::StatusCode::OK;
    }

    grpc::StatusCode CSnapshotDispatcher::GetSnapshotResponseBlocking(const std::string& requestID, 
        ScheduleResponseEntry** pResponseEntry, std::string &errMsg)
    {
        ++m_DispatcherStats.m_TotalSnapshotGetRequestCount;
        m_GetRequestCount->update(1, 0);

        *pResponseEntry = nullptr;
        boost::shared_lock<boost::shared_mutex> readLock(m_ScheduleResponseCollectionSharedMutex);
        auto it = m_ScheduleResponseCollection.find(requestID);
        if (it == m_ScheduleResponseCollection.end())
        {
            ++m_DispatcherStats.m_TotalErrorCount;
            char cBuf[Snapshot::Constants::Defaults::MAX_MSG_LEN];
            sprintf(cBuf, "no such request id %s found", requestID.c_str());
            errMsg.assign(cBuf);
            return grpc::StatusCode::NOT_FOUND;
        }
        else
        {
            auto& entry = it->second;
            *pResponseEntry = &entry;
        }

        return grpc::StatusCode::OK;
    }

    void CSnapshotDispatcher::CleanupSnapshotResponse(const std::string& requestID)
    {
        static wchar_t pszMethod[] = L"CSnapshotDispatcher::CleanupSnapshotResponse";

        if (GetDebugAll())
        {
            GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_3,
                GetComponentType(), requestID, std::string("will delete l1_responses"));
        }
        boost::unique_lock<boost::shared_mutex> writeLock(m_ScheduleResponseCollectionSharedMutex);
        auto it = m_ScheduleResponseCollection.find(requestID);
        if (it != m_ScheduleResponseCollection.end())
        {
            it->second.Cleanup();
            m_ScheduleResponseCollection.erase(it);
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Function:    OnReceiveData
    /////////////////////////////////////////////////////////////////////////////////
    void CSnapshotDispatcher::OnReceiveData(ISnapshotResponse *pResponse)
    {
        static wchar_t pszMethod[] = L"CSnapshotDispatcher::OnReceiveData";

        if (eActivated != m_eComponentState)
        {
            return;
        }
        ++m_DispatcherStats.m_ReceievedSnapshotResponseCount;

        OnDemandResponseEntry *pEntry = (OnDemandResponseEntry *)(pResponse->GetUserData());
        if (pEntry)
        {
            return OnReceivOnDemandData(pResponse);
        }

        bool isFinished = pResponse->IsFinished();
        int8_t  streamID = pResponse->GetStreamID();
        const auto &responseCapsules = pResponse->GetResponseCapsules();
        if (isFinished)
        {
            ISnapshotCapsule *pCapsule = responseCapsules.front();
            const auto& requestIDs = pCapsule->GetSnapshotRequestIDs();
            const std::string& requstID = requestIDs[0];            
            boost::shared_lock<boost::shared_mutex> readLock(m_ScheduleResponseCollectionSharedMutex);
            auto responseIT = m_ScheduleResponseCollection.find(requstID);
            if (responseIT == m_ScheduleResponseCollection.end())
            {
                GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_CACHE_NOT_FOUND, GetComponentType(), requstID);
            }
            else
            {
                responseIT->second.requestStreams.set(streamID, false);
                if (m_DebugAll)
                {
                    GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_COMPLETE_RESPONSE_RECEIVED,
                        GetComponentType(), requstID, streamID, responseIT->second.requestStreams.count());
                }
                if (responseIT->second.requestStreams.none())
                {
                    CSnapshotCapsule *pCCapsule = (CSnapshotCapsule *)pCapsule;
                    pCCapsule->SetCompleteRecord(true);
                    pCapsule->AddRef();
                    if (m_DebugAll)
                    {
                        GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_5, GetComponentType(),
                            std::string("perf measure processed snapshot response finish receive request"), requstID,
                            std::string("l2_responses size ="), responseIT->second.l2_responses.size());
                    }
                    responseIT->second.l1_responses->push(pCapsule);

                    if (!responseIT->second.l2_responses.empty())
                    {
                        // send to local disk storage
                        ISnapshotCapsuleCollection *pSnapshotCapsuleCollection = m_SnapshotCapsuleCollectionFactory->Create();
                        pSnapshotCapsuleCollection->SetSnapshotRequestID(requstID);
                        pSnapshotCapsuleCollection->SetSnapshotTime(responseIT->second.snapshotTime);
                        std::vector<ISnapshotCapsule*>& collection = pSnapshotCapsuleCollection->GetSnapshotResponseCollection();
                        for (auto it = responseIT->second.l2_responses.begin(); it != responseIT->second.l2_responses.end(); ++it)
                        {
                            (*it)->AddRef();
                            collection.push_back(*it);
                        }
                        if (m_pOutgoingDataSource != nullptr)
                        {
                            m_pOutgoingDataSource->Call(pSnapshotCapsuleCollection);
                        }
                        pSnapshotCapsuleCollection->RelRef();
                        pSnapshotCapsuleCollection = nullptr;
                    }
                }
            }
        }
        else
        {
            boost::shared_lock<boost::shared_mutex> readLock(m_ScheduleResponseCollectionSharedMutex);
            for (auto it = responseCapsules.begin(); it != responseCapsules.end(); ++it)
            {
                ISnapshotCapsule *pCapsule = (*it);
                ++m_DispatcherStats.m_ReceievedSnapshotResponseCapsuleCount;
                const auto& requestIDs = pCapsule->GetSnapshotRequestIDs();
                for (auto cit = requestIDs.begin(); cit != requestIDs.end(); ++cit)
                {
                    auto responseIt = m_ScheduleResponseCollection.find(*cit);
                    if (responseIt == m_ScheduleResponseCollection.end())
                    {
                        GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_CACHE_NOT_FOUND,
                            GetComponentType(), *cit);
                    }
                    else
                    {
                        pCapsule->AddRef();
                        responseIt->second.l1_responses->push(pCapsule);

                        pCapsule->AddRef();
                        responseIt->second.l2_responses.push_back(pCapsule);
                    }
                }
            }
        }
    }

    void CSnapshotDispatcher::OnReceivOnDemandData(ISnapshotResponse *pResponse)
    {
        static wchar_t pszMethod[] = L"CSnapshotDispatcher::OnReceivOnDemandData";

        OnDemandResponseEntry *pEntry = (OnDemandResponseEntry *)(pResponse->GetUserData());
        bool isFinished = pResponse->IsFinished();
        int8_t  streamID = pResponse->GetStreamID();
        const auto &responseCapsules = pResponse->GetResponseCapsules();
        if (isFinished)
        {
            ISnapshotCapsule *pCapsule = responseCapsules.front();
            const auto& requestIDs = pCapsule->GetSnapshotRequestIDs();
            const std::string& requstID = requestIDs[0];
            if (m_DebugAll)
            {
                GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_5, GetComponentType(),
                    std::string("perf measure processed snapshot response finish receive request"), requstID,
                    std::string(" from stream #"), streamID);
            }
            pEntry->requestStreams.set(streamID, false);
            if (m_DebugAll)
            {
                GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_COMPLETE_RESPONSE_RECEIVED,
                    GetComponentType(), requstID, streamID, pEntry->requestStreams.count());
            }
            if (pEntry->requestStreams.none())
            {
                CSnapshotCapsule *pCCapsule = (CSnapshotCapsule *)pCapsule;
                pCCapsule->SetCompleteRecord(true);
                pCapsule->AddRef();
                if (m_DebugAll)
                {
                    GenerateEvent(pszMethod, Framework::Eventing::ID::Global::SNAPSHOT_DEBUG_INFO_3, GetComponentType(),
                        std::string("perf measure processed snapshot response finish receive request"), requstID);
                }
                pEntry->l1_responses->push(pCapsule);
            }
        }
        else
        {
            for (auto it = responseCapsules.begin(); it != responseCapsules.end(); ++it)
            {
                ISnapshotCapsule *pCapsule = (*it);
                pCapsule->AddRef();
                pEntry->l1_responses->push(pCapsule);
            }
            m_DispatcherStats.m_ReceievedSnapshotResponseCapsuleCount += responseCapsules.size();
        }
    }

    void CSnapshotDispatcher::OnTimerTick()
    {
        static wchar_t pszMethod[] = L"CSnapshotDispatcher::OnTimerTick";

        boost::unique_lock<boost::shared_mutex> writeLock(m_ScheduleResponseCollectionSharedMutex);
        if (m_ScheduleResponseCollection.empty())
        {
            return;
        }
        NSTime now = std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
        for (auto it = m_ScheduleResponseCollection.begin(); it != m_ScheduleResponseCollection.end(); )
        {
            if (now > it->second.snapshotTime && 
                (now - it->second.snapshotTime) >= m_Configs.cacheTimeoutInNano)
            {
                if (m_DebugAll)
                {
                    GenerateEvent(pszMethod, Framework::Eventing::ID::SnapshotDispatcher::SNAPSHOT_CACHE_EXPIRED,
                        GetComponentType(), it->first, it->second.snapshotTime, m_Configs.cacheTimeoutInNano);
                }
                if (it->second.TryCleaup())
                {
                    it = m_ScheduleResponseCollection.erase(it);
                }
                else
                {
                    ++it;
                }
            }
            else
            {
                ++it;
            }
        }
    }
    void CSnapshotDispatcher::OnHealthCheckNotify(IControlMessage *pMessage)
    {
        IProperty *pIProperty = dynamic_cast<IProperty*>(pMessage->GetPayload());
        std::wstring wstrHealthCheck;
        pIProperty->GetPropertyName(wstrHealthCheck);
        if (wstrHealthCheck.length() > 0)
        {
            m_HealthCheckStatus = std::string(wstrHealthCheck.begin(), wstrHealthCheck.end());
        }
    }
}

```

