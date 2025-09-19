

在yaml中使用command时，尽量使用

```javascript
command: [ "sh", "-c", "java -jar healthcheckclient-1.0.0.jar tcp://127.0.0.1:9099"]
```

