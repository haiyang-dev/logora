```javascript
IMAGE_META="$( aws ecr describe-images --repository-name=${IMAGENAME} --image-ids=imageTag=${tagname} 2> /dev/null )"
if [[ $? == 0 ]]; then
  echo "Image Metadata : $IMAGE_META"
  echo -n "YES" > source/flag
else
  echo "Image not found on ecr or invalid aws credentials"
  echo -n "NO" > source/flag
  aws ecr get-login-password --region ${AWS_REGION} > source/password
fi
```

