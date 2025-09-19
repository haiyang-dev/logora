./bin/SnapshotServiceClient -s 10.107.93.87:443 -healthcheck



thrift -r --gen java:private-members,fullcamel,reuse-objects,option_type TSCCAPI.thrift