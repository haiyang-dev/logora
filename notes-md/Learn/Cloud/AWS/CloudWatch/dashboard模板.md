```
{
    "widgets": [
        {
            "height": 6,
            "width": 6,
            "y": 1,
            "x": 0,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "request_Throughput_nps", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "stat": "Average",
                "period": 60,
                "yAxis": {
                    "left": {
                        "min": 0,
                        "showUnits": false
                    },
                    "right": {
                        "min": 0,
                        "showUnits": false
                    }
                },
                "title": "Request Throughput(nps)"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 13,
            "x": 0,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "failure_request_count", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "stat": "Average",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false,
                        "min": 0
                    },
                    "right": {
                        "showUnits": false,
                        "min": 0
                    }
                },
                "title": "Failure Request Count"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 13,
            "x": 6,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "nodata_request_count", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "stat": "Average",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false,
                        "min": 0
                    },
                    "right": {
                        "showUnits": false,
                        "min": 0
                    }
                },
                "title": "Nodata Request Count"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 32,
            "x": 12,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "task_queue_size", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "stat": "Average",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "Task Queue Length"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 38,
            "x": 0,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "cpu_utilization", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "period": 60,
                "yAxis": {
                    "left": {
                        "min": 0,
                        "max": 100,
                        "showUnits": false
                    },
                    "right": {
                        "min": 0,
                        "max": 100,
                        "showUnits": false
                    }
                },
                "title": "Pod CPU Utilization"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 52,
            "x": 6,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "HBaseAPI_Scan_avgLatency_us", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "HBaseAPI Scan AvgLatency(us)"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 52,
            "x": 0,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "HBaseAPI_Scan_Throughput_nps", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "HBaseAPI Scan Throughput(nps)"
            }
        },
        {
            "height": 1,
            "width": 24,
            "y": 0,
            "x": 0,
            "type": "text",
            "properties": {
                "markdown": "# QE Request Metrics"
            }
        },
        {
            "height": 1,
            "width": 24,
            "y": 25,
            "x": 0,
            "type": "text",
            "properties": {
                "markdown": "# QE Resource Metrics"
            }
        },
        {
            "height": 1,
            "width": 24,
            "y": 51,
            "x": 0,
            "type": "text",
            "properties": {
                "markdown": "# QE HBaseAPI Metrics"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 32,
            "x": 0,
            "type": "metric",
            "properties": {
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "qe_health_status", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "view": "timeSeries",
                "stacked": false,
                "region": "${region}",
                "period": 60,
                "stat": "Average",
                "yAxis": {
                    "left": {
                        "label": "",
                        "showUnits": false
                    }
                },
                "title": "QE Status: 1: Health 2: Unhealth"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 1,
            "x": 6,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "request_avgLatency_us", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "Request AvgLatency(us)"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 1,
            "x": 12,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "process_avgLatency_us", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "Process AvgLatency(us)"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 1,
            "x": 18,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "queuewait_avgLatency_us", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "Queuewait AvgLatency(us)"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 32,
            "x": 6,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "totSymbolsCreatedUnique", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "title": "Total Symbols Created Unique",
                "period": 60,
                "yAxis": {
                    "left": {
                        "min": 0,
                        "showUnits": false
                    },
                    "right": {
                        "min": 0,
                        "showUnits": false
                    }
                }
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 7,
            "x": 6,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "request_peakLatency_us", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "Request PeakLatency(us)"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 7,
            "x": 12,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "process_peakLatency_us", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "Process PeakLatency(us)"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 7,
            "x": 18,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "queuewait_peakLatency_us", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "Queuewait PeakLatency(us)"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 52,
            "x": 12,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "HBaseAPI_Scan_Throughput_bps", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "HBaseAPI Scan Throughput(bps)"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 19,
            "x": 0,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "request_Throughput_bps", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "Request Throughput(bps)"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 7,
            "x": 0,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "request_PeakThroughput_nps", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "Request PeakThroughput(nps)"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 32,
            "x": 18,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "active_tasks_counter", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "stat": "Average",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false
                    },
                    "right": {
                        "showUnits": false
                    }
                },
                "title": "Active Tasks"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 13,
            "x": 12,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "invalid_query_count", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "stat": "Average",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false,
                        "min": 0
                    },
                    "right": {
                        "showUnits": false,
                        "min": 0
                    }
                },
                "title": "Invalid Query Count"
            }
        },
        {
            "height": 6,
            "width": 6,
            "y": 13,
            "x": 18,
            "type": "metric",
            "properties": {
                "view": "timeSeries",
                "stacked": false,
                "metrics": ${jsonencode([ for i in range(0, qe_max_number):
                    [ "a${assert_id}_ets_qe_${short_environment}_otlp", "invalid_request_count", "OTelLib", "ets-qe-meter", "pod_name", "ets-qe-${i}", { "region": "${region}" } ]
                ])},
                "region": "${region}",
                "stat": "Average",
                "period": 60,
                "yAxis": {
                    "left": {
                        "showUnits": false,
                        "min": 0
                    },
                    "right": {
                        "showUnits": false,
                        "min": 0
                    }
                },
                "title": "Invalid Request Count"
            }
        },
        {
          "type": "text",
          "x": 0,
          "y": 44,
          "width": 24,
          "height": 1,
          "properties": {
            "markdown": "# Thrift Resource Metric"
          }
        },
        {
          "type": "metric",
          "x": 12,
          "y": 45,
          "width": 6,
          "height": 6,
          "properties": {
            "metrics": ${jsonencode([ for i in range(0, qe_max_number):
              [ "a${assert_id}_ets_qe_${short_environment}_otlp", "container_memory_rss", "container", "query-thrift", "environment", "${short_environment}", "opt-datadog", "require", "region", "${region}", "OTelLib", "github.com/open-telemetry/opentelemetry-collector-contrib/receiver/prometheusreceiver", "pod_name", "ets-qe-${i}", { "region": "${region}", "label": "query-thrift-${i}" } ]
            ])},
            "view": "timeSeries",
            "stacked": false,
            "region": "${region}",
            "period": 60,
            "stat": "Average",
            "title": "Thrift Container Memory RSS",
            "yAxis": {
              "left": {
                "showUnits": false
              }
            }
          }
        },
        {
          "type": "metric",
          "x": 6,
          "y": 45,
          "width": 6,
          "height": 6,
          "properties": {
            "metrics": ${jsonencode([ for i in range(0, qe_max_number):
              [ "a${assert_id}_ets_qe_${short_environment}_otlp", "container_memory_usage_bytes", "container", "query-thrift", "environment", "${short_environment}", "opt-datadog", "require", "region", "${region}", "OTelLib", "github.com/open-telemetry/opentelemetry-collector-contrib/receiver/prometheusreceiver", "pod_name", "ets-qe-${i}", { "region": "${region}", "label": "query-thrift-${i}" } ]
            ])},
            "view": "timeSeries",
            "stacked": false,
            "region": "${region}",
            "period": 60,
            "stat": "Average",
            "title": "Thrift Container Memory Usage Bytes",
            "yAxis": {
              "left": {
                "showUnits": false
              }
            }
          }
        },
        {
          "type": "metric",
          "x": 12,
          "y": 26,
          "width": 6,
          "height": 6,
          "properties": {
            "metrics": ${jsonencode([ for i in range(0, qe_max_number):
              [ "a${assert_id}_ets_qe_${short_environment}_otlp", "container_memory_usage_bytes", "container", "query-engine", "environment", "${short_environment}", "opt-datadog", "require", "region", "${region}", "OTelLib", "github.com/open-telemetry/opentelemetry-collector-contrib/receiver/prometheusreceiver", "pod_name", "ets-qe-${i}", { "region": "${region}", "label": "query-engine-${i}" } ]
            ])},
            "view": "timeSeries",
            "stacked": false,
            "region": "${region}",
            "period": 60,
            "stat": "Average",
            "title": "QE Container Memory Usage Bytes",
            "yAxis": {
              "left": {
                "showUnits": false
              }
            }
          }
        },
        {
          "type": "metric",
          "x": 18,
          "y": 26,
          "width": 6,
          "height": 6,
          "properties": {
            "metrics": ${jsonencode([ for i in range(0, qe_max_number):
              [ "a${assert_id}_ets_qe_${short_environment}_otlp", "container_memory_rss", "container", "query-engine", "environment", "${short_environment}", "opt-datadog", "require", "region", "${region}", "OTelLib", "github.com/open-telemetry/opentelemetry-collector-contrib/receiver/prometheusreceiver", "pod_name", "ets-qe-${i}", { "region": "${region}", "label": "query-engine-${i}" } ]
            ])},
            "view": "timeSeries",
            "stacked": false,
            "region": "${region}",
            "period": 60,
            "stat": "Average",
            "title": "QE Container Memory RSS",
            "yAxis": {
              "left": {
                "showUnits": false
              }
            }
          }
        },
        {
          "type": "metric",
          "x": 0,
          "y": 45,
          "width": 6,
          "height": 6,
          "properties": {
            "metrics": [
              %{ for i in range(0, qe_max_number) ~}
                [{ "expression": "m${i} / 12 * 100", "label": "query-thrift-${i}", "id": "e${i}", "period": 60, "region": "${region}" } ],
                [ "a${assert_id}_ets_qe_${short_environment}_otlp", "container_cpu_usage_seconds_rate", "container", "query-thrift", "environment", "${short_environment}", "opt-datadog", "require", "cpu", "total", "region", "${region}", "OTelLib", "github.com/open-telemetry/opentelemetry-collector-contrib/receiver/prometheusreceiver", "pod_name", "ets-qe-${i}", { "region": "${region}", "label": "query-thrift-${i}", "id": "m${i}", "visible": false, "stat": "Average" } ]%{ if i < qe_max_number - 1 },%{ endif }
              %{ endfor ~}
              ],
            "view": "timeSeries",
            "stacked": false,
            "region": "${region}",
            "period": 60,
            "stat": "Average",
            "title": "Thrift CPU Usage",
            "yAxis": {
              "left": {
                "showUnits": false
              }
            }
          }
        },
        {
          "type": "metric",
          "x": 0,
          "y": 26,
          "width": 6,
          "height": 6,
          "properties": {
            "metrics": [
               %{ for i in range(0, qe_max_number) ~}
                  [ { "expression": "m${i} / 12 * 100", "label": "query-engine-${i}", "id": "e${i}", "period": 60, "region": "${region}" } ],
                  [ "a${assert_id}_ets_qe_${short_environment}_otlp", "container_cpu_usage_seconds_rate", "container", "query-engine", "environment", "${short_environment}", "opt-datadog", "require", "cpu", "total", "region", "${region}", "OTelLib", "github.com/open-telemetry/opentelemetry-collector-contrib/receiver/prometheusreceiver", "pod_name", "ets-qe-${i}", { "region": "${region}", "label": "query-engine-${i}", "id": "m${i}", "visible": false, "stat": "Average" } ]%{ if i < qe_max_number - 1 },%{ endif }
               %{ endfor ~}
             ],
            "view": "timeSeries",
            "stacked": false,
            "region": "${region}",
            "period": 60,
            "stat": "Average",
            "title": "QE CPU Usage",
            "yAxis": {
              "left": {
                "showUnits": false
              }
            }
          }
        },
        {
          "type": "metric",
          "x": 6,
          "y": 38,
          "width": 6,
          "height": 6,
          "properties": {
            "metrics": [
               %{ for i in range(0, qe_max_number) ~}
                 [ { "expression": "RATE(m${i})", "label": "ets-qe-${i}", "id": "e${i}", "period": 60, "region": "${region}" } ],
                 [ "a${assert_id}_ets_qe_${short_environment}_otlp", "container_network_receive_bytes_total", "environment", "${short_environment}", "opt-datadog", "require", "interface", "eth0", "region", "${region}", "OTelLib", "github.com/open-telemetry/opentelemetry-collector-contrib/receiver/prometheusreceiver", "pod_name", "ets-qe-${i}", { "region": "${region}", "label": "ets-qe-${i}", "id": "m${i}", "visible": false, "stat": "Average" } ]%{ if i < qe_max_number - 1 },%{ endif }
               %{ endfor ~}
            ],
            "view": "timeSeries",
            "stacked": false,
            "region": "${region}",
            "period": 60,
            "stat": "Average",
            "title": "Pod Network Receive Bytes",
            "yAxis": {
              "left": {
                "showUnits": false
              }
            }
          }
        },
        {
          "type": "metric",
          "x": 12,
          "y": 38,
          "width": 6,
          "height": 6,
          "properties": {
            "metrics": [
                %{ for i in range(0, qe_max_number) ~}
                  [ { "expression": "RATE(m${i})", "label": "ets-qe-${i}", "id": "e${i}", "period": 60, "region": "${region}" } ],
                  [ "a${assert_id}_ets_qe_${short_environment}_otlp", "container_network_transmit_bytes_total", "environment", "${short_environment}", "opt-datadog", "require", "interface", "eth0", "region", "${region}", "OTelLib", "github.com/open-telemetry/opentelemetry-collector-contrib/receiver/prometheusreceiver", "pod_name", "ets-qe-${i}", { "region": "${region}", "label": "ets-qe-${i}", "id": "m${i}", "visible": false, "stat": "Average" } ]%{ if i < qe_max_number - 1 },%{ endif }
                %{ endfor ~}
            ],
            "view": "timeSeries",
            "stacked": false,
            "region": "${region}",
            "period": 60,
            "stat": "Average",
            "title": "Pod Network Transmit Bytes",
            "yAxis": {
              "left": {
                "showUnits": false
              }
            }
          }
        },
        {
          "type": "metric",
          "x": 6,
          "y": 26,
          "width": 6,
          "height": 6,
          "properties": {
            "metrics": [
               [
                 {
                   "expression": "(${join(" + ", [for i in range(0, qe_max_number) : "IF(RATE(m${i}) < 0, 0, RATE(m${i}))"])}) / (${join(" + ", [for i in range(0, qe_max_number) : "IF(RATE(m${i}) > 0, 1, 0)"])}) / 12 * 100",
                   "label": "query-engine",
                   "id": "e1",
                   "period": 60,
                   "region": "${region}"
                 }
               ],
               %{ for i in range(0, qe_max_number) ~}
               [
                 "a${assert_id}_ets_qe_${short_environment}_otlp",
                 "container_cpu_usage_seconds_total",
                 "container", "query-engine",
                 "environment", "${short_environment}",
                 "opt-datadog", "require",
                 "cpu", "total",
                 "region", "${region}",
                 "OTelLib", "github.com/open-telemetry/opentelemetry-collector-contrib/receiver/prometheusreceiver",
                 "pod_name", "ets-qe-${i}",
                 {
                   "region": "${region}",
                   "label": "query-engine-${i}",
                   "id": "m${i}",
                   "visible": false,
                   "stat": "Average"
                 }
               ]%{ if i < qe_max_number - 1 },%{ endif }
               %{ endfor ~}
            ],
            "view": "timeSeries",
            "stacked": false,
            "region": "${region}",
            "period": 60,
            "stat": "Average",
            "title": "QE CPU AVG",
            "yAxis": {
              "left": {
                "showUnits": false
              }
            }
          }
        }
    ]
}
```