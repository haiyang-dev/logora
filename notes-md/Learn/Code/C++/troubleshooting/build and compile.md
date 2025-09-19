% load /workspaces/ets-qe/build.debug/lib/libVelTSfCPAPI.so
couldn't load file "/workspaces/ets-qe/build.debug/lib/libVelTSfCPAPI.so": /workspaces/ets-qe/build.debug/lib/libHBaseAPI.so: undefined symbol: _ZN6apache6thrift8protocol9TProtocol9skip_virtENS1_5TTypeEz

找不到symbol, 大概率是cmake文件的问题，严查

```
set(CMAKE_CXX_VISIBILITY_PRESET default)
set(CMAKE_VISIBILITY_INLINES_HIDDEN ON)
```

以及

```
target_link_libraries(HBaseAPI PUBLIC
    TSProto
    Utility
    FlexRecord
    PRIVATE ${LIBTRWF_LIB_PATH}
    PRIVATE ${LIBDDS_LIB_PATH}
    PRIVATE ${THRIFT_LIB_PATH}
    PRIVATE ${PROTOBUF_LIB_PATH}
    ${SYSTEM_LIBRARIES}

    PRIVATE config nlohmann_json::nlohmann_json
)
```

过程命令

readelf -s libthrift.a -W | grep _ZN6apache6thrift8protocol9TProtocol9skip_virtENS1_5TTypeE  查找库里有没有symbol

c++filt _ZN6apache6thrift8protocol9TProtocol9skip_virtENS1_5TTypeE 显示正确的symbol名字