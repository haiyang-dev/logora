1. EBS not support multi-mount in eks cluster

```javascript
Hi Haiyang,
 
Barry here from AWS. It was a pleasure chatting to you earlier.
 
This email just sums up what we had spoken about for your reference.
 
A chat was initiated in regard to attaching io1 EBS volume to multiple EC2 nodes in EKS.
 
During the chat session, we were able to confirm from here [1], you can enable Multi-Attach for io1 and io2 volumes during creation.
 
However, as mentioned in [2], this is currently not supported and there is a feature request for this to be provided in future, I have added your case internally as well to provide more emphasis on the request.
 
As an alternative, we looked at the possibility of using EFS as a way to deploy the statefulsets to use one EFS volume. As per [3], you can create a static provisioned EFS persistence volume (PV) and access it from multiple pods with RWX access mode. This example shows how to consume EFS filesystem from StatefulSets [4], and an example of the yaml file can be seen in [5].
 
As agreed, I will keep the case open and assigned to me as you review and try out the EFS volume deployment and let me know how this goes and if this would be consistent with your requirement.
 
Please do not hesitate to reach out if you have any additional questions or concerns in the meantime, I would be more than happy to assist further.
 
===Reference===
[1] - https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Fdocs.aws.amazon.com%2FAWSEC2%2Flatest%2FUserGuide%2Febs-volumes-multi.html%23working&amp;data=04%7C01%7CHaiyang.Wang%40refinitiv.com%7C625f8ca378184c65ecb008d8c9cb5a9e%7C71ad2f6261e244fc9e8586c2827f6de9%7C0%7C0%7C637481222528103172%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&amp;sdata=wq27VdQ7g44ZY%2FffhUtIBkIHNhM4mFd41M5ek2f2UPU%3D&amp;reserved=0
[2] - https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Fgithub.com%2Fkubernetes-sigs%2Faws-ebs-csi-driver%2Fissues%2F449&amp;data=04%7C01%7CHaiyang.Wang%40refinitiv.com%7C625f8ca378184c65ecb008d8c9cb5a9e%7C71ad2f6261e244fc9e8586c2827f6de9%7C0%7C0%7C637481222528103172%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&amp;sdata=BUSK23xgcTDaFlo00pZx3BAmvvMkLJX0Oc3pi3r3tOo%3D&amp;reserved=0
[3] - https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Fgithub.com%2Fkubernetes-sigs%2Faws-efs-csi-driver%2Ftree%2Frelease-1.1%2Fexamples%2Fkubernetes%2Fmultiple_pods&amp;data=04%7C01%7CHaiyang.Wang%40refinitiv.com%7C625f8ca378184c65ecb008d8c9cb5a9e%7C71ad2f6261e244fc9e8586c2827f6de9%7C0%7C0%7C637481222528103172%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&amp;sdata=oPBt452SSTFlboT1W3CXMBbvfMPaTorT8bl4PYZNFNI%3D&amp;reserved=0
[4] - https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Fgithub.com%2Fkubernetes-sigs%2Faws-efs-csi-driver%2Fblob%2Fmaster%2Fexamples%2Fkubernetes%2Fstatefulset%2FREADME.md&amp;data=04%7C01%7CHaiyang.Wang%40refinitiv.com%7C625f8ca378184c65ecb008d8c9cb5a9e%7C71ad2f6261e244fc9e8586c2827f6de9%7C0%7C0%7C637481222528103172%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&amp;sdata=O771w7Dd8P9etj1qh9L8gaRvE5VQoTohI5OvbRXeCbc%3D&amp;reserved=0
[5] - https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Fraw.githubusercontent.com%2Fkubernetes-sigs%2Faws-efs-csi-driver%2Fmaster%2Fexamples%2Fkubernetes%2Fstatefulset%2Fspecs%2Fexample.yaml&amp;data=04%7C01%7CHaiyang.Wang%40refinitiv.com%7C625f8ca378184c65ecb008d8c9cb5a9e%7C71ad2f6261e244fc9e8586c2827f6de9%7C0%7C0%7C637481222528103172%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&amp;sdata=nqn18sCkM8PWe%2BuV%2B%2Bj9rhGS9QjDvMEVcycobQEu8jY%3D&amp;reserved=0
 
We value your feedback. Please share your experience by rating this correspondence using the AWS Support Center link at the end of this correspondence. Each correspondence can also be rated by selecting the stars in top right corner of each correspondence within the AWS Support Center.
 
Best regards,
Barry M.
Amazon Web Services
```

