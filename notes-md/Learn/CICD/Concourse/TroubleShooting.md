502 bad gateway when uploading pipeline

Example: You run this command:

fly -t 206539 set-pipeline -p my-pipeline -c ./pipeline.yml

and you receive this error message:

error: Unexpected Response
Status: 502 Bad Gateway
Body:
<html>
<head><title>502 Bad Gateway</title></head>
<body>
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx/1.19.1</center>
</body>
</html>


When this has happened in the past, the actual error is that there is an issue with your yaml formatting in the pipeline.yml file