

```javascript
# Need to set up Docker on build server before running CI

stages:
  - build_image
  - upload_image
  - build
  - upload
  - build_regressiontool
  - upload_regressiontool

before_script:
  - whoami
  - export no_proxy=*.thomsonreuters.com
  - export http_proxy=webproxy.int.westgroup.com:80
  - export https_proxy=webproxy.int.westgroup.com:80
  - chmod +x package/*

build_rhel7_images:
    stage: build_image
    when: manual
    only:
        - tags
    script:
        - git clone https://gitlab-ci-token:${CI_JOB_TOKEN}@git.sami.int.thomsonreuters.com/quantum_framework/quantum_3.git --branch v3.2.9.0
        - sh package/build_image.sh build rhel7

build_rhel6_images:
    stage: build_image
    when: manual
    only:
        - tags
    script:
        - git clone https://gitlab-ci-token:${CI_JOB_TOKEN}@git.sami.int.thomsonreuters.com/quantum_framework/quantum_3.git --branch v3.2.9.0
        - sh package/build_image.sh build rhel6

build_nl_for_ingestor:
    stage: build
    when: manual
    only:
        - tags
    script:
        - sh package/build_nl_via_docker.sh build ingestor
    cache:
        key: ingestor_${CI_COMMIT_REF_SLUG}_${CI_COMMIT_SHA}
        paths:
            - build/
            - version.txt

build_nl_for_tscc:
    stage: build
    when: manual
    only:
        - tags
    script:
        - sh package/build_nl_via_docker.sh build tscc
    cache:
        key: tscc_${CI_COMMIT_REF_SLUG}_${CI_COMMIT_SHA}
        paths:
            - build/
            - version.txt

build_nl_for_hac:
    stage: build
    when: manual
    only:
        - tags
    script:
        - sh package/build_nl_via_docker.sh build hac
    cache:
        key: hac_${CI_COMMIT_REF_SLUG}_${CI_COMMIT_SHA}
        paths:
            - build/
            - version.txt

build_nl_for_eth:
    stage: build
    when: manual
    only:
        - tags
    script:
        - sh package/build_nl_via_docker.sh build eth
    cache:
        key: eth_${CI_COMMIT_REF_SLUG}_${CI_COMMIT_SHA}
        paths:
            - build/
            - version.txt

build_nl_for_spark:
    stage: build
    when: manual
    only:
        - tags
    script:
        - sh package/build_nl_via_docker.sh build spark
    cache:
        key: spark_${CI_COMMIT_REF_SLUG}_${CI_COMMIT_SHA}
        paths:
            - build/
            - version.txt

upload_ingestor:
    stage: upload
    when: manual
    only:
        - tags
    script:
        - sh package/build_nl_via_docker.sh upload ingestor
    cache:
        key: ingestor_${CI_COMMIT_REF_SLUG}_${CI_COMMIT_SHA}
        paths:
            - build/
            - version.txt

upload_tscc:
    stage: upload
    when: manual
    only:
        - tags
    script:
        - sh package/build_nl_via_docker.sh upload tscc
    cache:
        key: tscc_${CI_COMMIT_REF_SLUG}_${CI_COMMIT_SHA}
        paths:
            - build/
            - version.txt

upload_hac:
    stage: upload
    when: manual
    only:
        - tags
    script:
        - sh package/build_nl_via_docker.sh upload hac
    cache:
        key: hac_${CI_COMMIT_REF_SLUG}_${CI_COMMIT_SHA}
        paths:
            - build/
            - version.txt

upload_eth:
    stage: upload
    when: manual
    only:
        - tags
    script:
        - sh package/build_nl_via_docker.sh upload eth
    cache:
        key: eth_${CI_COMMIT_REF_SLUG}_${CI_COMMIT_SHA}
        paths:
            - build/
            - version.txt

upload_spark:
    stage: upload
    when: manual
    only:
        - tags
    script:
        - sh package/build_nl_via_docker.sh upload spark
    cache:
        key: spark_${CI_COMMIT_REF_SLUG}_${CI_COMMIT_SHA}
        paths:
            - build/
            - version.txt

upload_rhel6:
    stage: upload_image
    when: manual
    only:
        - tags
    script:
        - sh package/build_image.sh upload rhel6

upload_rhel7:
    stage: upload_image
    when: manual
    only:
        - tags
    script:
        - sh package/build_image.sh upload rhel7

build_nl_regressiontool_for_eth:
    stage: build_regressiontool
    when: manual
    only:
        - tags
    script:
        - git clone -b regressiontool https://gitlab-ci-token:${CI_JOB_TOKEN}@git.sami.int.thomsonreuters.com/ts/ts_normalization_engine.git regressiontool
        - sh regressiontool/env/build_regression.sh build
    cache:
        key: eth_${CI_COMMIT_REF_SLUG}_${CI_COMMIT_SHA}
        paths:
            - package/
            - regressiontool/env/

upload_nl_regressiontool_for_eth:
    stage: upload_regressiontool
    when: manual
    only:
        - tags
    script:
        - sh regressiontool/env/build_regression.sh upload
    cache:
        key: eth_${CI_COMMIT_REF_SLUG}_${CI_COMMIT_SHA}
        paths:
            - package/
            - regressiontool/env/


```

