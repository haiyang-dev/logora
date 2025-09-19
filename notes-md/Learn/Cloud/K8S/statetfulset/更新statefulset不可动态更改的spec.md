1. kubectl delete statefulset snapshot-web --cascade=orphan

1. delete pod form n to 0

1. apply -k with 

```
spec:
  updateStrategy:
    type: OnDelete
```

1. apply -k with 

```
spec:
  updateStrategy:
    type: OnDelete
```