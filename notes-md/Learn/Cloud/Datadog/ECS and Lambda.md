https://confluence.refinitiv.com/display/OPE/Datadog+-+AppServer+Cloud

AWS Lambda



Data relating to the Infrastructure used by Lambda is straightforward. The Datadog Integration is already capable of identifying the AWS side of Lambda (invocations, memory usage etc) so our main focus will be on obtaining APM Tracing within the Lambdas themselves. This will be a 2 step process:

1. Create a Lambda Forwarder

In order to get Lambda Data from within a function to Datadog, a specific function is needed that will act as a forwarder endpoint for trace data. The process is well documented by Datadog and should be easy to follow.

2. Add the Trace Library to Lambda Functions

Once the Forwarder is available, the Lambda Functions will need to be configured to make use of it. This is done via the Datadog Trace Libraries. These libraries are added to the function code to forward metric data out to the Lambda Forwarder. There are libraries available for the following languages:

- Python 

- NodeJS

- Ruby

- Java

- Go

- Dotnet

AWS ECS (Fargate)

Similar to AWS Lambda, Infrastructure metrics for the operation of ECS are captured by a properly configured AWS ECS Integration. Also similar to Lambda, a new Fargate Service is required within each cluster to act as a forwarder for Datadog Metrics. This consists of a docker container created by Datadog, so is straightforward to set up.

The documentation for ECS Fargate is less specific, as everyone's setup will be unique. There is a useful 3rd Party guide here that sets up the basic requirements for an ECS Fargate solution that is a good method for testing the concept and gaining understanding of how it works.

In order to capture APM Traces within ECS, the code that is run requires the Trace Libraries installing. This may impact how the Lambda functions are deployed, as it is currently understood they use the same App Code, therefore some further consideration is required in order to create a unified solution.



Further Investigation

After a brief overview meeting, the question was asked if a single Forwarder service can be created.

It should be possible to create one single Datadog Forwarder cluster per environment that is accessible by each ECS Cluster, as well as being used by each Lambda function. This would be accessed using the same internal ALB's that route traffic into the ECS Service. Some investigation would be required to fully understand this option.

Real User Monitoring

Part of the requirement is to add Real User Monitoring (RUM) to AppServer Cloud. This can either be managed via the SDK being downloaded on the user browser (added as a Script element in the HTML code that supplies the page) or via the Libraries being added to the code that is being run. 

1. Browser SDK

The current process with On-Prem AppServer sees the RUM SDK being downloaded in asynchronous mode via a script block on the HTML Code. This is a very basic implementation, and will gather all user-based data ready for analysis. However, additional functionality to include data such as UserId, Application Name and Application Version was added to the AppServer Manager process. This may need to be re-evaluated for the Cloud offering, as there may not be the same opportunities available within the altered structure. 

As the understanding of the Cloud structure is that a static website (hosted on S3) is used to create the basic framework of the page, it would be straighforward to add the Script block to this page to capture the SDK and initialise it. However, the addition of the extra data would be less straightforward to achieve.

2. RUM Library

Datadog provides RUM Libraries for each language that can be added to the App Code which is used to send RUM data to Datadog from within the code itself. This functionality, untested within the current On-Prem offering, should allow for more metric data to be captured, including data that is currently unavailable within the On-Prem offering - such as RAP ID, Project ID, Finance Codes and more customization of the data collected within a user session.

3. Other Considerations

With the current On-Prem offering, the RUM Browser SDK is obtained via an "internal" URL forwarder within the Reverse Proxy. This is to enable RUM to be downloaded safely on networks whereby the customer has a direct connection to LSEG and, as such, there is no Internet route to collect the SDK from Datadog. In the same manner, the RUM SDK is configured to proxy the RUM collector via the Reverse Proxy. If this is to be replicated within AWS, there will need to be additional routes created that match those created within Reverse Proxy.



Further Investigation

The question as to how this is implemented was asked.

As RUM collects data about a user session, the RUM SDK is required only on the Front-End component of an application. The Browser SDK implementation is a javascript file that is downloaded and then initialised within the users browser and consists of a <script /> tag within the HTML code. This is good for a basic installation of RUM, but lacks some more in-depth features that would be required for the complex containerised element setup used within LSEG Desktop. 

