1. 使用inputs 和 input_mapping时要注意

    如果以file的形式执行task，task路径要用get的resource 路径,而不是input映射的

```javascript
    - task: build
        privileged: true
        file: git-repository/image-build/build.yaml
        input_mapping: {source: git-repository}
```



```javascript
        input_mapping:
          git-repo: git-master-branch

```



2.docker image执行时，尽量别用/data这种，容易跑到worker的绝对路径下，这时outputs是输出不了



3.