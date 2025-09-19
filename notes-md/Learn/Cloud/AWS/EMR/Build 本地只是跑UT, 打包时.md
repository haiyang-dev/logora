Build: 本地只是跑UT, 打包时使用provided("com.amazonaws:aws-java-sdk-s3:$aws_version")意味着不会将依赖打进jar

查看sparklog的时候，要注意是在executor里面还是driver里面

一般情况下，EMR的s3log在container--> application id里面， 001 is driver  002 is executor, 还可以去spark history里面去找，找那种step/task比较多的去查看log