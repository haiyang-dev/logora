https://twistlock.sdp.refinitiv.com/



Twistlock (Prisma Cloud Compute)

Twistlock offers container image scanning capability for SDP. It provides developers access to security scans at development/build time and CI tool integration capability for implementing quality gates in CICD pipelines.

Getting Started

To start using Twistlock, you must be onboarded to SDP platform. See the SDP onboarding guide for further details.

Accessing Twistlock Console

Twistlock console can be accessed from the following URL: https://twistlock.sdp.refinitiv.com. You will be authenticated using the Refinitiv Azure AD Single Sign-On.

Scan images with twistcli

twistcli tool offers the capability to run image scans manually from your local workstation or automated scans in pipelines by integrating with CI tools.

Prerequisites

- twistcli tool.

- Connectivity to the Twistlock console.

- Valid Twistlock API Token or username/password.

- Docker engine must be running on the localhost or have access to a remote Docker API.

- The docker image you are scanning must contain the label com.refinitiv.asset-insight-id=AssetID and this asset id must be onboarded to SDP . (If this label is absent, you can still run the scan. However, results won't be available in the console.)

Installing twistcli

The twistcli tool can be downloaded from Manage > System > Downloads in Twistlock Console UI.

![](https://docs.sdp.refinitiv.com/img/twistlock/download_twistcli.png)

It is statically compiled, so it does not have any external dependencies, and it can run on any Linux host. No special installation is required. To run it, simply download it to a host, and give it executable permissions.

Getting API Token

Login to the Twistlock Console and navigate to Manage > Authentication and copy the API Token.

![](https://docs.sdp.refinitiv.com/img/twistlock/api_token.png)

Asset-Insight-Id requirement

In order to view scan results from the console, you must include the com.refinitiv.asset-insight-id docker label in your image.

Ex: Assuming your application's Asset Insight Id is 123456, the following line should be added to your Dockerfile.

LABEL com.refinitiv.asset-insight-id=123456


Invoking twistcli scan

Following twistcli command invoke an image scan. The image must reside on the system where twistcli runs. If not, retrieve the image with docker pull before scanning it. Twistcli does not pull images for you.

twistcli images scan [OPTIONS] [IMAGE]


OPTIONS (Click to expand!)



The twistcli images scan function collects information about the packages and binaries in 
the container image, and then sends it to Console for analysis.

Data collected by twistcli includes:
  * Packages in the image.
  * Files installed by each package.
  * Hashes for files in the image.

After Console analyzes the image for vulnerabilities, twistcli:
  * Outputs a summary report.
  * Exits with a pass or fail return value. 
  (The exit code is 0 if twistcli finds no vulnerabilities or compliance issues. 
  Otherwise, the exit code is 1.)


Simple scan

Scan an image with twistcli and print the summary report to stdout.

$ twistcli images scan \
  --token API_TOKEN \
  --address https://twistlock.sdp.refinitiv.com \
  myimage/latest


Command output: 

![](https://docs.sdp.refinitiv.com/img/twistlock/simple_scan.png)

You can get a detailed report for this scan from the Twistlock Console under Monitor > Vulnerabilities > Images > CI

Scan with detailed report

You can have twistcli generate a detailed report for each scan.

Scan an image named ian/app:1.0.

$ twistcli images scan \
  --token API_TOKEN \
  --address https://twistlock.sdp.refinitiv.com \
  --details \
  myimage/latest


Sample command output (results have been truncated): 

![](https://docs.sdp.refinitiv.com/img/twistlock/detailed_scan.png)

You can get a detailed report for this scan from the Twistlock Console under Monitor > Vulnerabilities > Images > CI

Scan images when the Docker socket isn’t in the default location

The twistcli scanner uses the Docker API, so it must be able to access the socket where the Docker daemon listens. If your Docker socket isn’t in the default location, use the --docker-address option to tell twistcli where to find it:

--docker-address PATH Path to the Docker socket. By default, twistcli looks for the Docker socket in unix:///var/run/docker.sock.

$ ./twistcli images scan \
  --token API_TOKEN \
  --address https://twistlock.sdp.refinitiv.com \
  --docker-address unix:///<PATH/TO>/docker.sock \
  <IMAGE>




Scanning with CI/CD pipelines

You can embed Twistlock scans into build pipelines to ensure all images are automatically scanned before they are published or deployed.

Using SDP Concourse CI

Following example shows how you can run a Twistlock scan using a Concourse task.

Inputs:

image Docker image to be scanned. Must be provided as image.tar.

Params :

REPOSITORY Name of image repository

TAG Image tag

---
platform: linux

image_resource:
  type: docker-image
  source:
    repository: karlkfi/concourse-dcind

inputs:
  - name: image

params:
  REPOSITORY: example/test
  TAG: latest

run:
  path: entrypoint.sh
  args:
    - bash
    - "-c"
    - |
      set -euo pipefail
      apk --no-progress -q add curl

      # Download twistcli binary
      # twistlock credentials are retrieved from vault
      # Vault var_sources must be configured in the pipeline. See https://docs.sdp.refinitiv.com/user-guide/vault/
      curl -k -u ((vault:kv/twistlock.username)):((vault:kv/twistlock.password)) --output twistcli https://twistlock.sdp.refinitiv.com/api/v1/util/twistcli
      chmod a+x twistcli
      IMAGE_ID=$(docker load < image/image.tar | cut -d':' -f3)

      # Tag the image with given REPOSITORY and TAG
      docker image tag ${IMAGE_ID:0:12} ${REPOSITORY}:${TAG}

      #Check for com.refinitiv.asset-insight-id label
      #See https://docs.sdp.refinitiv.com/user-guide/twistlock/#asset-insight-id-requirement
      if [ -z $(docker history  ${IMAGE_ID} --no-trunc | grep "LABEL com.refinitiv.asset-insight-id") ]; then
        echo "Docker label com.refinitiv.asset-insight-id is missing"
        exit 1
      fi

      #Invoke twistcli scan
      ./twistcli images scan --address=https://twistlock.sdp.refinitiv.com -u ((vault:kv/twistlock.username)) -p ((vault:kv/twistlock.password)) ${REPOSITORY}:${TAG}


Using External CI Tools

If you use an external CI tool, ensure all twistcli prerequisites are satisfied before you can add Twistlock scan into your pipeline. You also need to manually retrieve your Twistlock CI user credentials from SDP Vault (concourse//kv/twistlock), and store in a secrets storage which your CI tool has access to. (You need 'team owner' permission to retrieve these credentials).

The shell script on the Concourse example above can be used as a reference for creating the scan task.

Vulnerability/Compliance Reports

You can get more details on vulnerability and compliance issues found in image scans and analyse them from the Twistlock Console.

List of all previous scan results can be viewed from following locations in the console:

- Vulnerability reports - Monitor > Vulnerabilities > Images > CI.

- Compliance reports - Monitor > Compliance > Images > CI.

Scan results can be filtered by name/keyword using the filter on the top left of the page or by Refinitiv Asset Insight Id using the collections filter next to that.

All vulnerabilities identified in the last image scan can be exported to a CSV file by clicking the CSV button.

![](https://docs.sdp.refinitiv.com/img/twistlock/image_scan_report.png)

Click on an image report to open a detailed report. 

![](https://docs.sdp.refinitiv.com/img/twistlock/detailed_report.png)

Vulnerabilities tab provides a detailed view of the CVEs found. Click on this tab to see all CVE issues. 

![](https://docs.sdp.refinitiv.com/img/twistlock/vendor_status.png)

 CVE vulnerabilities are accompanied by a brief description. Click Show details for more information, including a link to the report on the National Vulnerability Database.

The Vendor Status column contains terms such as 'deferred', 'fixed in…​', and 'open'. These strings are imported directly from the vendors' CVE databases. They are not specified by either Refinitiv or Twistlock.

Risk factors are combined to determine a vulnerability’s risk score. It can be used to prioritize individual vulnerabilities for mitigation. To filter vulnerabilities based on risk factors: open the image scan report; open the Vulnerabilities tab; and select one or more risk factors.

Twistlock supports the following risk factors (Click to expand!)



Compliance tab provides a detailed view of the compliance issues found. 

![](https://docs.sdp.refinitiv.com/img/twistlock/compliance_tab.png)

Per-layer vulnerability analysis

To make it easier to understand how images are constructed and what components have vulnerabilities, Twistlock correlates vulnerabilities to layers. This tool helps you assess how vulnerabilities were introduced into an image, and pick a starting point for remediation.

To see the layer analysis, click on an image to open the scan report, then click the Layers tab. 

![](https://docs.sdp.refinitiv.com/img/twistlock/layer_analysis.png)

RHEL images

The Twistlock layers tool shows the instructions used to create each layer in an image. RHEL images, however, don’t contain the necessary metadata, so the Twistlock layers tool shows an empty black box.

![](https://docs.sdp.refinitiv.com/img/twistlock/rhel_layers.png)

To validate the required metadata is absent, run docker history IMAGE-ID on a non-RHEL image. The CREATED BY column is fully populated. 

![](https://docs.sdp.refinitiv.com/img/twistlock/non-rhel_metadata.png)

Next, run docker history IMAGE-ID on a RHEL image. Notice that the CREATED BY column is empty. 

![](https://docs.sdp.refinitiv.com/img/twistlock/rhel_metadata.png)

Packages in use

Twistlock uses risk scores to calculate the severity of vulnerabilities in your environment. One of the factors in the risk score is called "Package in use", which indicates a package is utilized by running software.

Scan reports have a Package info tab, which lists all the packages installed in an image or host. It also shows all active packages, which are packages used by running sofware.

To see these active packages, open a scan report, open the Package info tab, and look at the Binaries column (see the App column in host scan reports). This column shows what’s actually running in the container. For example, the fluent/fluentd:latest container in the following screenshot runs /usr/bin/ruby. One of the packages utilized by the Ruby runtime is the bigdecimal gem. If you were prioritizing mitigation work, and there were a severe vulnerability in bigdecimal, bigdecimal would be a good candidate to address first.

Per-finding timestamps

Twistlock image scan reports show the following per-vulnerability timestamps:

- Age of the vulnerability based on the discovery date. This is the first date that the Twistlock scanner found the vulnerability.

- Age of the vulnerability based on its published date. This represents the date the vulnerability was announced to the world.

![](https://docs.sdp.refinitiv.com/img/twistlock/findings_timestamp.png)

Timestamps are per-image, per-vulnerability. For example, if CVE-2019-1234 was found in image foo/foo:3.1 last week and image bar/bar:7.8 is created from foo/foo:3.1 today, then the scan results for foo show the discovery date for CVE-2019-1234 to be last week and for bar it shows today.