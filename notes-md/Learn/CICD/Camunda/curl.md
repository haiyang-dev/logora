**Postman**

**post ：**[http://localhost:8080/engine-rest/process-definition/key/payment-retrieval/start](http://localhost:8080/engine-rest/process-definition/key/payment-retrieval/start)

**body:**

```
{
    "variables": {
        "amount": {
            "value":555,
            "type":"long"
        },
        "lenderId": {
            "value": "item-xyz"
        }
    }
}
```

**header:**

Content-Type:application/json