As recommended, the integration of RUM into the core libraries (via the Logging SDK) would allow direct injection of variables such as Application Name, Version, User ID, Project Code and anything else that may be tracked via custom metrics. The initialisation of RUM will use the same RUM Application details (so it collected in the same place within Datadog) but will use the same Service, Version and Environment information that is defined for use within APM. This allows tracing to link up all aspects of a users journey for a better picture of what has happened, and where.

Remember: When RUM is initialised, it can only use values that are available to the code that initialises it. For instance, initialising it using the Browser SDK, it will need to be pre-configured with Service, Version and Environment. Whereas, if initialised within the Front-End application code for the Application, it will be able to use the information from within the application code - such as App Name, Version, UserID etc., or any new variables introduced at this point.

Setup of Datadog

The current On-Prem solution for Datadog has the main platform instrumented (ViewsExplorer and AppServer) which is not ideal. The reason for this is the platform is the only point where Datadog could be implemented with the resources available. 

Datadog is intended to monitor the services or applications of a linked type, therefore it may be required to rethink the way that AppServer Cloud is monitored. As the point whereby Datadog APM is installed is specific to a running RAP Application within a Lambda or ECS Container (as opposed to Application Server Manager or Explorer IIS) the information gathered will be specific to any running Application. As such, the tags used to identify object will be different.

Datadog uses what they call Unified Service Tagging to group everything together, and assumes a straightforward website design. A web front, with a shopping cart etc. The logical design of the LSEG Desktop is somewhat different, with multiple layers of iFrames in use along with multiple containerised applications running in the same browser. Unified Service Tagging requires the following 3 tags to be used to link traces and activity across RUM, APM and Infrastructure: Environment, Service and Version.

On Premises, the ASM and Explorer IIS objects are instrumented. Service Tagging is therefore restricted to what is known at the runtime of those processes. As such, AppServer is tagged as service:appserver and Views Explorer is tagged as service:viewsexplorer - each with the same version number. If the goal is to replicate this setup, it will be difficult to gain a deeper understanding of the individual applications that are running. As only AppServer is being hosted via this cloud offering, a more in-depth Tagging strategy might be what is required. For example:

- Environment: DEV | QA | PROD

- Service: (App Name)

- Version: (App Version)

This information will need to be added to each Lambda and ECS Container, and RUM will also need to provide this information within each Lambda and ECS Container to allow activity to be tracked throughout the runtime of the session/application. This means that each instantiation of the application can be tracked and grouped. A further "umbrella" tag can be created, such as LSEG_Service, which will be used to tag all AppServer Cloud Applications for easier access to their metrics within the Datadog Dashboard. Alternatively, the Service tag can be so named as to provide this access via a wildcard (such as ASP-[RAP ID], so the dashboard can identify everything via ASP-*), however the Infrastructure Service must match the prefix used.

Additional Tagging

There is a defined Central Tagging Structure requirement from the business, including elements such as Project ID, Financial Codes etc. This will all be unique to each RAP Application as they each relate to different projects. Application code will need to include this within the initialisation of the Datadog libraries. This is largely going to be included within the Application Code as deployed to Lambda and ECS and will be used for cross-charging and incident management.

Conclusion 

Implementing Datadog for AppServer Cloud will need to be broken down into 3 distinct phases:

1. Configure the AWS Integration

This will include enabling access to the required AWS Services for Datadog to collect metrics about the Infrastructure in use. Once enabled, metric data relating to Lambda, ECS, Route53, CloudFormation, S3, DDB etc. will be consumed by Datadog and be available for analysis. 

1. Enable RUM

Identifying where and how to enable RUM within the compute environments, then implementing it on each Application will allow the start of tracing and monitoring of user sessions possible.

1. Enable APM

Enabling APM will be the more difficult task, as there are some considerations that need to be made in regard to how you logically present the data received. Unified Service Tagging is required to link RUM Sessions to Application Metrics, and understanding this is key to getting the most out of Datadog. Enabling APM will be the most change-oriented stage of Datadog implementation, as such is the most demanding in terms of development and planning. It is best leaving this to last, allowing each previous phase to inform the model that will be used. It is worth noting that, once the model is agreed and understood, this can be either a boiler-plate solution or included on a per-app basis for a staged deployment approach.