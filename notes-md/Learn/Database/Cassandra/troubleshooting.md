timeout: service 1200

root@cassandra-a-0:/etc/cassandra# cat cassandra.yaml  | grep timeout

read_request_timeout_in_ms: 60000

range_request_timeout_in_ms: 120000

write_request_timeout_in_ms: 20000

counter_write_request_timeout_in_ms: 50000

cas_contention_timeout_in_ms: 10000

truncate_request_timeout_in_ms: 600000

# The default timeout for other, miscellaneous operations

request_timeout_in_ms: 100000

# this timeout to execute, will generate an aggregated log message, so that slow queries

slow_query_log_timeout_in_ms: 5000

# Enable operation timeout information exchange between nodes to accurately

# measure request timeouts.  If disabled, replicas will assume that requests

cross_node_timeout: false



seesion/client

root@cassandra-a-0:/etc/cassandra# cqlsh --request-timeout=600000

Usage: cqlsh.py [options] [host [port]]





if using the endpoint_snitch: Ec2Snitch

the data-center name in us-east-1 is us-east, in other like us-east-2 is us-east-2

```javascript
spring.data.cassandra.local-datacenter=us-east
```

cassandra/src/java/org/apache/cassandra/locator/Ec2Snitch.java at cassandra-3.11 · apache/cassandra · GitHub