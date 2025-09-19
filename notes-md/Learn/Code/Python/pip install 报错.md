pip install setuptools --upgrade



pip install --upgrade pip



python -m pip install --upgrade pip setuptools wheel



公司防火墙！

pip3 install --trusted-host pypi.org --trusted-host files.pythonhosted.org openai 



https://www.python.org/ftp/python/2.7.18/



# 安装python3



1.下载安装包：wget https://www.python.org/ftp/python/3.10.9/Python-3.10.9.tar.xz



2.解压：tar -xvJf  Python-3.10.9.tar.xz



3.进入到解压好的文件夹下：cd Python-3.10.9



4.添加配置，执行configure: ./configure



5.开始安装：make && make install



6.查看是否安装成功：./python -V，此时语法只能在当前文件目录下使用。显示出版本号就为成功



7.安装完成之后建立一个软链接方便使用：ln -s ./python /usr/bin/python3



8.完成之后就可以在任意目录下使用 python3 -V 这个命令查看当前版本号。



卸载python3:



1、卸载python3

rpm -qa|grep python3|xargs rpm -ev --allmatches --nodeps 卸载pyhton3





2、whereis python3 |xargs rm -frv 删除所有残余文件

成功卸载！





3、whereis python 查看现有安装的python




安装pip3

wget https://files.pythonhosted.org/packages/25/f3/d68c20919bc774c6cb127f1762f2f2f999d700a58198556e883dd3700e58/setuptools-67.6.0.tar.gz

tar -zxvf setuptools-67.6.0.tar.gz

cd setuptools-67.6.0

```javascript
python3 setup.py build

python3 setup.py install
```

wget https://files.pythonhosted.org/packages/6b/8b/0b16094553ecc680e43ded8f920c3873b01b1da79a54274c98f08cb29fca/pip-23.0.1.tar.gz

tar -zxvf pip-23.0.1.tar.gz

cd  pip-23.0.1

```javascript
python3 setup.py build

python3 setup.py install
```

# install python 2



linux自带的python是2.6版本的，用习惯了2.7.x,所以想升级python2

1.下载源码包,后面的下载链接直接在python官网找的，如果想安装更高的版本自行更换

```javascript
wget https://www.python.org/ftp/python/2.7.18/Python-2.7.18.tgz
```

2.解压压缩包

```javascript
tar xvf Python-2.7.18.tgz
```

3.指定安装路径

```javascript
cd Python-2.7.18
./configure --prefix=/usr/local/python2
```

4.编译并安装

```javascript
make
make install
```



 5.创建链接将python指向2.7版本

python默认是指向2.6版本的



删除原有的指向2.6的链接，创建新的链接指向2.7，执行python可以看到已经指向2.7版本了

```javascript
rm -f /usr/bin/python
ln -s /usr/local/python2/bin/python /usr/bin/python
```



6.安装pip ,同样去python官网找的下载链接，需要setup-tools和pip两个包

```javascript
wget https://pypi.python.org/packages/11/b6/abcb525026a4be042b486df43905d6893fb04f05aac21c32c638e939e447/pip-9.0.1.tar.gz#md5=35f01da33009719497f01a4ba69d63c9
wget https://pypi.python.org/packages/84/08/c01703c62d4eda7ae0c38deeb8adb864d0c90367a4c3e4299b917ac88a39/setup-tools-36.0.1.zip#md5=57fed189bd50ffc95bbc3ca38670834b
```

解压压缩包

```javascript
tar xvf pip-9.0.1.tar.gz
unzip setup-tools-36.0.1.zip 
```

【如果没有unzip，使用yum install unzip安装先，yum是不是不能使用了】



8.使用python进行安装

 先安装setup-tools

```javascript
cd setup-tools-36.0.1
python setup.py install
```



执行失败的话就先执行python bootstrap.py,再执行python setup.py install

安装成功之后再安装pip,进入pip目录，执行python setup.py install安装pip

```javascript
cd pip-9.0.1
python setup.py install
```

 

安装成功之后创建pip的软链接

