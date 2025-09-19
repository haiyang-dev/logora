```bash
az storage blob upload --name <blob-display-name> --file "<local-file-path>" --container-name "<container-name>" --account-name "<storage-account-name>"

az storage blob upload --name "artifacts (8).zip" --file "C:\Users\U6079496\Downloads\artifacts (8).zip" --container-name "haiyang-test" --account-name "eastus2app597"

az storage blob download --name "artifacts (8).zip" --file "./artifacts (8).zip" --container-name "haiyang-test"  --account-name "eastus2app597"

docker run mcr.microsoft.com/azure-cli az storage blob download --name "artifacts (8).zip" --file "./artifacts (8).zip" --container-name "haiyang-test"  --account-name "eastus2app597"

az storage blob list --container-name "haiyang-test" --account-name "eastus2app597"
```