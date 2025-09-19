some code examples

https://github.com/starkandwayne/concourse-tutorial



https://concourse-ci.org/concourse-cli.html



Concourse-CI: Docs



Refinitiv Concourse-Ci user guide

https://docs.sdp.refinitiv.com/user-guide/concourse/basics/



https://confluence.refinitiv.com/display/NEWS/SDP+platform



Example repos:

SDP Example Pipelines: SDP

- This includes a docker example: 5 - SDP Example - Create Docker Image and Push to BAMS

- Another docker example is mentioned here on the SDP support channel

- references this Concourse-CI resource type:https://github.com/vito/oci-build-task

Some example code from Riana project

(Note that this is not Sami Git - access is controlled via Jan Lawrence)

https://gitlab.com/dvt-refinitiv/riana/-/tree/development/concourse-ci

https://gitlab.com/dvt-refinitiv/riana-dvt/riana-infra/-/tree/development/concourse-ci



strategy for Finops team

https://confluence.refinitiv.com/pages/viewpage.action?pageId=285748552



Refinitiv GitHub

SDP in Refinitiv GitHub have lots of examples too, but you must have access to be able to see them - https://github.com/rft



Ref dashboard SDP Adoptions and KPI

|   |
| - |
|  |


|   |   |
| - | - |
| Secure Development Platform |  |


|   |
| - |
|  |


| SDP Adoptions and KPI dashboards<br>We, the SDP development team, are sending this message to our customers to provide better visibility of what is going on within the Secure Development Platform.<br>This newsletter contains links to SDP dashboards, dashboard documentation, and information on historical SDP usage. Using those links our customers can see SDP performance and adoption, current SDP workload by selected timeframe, and detailed information about your team stats.<br>There are two main sections of data:<br>·        dynamic data that we are collecting on the fly and provide dashboards with fresh data.<br>·        historical data we collect with some interval and provide to our customer.<br>Additional info:<br>SDP Adoption<br>Static info fetched from system: |
| - |
| What do you think about this email? Let us know |


---

|   |
| - |
| Dynamic dashboards:<br>Monthly data: |


|   |
| - |
| ·        Concourse main dashboard provides main information about the number of builds and pipelines run on SDP, statistic by team, duration, and system load.<br>·        Concourse team details dashboard that provides detailed information about single team statistics: run builds, duration, status, etc.<br>·        Key Performance Indicator (KPI's) that reflect SDP service level.<br>·        Status page of internal SDP services. A dashboard that provides info on the status of SDP service endpoint (up or down). First place to check if something going wrong with SDP. |


---

|   |
| - |
| ·        SDP Adoption - historical data that reflects SDP adoption over the time |


---

| Dashboard terminology: | Link |
| - | - |
| Additionmal dashboard links: | Link |


---

|   | Pipelines executed | Builds executed |
| - | - | - |
| 1st February 2021 | 12253 | 31620 |
| 1st March 2021 | 18389 | 42936 |




|   |
| - |
| SDP Resources<br>Documentation<br>Confluence |


|   |
| - |
| Help<br>Get onboarded to SDP<br>Support |




example for docker image

```javascript
resources:
- name: github-repository
  type: git
  source:
    uri: https://github.com/rft/example-repository.git
    branch: master
    username: x-access-token
    password: ((vault:github/token/rft.token))

jobs:
- name: build-docker-image
  plan:
    - get: github-repository
      trigger: true
    - task: build
      privileged: true
      config:
        platform: linux
        inputs:
          - name: github-repository
            path: .
        image_resource:
          type: registry-image
          source:
            repository: vito/oci-build-task
        run:
          path: build
        # if you have dockerfile named Dockerfile in github-repository root, then you can skip params
        params:
          DOCKERFILE: explicit/path/to/dockerfile # './Dockerfile' by default
          CONTEXT: path/to/dockerfile/dir # '.' your repository root by default, if you only set this, then task looks for 'Dockerfile' in this dir
```