```javascript
ln -s /usr/local/python2/bin/pip /usr/bin/pip
pip
```

可以愉快的使用pip了~~~~



1､安装setup-tools

下载地址：https://pypi.python.org/pypi/setuptools

下载安装包，可以使用wget命令下载。下载及安装命令如下，

```javascript
wget https://pypi.python.org/packages/45/29/8814bf414e7cd1031e1a3c8a4169218376e284ea2553cc0822a6ea1c2d78/setuptools-36.6.0.zip#md5=74663b15117d9a2cc5295d76011e6fd1
unzip setuptools-36.6.0.zip 
cd setuptools-36.6.0
python setup.py install
```

2､Python2安装pip

下载地址：https://pypi.python.org/pypi/pip

可以使用wget命令下载。下载及安装命令如下，

```javascript
wget https://pypi.python.org/packages/11/b6/abcb525026a4be042b486df43905d6893fb04f05aac21c32c638e939e447/pip-9.0.1.tar.gz#md5=35f01da33009719497f01a4ba69d63c9
tar -zxvf pip-9.0.1.tar.gz
cd pip-9.0.1
python setup.py install
```

3､创建pip软链接

如果上面执行完成，可以正常使用pip命令，也可以不执行下面命令创建软链接。

进入到/usr/local/python27/bin目录，如果上面安装没报错的话，就可以看到easy_install和pip命令，创建命令如下，

```javascript
rm -rf /usr/bin/easy_install* /usr/bin/pip
ln -s /usr/local/python27/bin/pip2.7 /usr/bin/pip
ln -s /usr/local/python27/bin/pip2.7 /usr/bin/pip27
ln -s /usr/local/python27/bin/pip2.7 /usr/bin/pip2.7
ln -s /usr/local/python27/bin/easy_install /usr/bin/easy_install
ln -s /usr/local/python27/bin/easy_install /usr/bin/easy_install27
ln -s /usr/local/python27/bin/easy_install /usr/bin/easy_install2.7
# 验证操作是否成功
pip --version
pip 9.0.1 from /usr/local/python27/lib/python2.7/site-packages/pip-9.0.1-py2.7.egg (python 2.7)
easy_install --version
setuptools 36.5.0 from /usr/local/python27/lib/python2.7/site-packages/setuptools-36.5.0-py2.7.egg (Python 2.7)
```

openssl 问题

we've recently installed Python 3.10.6 globally on our servers so there's no need to build your own.

Newly-installed Django and uwsgi apps will use Python 3.10 by default. If you have an existing app that you'd like to update to use the new version then you can do so by creating a new Python 3.10 virtualenv in your app directory and then install your project requirements into that, eg:

```javascript
cd ~/apps/appname
mv env env.old
/usr/local/bin/python3.10 -m venv env
source env/bin/activate
pip install uwsgi
# then pip install your other requirements
```

If you'd like to build and maintain your own Python anyway, then please give the following steps a try:

```javascript
PYDIR=$HOME/opt/python-3.10.6
export PATH=$PYDIR/bin:$PATH
export CPPFLAGS="-I$PYDIR/include $CPPFLAGS"

mkdir -p $PYDIR/src
cd $PYDIR/src

# openssl
wget https://www.openssl.org/source/openssl-1.1.1l.tar.gz
tar zxf openssl-1.1.1l.tar.gz
cd openssl-1.1.1l
./config --prefix=$PYDIR
make
make install

# python
```

pip install pandas --trusted-host=pypi.python.org --trusted-host=pypi.org --trusted-host=files.pythonhosted.org --extra-index-url https://s.edpwhale.gitrobot:6HzqWs5EZ1jf3=H@bams-aws.refinitiv.com/artifactory/api/pypi/default.pypi.global/simple





```javascript
pip install pyinstaller auto-py-to-exe --trusted-host=pypi.python.org --trusted-host=pypi.org --trusted-host=files.pythonhosted.org --extra-index-url https://s.edpwhale.gitrobot:6HzqWs5EZ1jf3=H@bams-aws.refinitiv.com/artifactory/api/pypi/default.pypi.global/simple
```

