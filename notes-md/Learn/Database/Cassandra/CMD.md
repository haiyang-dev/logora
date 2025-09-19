type cqlsh



Check Data center

```javascript
use system;
select data_center from local;

data_center
-------------
datacenter1 
```



cqlsh:system> DESCRIBE CLUSTER ;

Cluster: snopshot-cluster

Partitioner: Murmur3Partitioner



cqlsh:system> DESCRIBE TABLES ;

available_ranges          peers               batchlog        transferred_ranges

batches                   compaction_history  size_estimates  hints

prepared_statements       sstable_activity    built_views

"IndexInfo"               peer_events         range_xfers

views_builds_in_progress  paxos               local



cqlsh:system> DESCRIBE KEYSPACES ;

system_schema  system_auth  system  snapshot  system_distributed  system_traces



cqlsh:system> use snapshot;

cqlsh:snapshot>



cqlsh:snapshot> DESCRIBE TABLE schedule_request ;



CREATE TABLE snapshot.schedule_request (

    id text PRIMARY KEY,

    processtarttime timestamp,

    response blob,

    retrieval tinyint,

    rics set<text>,

    s3url text,

    snaptime timestamp,

    status tinyint,

    webserver text

) WITH bloom_filter_fp_chance = 0.01

    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}

    AND comment = 'schedule snapshot request record table'

    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}

    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}

    AND crc_check_chance = 1.0

    AND dclocal_read_repair_chance = 0.1

    AND default_time_to_live = 86400

    AND gc_grace_seconds = 864000

    AND max_index_interval = 2048

    AND memtable_flush_period_in_ms = 0

    AND min_index_interval = 128

    AND read_repair_chance = 0.0

    AND speculative_retry = '99PERCENTILE';



INSERT INTO schedule_request (id, processtarttime, response, retrieval, rics, s3url, snaptime, status, webserver) VALUES ( '123456', '',bigintAsBlob(3),1,{'test_ric'},'','',1,'') ;





nodetool -Dcom.sun.jndi.rmiURLParsing=legacy status



```javascript
nodetool -h ::FFFF:127.0.0.1 status
```

