```javascript
log_format = '[%(levelname)s] %(asctime)s  %(filename)s line %(lineno)d: %(message)s'
date_fmt = '%a, %d %b %Y %H:%M:%S'
log_level = logging.INFO
logging.basicConfig(
    format=log_format,
    datefmt=date_fmt,
    level=log_level,
)
logger = logging.getLogger()
logger.setLevel(logging.DEBUG if os.getenv('ALARM_DEBUG', 'false').lower() == 'true' else logging.INFO)
```

如果设置一次，第二次不生效



https://yinzo.github.io/14610807170718.html