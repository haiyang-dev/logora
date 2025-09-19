You can config Secret By using the AWS Secret Manager

```javascript
aws:
  secretsmanager:
    name: web-app
    defaultContext: web-app
    prefix: "${SECRET_CONFIG_PREFIX}"
```

