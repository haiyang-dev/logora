yum install -y gdb



gdb --args ./bin/thnormalizer -core -nonrt -nosmf -w ./config/th_mainstruct.xml

run

quit



```javascript
生成core dump文件：
确保系统允许生成core dump文件。可以使用命令
 
ulimit -c unlimited
 
来设置。
当程序崩溃时，系统会在当前目录生成一个core dump文件，通常命名为 
core 或 core.<pid>。
使用GDB加载core dump文件：
打开终端，运行以下命令加载可执行文件和core dump文件：
gdb ./your_program core

其中 ./your_program 是你的可执行文件，core 是生成的core dump文件。
分析core dump文件：
在GDB中，可以使用以下命令进行分析：
bt：显示崩溃时的调用栈，帮助你了解程序的执行路径。
frame <frame_number>：查看特定栈帧的详细信息。
list：列出崩溃点附近的源代码。
print <variable_name>：打印变量的值。
info locals：查看局部变量。
info threads：查看所有线程。
thread <thread_number>：切换到特定线程。
```



使用coredump文件

gdb ./bin/thnormalizer  core.dump

where

是最上面的是最后的退出



frame 2 // call stack

print valiables

list



demo:  pTSRecord=0x0 数组越界了导致的

(gdb) where  


#0  ActiveCache::DataPipeline::RecordToResponse (pComponent=pComponent@entry=0x7fb26ba8e500, useNewDisplayFieldValue=true, pTSRecord=0x0, pTSRecordEx=pTSRecordEx@entry=0x7fb2309fbe70) at DataPipelineHelper.cpp:248


#1  0x00007fb26ac77370 in ActiveCache::CACWSDispatcher::BuildTSResponseFromInlineData (this=this@entry=0x7fb26ba8e500, _return=..., policy=policy@entry=Policy::TAQ_Cooked, numPoints=numPoints@entry=5, searchDirection=searchDirection@entry=SearchDir::BACKWARD, vecInlineData=std::vector of length 4, capacity 4 = {...})


    at ACWSDispatcher.cpp:1681


#2  0x00007fb26ac7a597 in ActiveCache::CACWSDispatcher::GetTimeSeries (this=0x7fb26ba8e500, _return=..., symbol="Query_Blended_TAQ", policy=Policy::TAQ_Cooked, startTime="20221102133041", endTime="20221103000000", numPoints=5, searchDirection=SearchDir::BACKWARD, blendingInfoRequired=false, 


    requestID="Query_Blended_TAQ") at ACWSDispatcher.cpp:1132


#3  0x00007fb26ad4284b in TSCCIngestionServiceProcessor::process_GetTimeSeries (this=0x7fb22440a000, seqid=1, iprot=<optimized out>, oprot=0x7fb224409880, callContext=<optimized out>) at TSCCIngestionService.cpp:4078


#4  0x00007fb26ad33e7b in TSCCIngestionServiceProcessor::dispatchCall (this=0x7fb22440a000, iprot=0x7fb2244098c0, oprot=0x7fb224409880, fname="GetTimeSeries", seqid=1, callContext=0x0) at TSCCIngestionService.cpp:3944


#5  0x00007fb26ac88f71 in apache::thrift::TDispatchProcessor::process (this=0x7fb22440a000, in=std::shared_ptr (count 3, weak 0) 0x7fb2244098c0, out=std::shared_ptr (count 3, weak 0) 0x7fb224409880, connectionContext=0x0) at ../../Libs/thrift-0.12.0/dist/include/thrift/TDispatchProcessor.h:121


#6  0x00007fb26ad6f893 in apache::thrift::server::TNonblockingServer::TConnection::Task::run (this=0x7fb22443c1c0) at src/thrift/server/TNonblockingServer.cpp:336


#7  0x00007fb26ad49a7a in apache::thrift::concurrency::ThreadManager::Task::run (this=0x7fb224409800) at src/thrift/concurrency/ThreadManager.cpp:192


#8  0x00007fb26ad4c482 in apache::thrift::concurrency::ThreadManager::Worker::run (this=0x7fb224406540) at src/thrift/concurrency/ThreadManager.cpp:307


#9  0x00007fb26ad5eb7f in apache::thrift::concurrency::PthreadThread::threadMain (arg=<optimized out>) at src/thrift/concurrency/PosixThreadFactory.cpp:224


#10 0x00007fb26ea6644b in start_thread () from /lib64/libpthread.so.0


#11 0x00007fb26e7a140f in clone () from /lib64/libc.so.6


(gdb) print dataBuffs


No symbol "dataBuffs" in current context.


(gdb) list


243     in DataPipelineHelper.cpp


(gdb) print pTSRecord


$1 = (ITSRecordWrapper *) 0x0


(gdb) print pTSRecordEx


$2 = (TSRecordEx *) 0x7fb2309fbe70


(gdb) frame 2


#2  0x00007fb26ac7a597 in ActiveCache::CACWSDispatcher::GetTimeSeries (this=0x7fb26ba8e500, _return=..., symbol="Query_Blended_TAQ", policy=Policy::TAQ_Cooked, startTime="20221102133041", endTime="20221103000000", numPoints=5, searchDirection=SearchDir::BACKWARD, blendingInfoRequired=false, 


    requestID="Query_Blended_TAQ") at ACWSDispatcher.cpp:1132


1132    ACWSDispatcher.cpp: No such file or directory.


(gdb) list


1127    in ACWSDispatcher.cpp


(gdb) print dataBuffs


$3 = std::vector of length 4, capacity 4 = {0x7fb261dbe648, 0x7fb261dbe8b8, 0x7fb261dbeb28, 0x7fb261db5790}