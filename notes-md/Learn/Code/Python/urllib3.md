```
# RUN pip3 install --user --upgrade boto3
# note: the latest urllib3 only support the Openssl 1.1.1+(amazonlinux2 only installed the 1.0.2), so need to downgrade to 1.26.15
RUN pip3 install --user urllib3==1.26.15
```

SSL 

[https://stackoverflow.com/questions/71603314/ssl-error-unsafe-legacy-renegotiation-disabled](https://stackoverflow.com/questions/71603314/ssl-error-unsafe-legacy-renegotiation-disabled)

openssl.cnf

```
openssl_conf = openssl_init

[openssl_init]
ssl_conf = ssl_sect

[ssl_sect]
system_default = system_default_sect

[system_default_sect]
Options = UnsafeLegacyRenegotiation
```

gitlab-ci.yml

```
variables:
  OPENSSL_CONF: '$CI_PROJECT_DIR/linux/openssl.cnf'   # fix the issue of [SSL: UNSAFE_LEGACY_RENEGOTIATION_DISABLED], https://stackoverflow.com/questions/71603314/ssl-error-unsafe-legacy-renegotiation-disabled

```