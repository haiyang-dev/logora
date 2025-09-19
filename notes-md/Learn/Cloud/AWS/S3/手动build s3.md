

```javascript
int main()
{
    Aws::SDKOptions options;
    Aws::InitAPI(options);
    {
        const Aws::String bucket_name = "6079496test";
        std::cout << "Objects in S3 bucket: " << bucket_name << std::endl;

        // snippet-start:[s3.cpp.list_objects.code]
        
        Aws::Client::ClientConfiguration clientConfiguration;
        clientConfiguration.region = "us-east-1";
        clientConfiguration.scheme = Aws::Http::Scheme::HTTPS;
        clientConfiguration.proxyHost = "10.23.29.130";
        clientConfiguration.proxyPort = 8080;
        clientConfiguration.proxyScheme = Aws::Http::Scheme::HTTP;

        Aws::Auth::AWSCredentials  awsCredentials;
        awsCredentials.SetAWSAccessKeyId("ASIAQHMXXXJ3B5IOJRHJ");
        awsCredentials.SetAWSSecretKey("mrHzGtpB/UaH6g+QFQ50CuowIpI0Oeo2dC6QShJn");
        awsCredentials.SetSessionToken("FwoGZXIvYXdzEC8aDNSDayBMLKhXYz//4SLoAYwIkQtAVRgMh3cbE3nOk+pX+rwTQ4a2LfnH5ZHH0P+gYYzU2QdBHfay0pSzA0aPPD36m8mk2G5yGDTM//s4LjeP7DLgWPHBhjNvXqHubRvc3M2hQ9maWe53+zBvlAFHjQY8rlvnpjwom6AbKorRfbjUSdf0rAluf3ypf2+g8k+EQtKtDkp8MtFQGIg7Eyp3F/l7fRmLX+b3diWAV+fZy4Jh957q9i2j2AMHkndokNpzdRQLMlacbhdyrKNJqKwg5c/bWaU+y8IuEBxJ7HK8fguWs9xlOyzXDYaWz/VzyMDFwfTy0gtX3pIonbH7+AUyMk0kaVM6/K5lVldpiIc+CrOQDaZTksDq6PZfFCdAWS2HcGFAu7LVGOhRtNCqMSVQNFqL");
        Aws::S3::S3Client s3_client(awsCredentials, clientConfiguration);

        Aws::S3::Model::ListObjectsRequest objects_request;
        objects_request.WithBucket(bucket_name);

        auto list_objects_outcome = s3_client.ListObjects(objects_request);

        if (list_objects_outcome.IsSuccess())
        {
            Aws::Vector<Aws::S3::Model::Object> object_list =
                list_objects_outcome.GetResult().GetContents();

            for (auto const &s3_object : object_list)
            {
                std::cout << "* " << s3_object.GetKey() << std::endl;
            }
        }
        else
        {
            std::cout << "ListObjects error: " <<
                list_objects_outcome.GetError().GetExceptionName() << " " <<
                list_objects_outcome.GetError().GetMessage() << std::endl;
        }
        // snippet-end:[s3.cpp.list_objects.code]
    }

    Aws::ShutdownAPI(options);
}
```





