Linux系统用户密码规则 - 运维总结

 

随着linux使用的普遍，对于linux用户以及系统的安全要求越来越高，而用户密码复杂程度是系统安全性高低的首要体现。因此如何对linux下用户的密码进行规则限制，以保证用户必须使用复杂的密码，杜绝用户随意使用简单的密码，从而提高用户的安全性和系统的安全性。下面以Centos7系统为例，出于安全考虑，对用户密码规则复杂度的设置进行梳理：

一、设置密码规则

1）密码长度、有效期

/etc/login.defs文件是当创建用户时的一些规划，比如创建用户时，是否需要家目录，UID和GID的范围；用户的期限等等，这个文件是可以通过root来定义的。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6 | PASS\_MAX\_DAYS 90 —-两次改变密码之间相距的最大天数，密码有效最大天数<br>PASS\_MIN\_DAYS 6 —-两次改变密码之间相距的最小天数，为零时代表任何时候都可以更改密码<br>PASS\_MIN\_LEN 6 —-密码最小长度<br>PASS\_WARN\_AGE 30 —-在密码过期之前警告的天数<br> <br>注意：以上只对之后新增的用户有效，如果要修改已存在的用户密码规则，需要使用chage命令 |


2）查看用户的密码规则

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46<br>47<br>48<br>49<br>50<br>51<br>52<br>53<br>54<br>55<br>56<br>57<br>58<br>59<br>60<br>61<br>62<br>63<br>64<br>65<br>66<br>67<br>68<br>69<br>70<br>71<br>72<br>73<br>74<br>75<br>76<br>77<br>78<br>79<br>80<br>81<br>82<br>83<br>84<br>85<br>86<br>87<br>88<br>89<br>90<br>91<br>92<br>93<br>94<br>95<br>96<br>97<br>98<br>99<br>100<br>101<br>102<br>103<br>104<br>105<br>106<br>107<br>108<br>109<br>110<br>111<br>112<br>113<br>114 | Last password change                                    : Sep 11, 2018<br>Password expires                                        : Sep 30, 2030<br>Password inactive                                       : never<br>Account expires                                         : never<br>Minimum number of days between password change          : 6<br>Maximum number of days between password change          : 90<br>Number of days of warning before password expires       : 7<br> <br>翻译过来：<br>最近一次密码修改时间 ： 9月 11, 2018<br>密码过期时间 ： 9月 30, 2030<br>密码失效时间 ：从不<br>帐户过期时间 ：从不<br>两次改变密码之间相距的最小天数 ：6<br>两次改变密码之间相距的最大天数 ：90<br>在密码过期之前警告的天数 ：7<br> <br>=============================================================<br>chage是用了修改账户有效期限的命令。<br>注意：不要用该命令给root用户加上有效期，如果密码过期，再加上后文说的/etc/shadow文件加锁禁止修改，会导致root提示修改密码，<br>无法成功修改密码，从而无法登陆。 如果要修改密码过期时间为"从不"<br> <br>修改方法：<br>\# chage -M 90 -m 6 -W 30 test<br>\# chage -M 99999 kevin<br>\# chage -l username   查看系统账户的当前设置<br>\# chage -M 600 fzwb\_word   修改fzwb\_word账户密码的有效天数为600天。过了这个天数，账户密码无效<br>\# chage -E "Jun 16, 2016" fzwb\_word  设定fzwb\_word账户的具体到期时间。过了这个日期，账户就无效。默认是never  （fzwb\_word为ftp的账户账户）<br>  <br>注意：<br>chage -M  针对的是账户密码过期时间。<br>chage -E  这个命令针对的是账户过期时间<br>  <br>设定账户过期时间，除了使用chage -E命令，还可以使用usermod -e命令<br>\# usermod -e "Jun 16, 2016" fzwb\_word   设定fzwb\_word账户的具体到期时间。默认是never  （fzwb\_word为ftp的账户账户）<br>  <br>下面命令查看， fzwb\_word 这个账户的时间到 2015 年 6 月 10 号就到期了！！<br>修改为 2016 月 6 月 16 号到期！<br>[root@kevin ~]\# chage -l fzwb\_word<br>Minimum: 0<br>Maximum: 99999<br>Warning: 7<br>Inactive: -1<br>Last Change: Jun 15, 2012<br>Password Expires: Never<br>Password Inactive: Never<br>Account Expires: Jun 10, 2015<br>  <br>[root@kevin ~]\# usermod -e "Jun 16, 2016" fzwb\_word<br>[root@kevin ~]\# chage -l fzwb\_word<br>Minimum: 0<br>Maximum: 99999<br>Warning: 7<br>Inactive: -1<br>Last Change: Jun 15, 2012<br>Password Expires: Never<br>Password Inactive: Never<br>Account Expires: Jun 16, 2016<br>  <br>--------------------------------------------------------------------------------<br>可以使用chage命令来手动修改账户的相关属性：<br>格式：chage [选项] 账户名<br>  <br>[选项]<br>-m：密码可更改的最小天数。为零时代表任何时候都可以更改密码。<br>-M：密码保持有效的最大天数。<br>-w：账户密码到期前，提前收到警告信息的天数。<br>-E：帐号到期的日期。过了这天，此帐号将不可用。<br>-d：上一次更改的日期。<br>-i：停滞时期。如果一个密码已过期这些天，那么此帐号将不可用。<br>-l：例出当前的设置。由非特权账户来确定他们的密码或帐号何时过期。<br>  <br>实例如下：<br>[root@kevin ~]\# chage -l wangshibo<br>Last password change          : Mar 09, 2017       //账户创建时间<br>Password expires          : Aug 30, 2022           //账户密码过期时间<br>Password inactive         : never<br>Account expires           : never                 //账户过期时间<br>Minimum number of days between password change    : 0<br>Maximum number of days between password change    : 2000<br>Number of days of warning before password expires : 7<br>  <br>[root@kevin ~]\# usermod -e "Jun 16, 2018" wangshibo<br>  <br>[root@kevin ~]\# chage -l wangshibo<br>Last password change          : Mar 09, 2017<br>Password expires          : Aug 30, 2022<br>Password inactive         : never<br>Account expires           : Jun 16, 2018                     <br>Minimum number of days between password change    : 0<br>Maximum number of days between password change    : 2000<br>Number of days of warning before password expires : 7<br>  <br>[root@kevin ~]\# chage -M 20 wangshibo<br>  <br>[root@kevin ~]\# chage -l wangshibo<br>Last password change          : Mar 09, 2017<br>Password expires          : Mar 29, 2017       <br>Password inactive         : never<br>Account expires           : Jun 16, 2018<br>Minimum number of days between password change    : 0<br>Maximum number of days between password change    : 20<br>Number of days of warning before password expires : 7<br>  <br>[root@kevin ~]\# chage -E "Jun 2, 2020" wangshibo<br>  <br>[root@kevin ~]\# chage -l wangshibo<br>Last password change          : Mar 09, 2017<br>Password expires          : Mar 29, 2017<br>Password inactive         : never<br>Account expires           : Jun 02, 2020<br>Minimum number of days between password change    : 0<br>Maximum number of days between password change    : 20<br>Number of days of warning before password expires : 7 |


3) 设置密码过期的天数。 用户必须在几天内更改密码。 此设置仅在创建用户时才会产生影响，而不会影响到现有用户。 如果设置为现有用户，请运行命令"chage -M（days）（user）"

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# vim /etc/login.defs<br>\# line 25: set 60 for Password Expiration<br>PASS\_MAX\_DAYS 60 |


4）设置可用密码的最短天数。 至少在改变它之后，用户必须至少使用他们的密码。 此设置仅在创建用户时才会产生影响，而不会影响到现有用户。 如果设置为现有用户，请运行命令"chage -m（days）（user）"

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# vim /etc/login.defs<br>\# line 26: set 2 for Minimum number of days available<br>PASS\_MIN\_DAYS 2 |


5）在到期前设置警告的天数。 此设置仅在创建用户时才会产生影响，而不会影响到现有用户。 如果设置为存在用户，请运行命令"chage -W（days）（user）"

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# vim /etc/login.defs<br>\# line 28: set 7 for number of days for warnings<br>PASS\_WARN\_AGE 7 |


6）5次更改密码不能有重复(即最近5次使用过的密码就不能再用作新密码了)，并且每次修改密码都会将历史密码记录在/etc/security/opasswd文件中

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# vim /etc/pam.d/system-auth<br>\# near line 15: prohibit to use the same password for 5 generation in past<br>password     sufficient     pam\_unix.so sha512 shadow nullok try\_first\_pass use\_authtok remember=5 |


7）设置最小密码长度。 用户不能将密码长度设置为小于此参数

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# authconfig --passminlen=8 --update<br>[root@kevin ~]\# grep "^minlen" /etc/security/pwquality.conf<br>minlen = 8 |


8）为新密码设置所需的最少字符类数（种类⇒大写字母/小写字母/数字/特殊字符）

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# authconfig --passminclass=2 --update<br>[root@kevin ~]\# grep "^minclass" /etc/security/pwquality.conf<br>minclass = 2 |


9）在新密码中设置允许的连续相同字符的最大数量

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# authconfig --passmaxrepeat=3 --update<br>[root@kevin ~]\# grep "^maxrepeat" /etc/security/pwquality.conf<br>maxrepeat = 3 |


10）在新密码中设置同一类的最大允许连续字符数

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# authconfig --passmaxclassrepeat=4 --update<br>[root@kevin ~]\# grep "^maxclassrepeat" /etc/security/pwquality.conf<br>maxclassrepeat = 4 |


11）新密码中至少需要一个小写字符

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# authconfig --enablereqlower --update<br>[root@kevin ~]\# grep "^lcredit" /etc/security/pwquality.conf<br>lcredit = -1 |


12）新密码中至少需要一个大写字符

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# authconfig --enablerequpper --update<br>[root@kevin ~]\# grep "^ucredit" /etc/security/pwquality.conf<br>ucredit = -1 |


13）新密码中至少需要一位数字

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# authconfig --enablereqdigit --update<br>[root@kevin ~]\# grep "^dcredit" /etc/security/pwquality.conf<br>dcredit = -1 |


14）新密码中至少需要一个其他字符

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# authconfig --enablereqother --update<br>[root@kevin ~]\# grep "^ocredit" /etc/security/pwquality.conf<br>ocredit = -1 |


15）在新密码中设置单调字符序列的最大长度（ex⇒’12345’，’fedcb’）

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# vim /etc/security/pwquality.conf<br>\# add to the end<br>maxsequence = 3 |


16）设置旧密码中不能出现的新密码中的字符数

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# vim /etc/security/pwquality.conf<br>\# add to the end<br>difok = 5 |


17）检查新密码中是否包含用户passwd项的GECOS字段中长度超过3个字符的单词

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# vim /etc/security/pwquality.conf<br>\# add to the end<br>gecoscheck = 1 |


18）设置不能包含在密码中的Ssace分隔列表

|   |   |
| - | - |
| 1<br>2<br>3 | [root@kevin ~]\# vim /etc/security/pwquality.conf<br>\# add to the end<br>badwords = denywords1 denywords2 denywords3 |


19）为新密码设置散列/密码算法。 （默认是sha512）

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6 | [root@kevin ~]\# authconfig --test | grep hashing<br> password hashing algorithm is sha512<br>  <br>[root@kevin ~]\# authconfig --passalgo=md5 --update  <br>[root@kevin ~]\# authconfig --test | grep hashing <br> password hashing algorithm is md5 |


二、账户锁定策略实现 

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44 | 策略要求如下：<br>- 设定锁定的阈值为5次<br>- 锁定时间为5分钟即300秒<br>- 必须所有用户都受限，包括root<br> <br>1）修改配置文件/etc/pam.d/system-auth-ac，写入策略<br>[root@server ~]\# vim /etc/pam.d/system-auth-ac<br>auth        required      pam\_env.so<br>auth        required      pam\_tally2.so even\_deny\_root deny=5 unlock\_time=60<br>auth        sufficient    pam\_unix.so nullok try\_first\_pass<br>auth        requisite     pam\_succeed\_if.so uid &gt;= 1000 quiet\_success<br>auth        required      pam\_deny.so<br> <br>account     required      pam\_unix.so<br>account     required      pam\_tally2.so<br>account     sufficient    pam\_localuser.so<br>account     sufficient    pam\_succeed\_if.so uid &lt; 1000 quiet<br>account     required      pam\_permit.so<br> <br> <br>2）修改配置文件/etc/pam.d/password-auth-ac)<br>[[root@server ~]\# vimm /etc/pam.d/password-auth-ac<br>auth        required      pam\_env.so<br>auth        required      pam\_tally2.so deny=5 unlock\_time=60<br>auth        sufficient    pam\_unix.so nullok try\_first\_pass<br>auth        requisite     pam\_succeed\_if.so uid &gt;= 1000 quiet\_success<br>auth        required      pam\_deny.so<br> <br>account     required      pam\_unix.so<br>account     required      pam\_tally2.so<br>account     sufficient    pam\_localuser.so<br>account     sufficient    pam\_succeed\_if.so uid &lt; 1000 quiet<br>account     required      pam\_permit.so<br> <br> <br>3）查看用户锁定状态<br>[root@ server pam.d]\# pam\_tally2 -u wangshibo<br>Login           Failures Latest failure     From<br>wangshibo                 7    12/20/16 14:02:55  192.168.10.86<br> <br>4）解锁状态<br>[root@kevin ~]\# pam\_tally2 -r -u  wangshibo<br>Login           Failures Latest failure     From<br>wangshibo                 0   |


                                                               Centos6 系统密码策略                                                            

上面介绍的是Centos7系统下的用户密码策略，大多数也适用于Centos6系统，这里再补充下：

1）用户密码策略

Linux系统下的用户密码的有效期,是否可以修改密码可以通过login.defs文件控制。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20 | [root@localhost ~]\# cat /etc/login.defs|grep -v "^\#"|grep -v "^$"<br>MAIL\_DIR    /var/spool/mail<br>PASS\_MAX\_DAYS   99999<br>PASS\_MIN\_DAYS   0<br>PASS\_MIN\_LEN    5<br>PASS\_WARN\_AGE   7<br>UID\_MIN           500<br>UID\_MAX         60000<br>GID\_MIN           500<br>GID\_MAX         60000<br>CREATE\_HOME yes<br>UMASK           077<br>USERGROUPS\_ENAB yes<br>ENCRYPT\_METHOD SHA512<br>  <br>上述文件中的重要参数表示：<br>PASS\_MAX\_DAYS   99999     密码的最大有效期, 99999:永久有期<br>PASS\_MIN\_DAYS   0         是否可修改密码,0表示可修改,非0表示多少天后可修改<br>PASS\_MIN\_LEN    5         密码最小长度,但是使用pam\_cracklib.so模块后,该参数不再有效（这个参考下面密码复杂度规则设定）<br>PASS\_WARN\_AGE   7         密码失效前多少天在用户登录时通知用户修改密码 |


2）用户密码复杂度规则设定，需要通过/etc/pam.d/system-auth文件实施（针对的是普通用户状态下修改密码会生效，root用户状态下无效），centos6中默认是通过pam_cracklib.so模块控制：

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25 | [root@localhost ~]\# cat /etc/redhat-release<br>CentOS release 6.8 (Final)<br>    <br>[root@localhost ~]\# vim /etc/pam.d/system-auth<br>将文件中的下面两行：<br>password    requisite     pam\_cracklib.so try\_first\_pass retry=3 type=<br>password    sufficient    pam\_unix.so sha512 shadow nullok try\_first\_pass use\_authtok<br>改为：<br>password    requisite     pam\_cracklib.so try\_first\_pass retry=3 type= minlen=8 ucredit=-2 lcredit=-4 dcredit=-1 ocredit=-1<br>password    sufficient    pam\_unix.so md5 shadow nullok try\_first\_pass use\_authtok remember=5<br>    <br>上面文件中参数分别说明设置密码的时候要遵循下面的规则：<br>retry=3       定义登录/修改密码失败时，可以重试的次数；<br>type=xxx      当添加/修改密码时，系统给出的缺省提示符是什么，用来修改缺省的密码提示文本。默认是不修改的，如上例。<br>minlen=8      定义用户密码的最小长度为8位<br>ucredit=-2    定义用户密码中最少有2个大写字母    （数字为负数，表示至少有多少个大写字母；数字为正数，表示至多有多少个大写字母；下面同理）<br>lcredit=-4    定义用户密码中最少有4个小写字母<br>dcredit=-1    定义用户密码中最少有1个数字<br>ocredit=-1    定义用户密码中最少有1个特殊字符（除数字、字母之外）<br>remember=5    修改用户密码时最近5次用过的旧密码就不能重用了<br>----------------------------------------------------------------------------<br>除了上面的几个参数，还可以设定下面的参数规则<br>difok=N       此选项用来规定新密码中必需有N个字符与旧密码不同。如果新密码中有1/2以上的字符与旧密码不同时，该新密码就会被接受。<br>difignore=N   此选项用来设定在difok之前收到多少个字符时，difok设置会被忽略，缺省为23。<br>minclass=N    此选项用来规定新密码中的字符类别的最小数目，字符一般有四种类别：数字、大写字母、小写字母，以及特殊字符。 |


温馨提示：login.defs文件和/etc/pam.d/system-auth文件的规则设置对非root用户起作用，在root用户下则不会生效！如果设置root用户密码过期时间等，需要用change命令进行设置。示例如下：

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46 | 如下密码规则设置：<br>1）密码有效期是3个月。即用户创建180天后强制要求修改密码。<br>2）密码至少要过了5天后才能修改。<br>3）密码最小长度是12位<br>4）密码到期前的7天，用户登录时会提醒修改密码<br>  <br>5）密码输入时最多可允许尝试输入3次密码，3次不成功则退出密码输入界面。<br>6）新密码中至少包括大写字母2位、小写字母至少2位，数字至少2位，特殊字符至少2位<br>7）新密码中必须有4个字符与老密码不同<br>8）修改用户密码时最近3次用过的旧密码就不能重用了<br>  <br>则前4个密码规则的配置：<br>[root@localhost ~]\# vim /etc/login.defs<br>......<br>PASS\_MAX\_DAYS   180<br>PASS\_MIN\_DAYS   5<br>PASS\_MIN\_LEN    12<br>PASS\_WARN\_AGE   7<br>  <br>后4个密码规则的配置：<br>[root@localhost ~]\# vim /etc/pam.d/system-auth<br>......<br>password    requisite     pam\_cracklib.so try\_first\_pass retry=3 type= minlen=12 ucredit=-2 lcredit=-2 dcredit=-2 ocredit=-2 difok=4<br>password    sufficient    pam\_unix.so md5 shadow nullok try\_first\_pass use\_authtok remember=3<br>password    required      pam\_deny.so<br>  <br>在root账号下修改密码，测试以上密码规则设置后是否有效？<br>如下操作，说明以上设置在root账号下无效<br>[root@localhost ~]\# echo "123456"|passwd --stdin grace<br>Changing password for user grace.<br>passwd: all authentication tokens updated successfully.<br>  <br>那么切换到非root账号下修改密码试试？<br>[grace@localhost ~]$ passwd<br>Changing password for user grace.<br>Changing password for grace.<br>(current) UNIX password:         \#输入当前密码123456<br>New password:                    \#设置新密码shibo@2018，不符合密码规则<br>BAD PASSWORD: is too simple<br>New password:                    \#设置新密码kevin@201b，不符合密码规则<br>BAD PASSWORD: is too simple<br>New password:                    \#设置新密码KeVI@2\#8!w02，不符合密码规则<br>Retype new password:<br>passwd: all authentication tokens updated successfully.<br>  <br>说明以上的密码规则设置在非root用户下是生效的！！ |


3）Linux账户期限设定

Linux系统下可以使用chage命令是用来修改帐号和密码的有效期限。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46<br>47<br>48<br>49<br>50<br>51<br>52<br>53<br>54<br>55<br>56<br>57<br>58<br>59<br>60<br>61<br>62<br>63<br>64<br>65<br>66<br>67<br>68<br>69<br>70<br>71<br>72<br>73<br>74<br>75<br>76<br>77<br>78<br>79<br>80<br>81<br>82<br>83<br>84<br>85<br>86<br>87<br>88<br>89<br>90<br>91<br>92<br>93 | 需求场景：<br>公司给客户开的ftp账户用于下载报社新闻稿件。这个是付费的，账户有时间限制。若是合同到期了，客户想续约，就需要给这个ftp账户做延期。<br>  <br>注意下面修改账户有效期限的命令：<br>\# chage -l username   查看系统账户的当前设置<br>\# chage -M 600 fzwb\_word   修改fzwb\_word账户密码的有效天数为600天。过了这个天数，账户密码无效<br>\# chage -E "Jun 16, 2016" fzwb\_word  设定fzwb\_word账户的具体到期时间。过了这个日期，账户就无效。默认是never  （fzwb\_word为ftp的账户账户）<br>  <br>注意：<br>chage -M  针对的是账户密码过期时间。<br>chage -E  这个命令针对的是账户过期时间<br>  <br>设定账户过期时间，除了使用chage -E命令，还可以使用usermod -e命令<br>\# usermod -e "Jun 16, 2016" fzwb\_word   设定fzwb\_word账户的具体到期时间。默认是never  （fzwb\_word为ftp的账户账户）<br>  <br>下面命令查看， fzwb\_word 这个账户的时间到 2015 年 6 月 10 号就到期了！！<br>修改为 2016 月 6 月 16 号到期！<br>[root@hlweb80 ~]\# chage -l fzwb\_word<br>Minimum: 0<br>Maximum: 99999<br>Warning: 7<br>Inactive: -1<br>Last Change: Jun 15, 2012<br>Password Expires: Never<br>Password Inactive: Never<br>Account Expires: Jun 10, 2015<br>  <br>[root@hlweb80 ~]\# usermod -e "Jun 16, 2016" fzwb\_word<br>[root@hlweb80 ~]\# chage -l fzwb\_word<br>Minimum: 0<br>Maximum: 99999<br>Warning: 7<br>Inactive: -1<br>Last Change: Jun 15, 2012<br>Password Expires: Never<br>Password Inactive: Never<br>Account Expires: Jun 16, 2016<br>  <br>--------------------------------------------------------------------------------<br>可以使用chage命令来手动修改账户的相关属性：<br>格式：chage [选项] 账户名<br>  <br>[选项]<br>-m：密码可更改的最小天数。为零时代表任何时候都可以更改密码。<br>-M：密码保持有效的最大天数。<br>-w：账户密码到期前，提前收到警告信息的天数。<br>-E：帐号到期的日期。过了这天，此帐号将不可用。<br>-d：上一次更改的日期。<br>-i：停滞时期。如果一个密码已过期这些天，那么此帐号将不可用。<br>-l：例出当前的设置。由非特权账户来确定他们的密码或帐号何时过期。<br>  <br>实例如下：<br>[root@localhost ~]\# chage -l wangshibo<br>Last password change          : Mar 09, 2017       //账户创建时间<br>Password expires          : Aug 30, 2022           //账户密码过期时间<br>Password inactive         : never<br>Account expires           : never                 //账户过期时间<br>Minimum number of days between password change    : 0<br>Maximum number of days between password change    : 2000<br>Number of days of warning before password expires : 7<br>  <br>[root@localhost ~]\# usermod -e "Jun 16, 2018" wangshibo<br>  <br>[root@localhost ~]\# chage -l wangshibo<br>Last password change          : Mar 09, 2017<br>Password expires          : Aug 30, 2022<br>Password inactive         : never<br>Account expires           : Jun 16, 2018                     <br>Minimum number of days between password change    : 0<br>Maximum number of days between password change    : 2000<br>Number of days of warning before password expires : 7<br>  <br>[root@localhost ~]\# chage -M 20 wangshibo<br>  <br>[root@localhost ~]\# chage -l wangshibo<br>Last password change          : Mar 09, 2017<br>Password expires          : Mar 29, 2017       <br>Password inactive         : never<br>Account expires           : Jun 16, 2018<br>Minimum number of days between password change    : 0<br>Maximum number of days between password change    : 20<br>Number of days of warning before password expires : 7<br>  <br>[root@localhost ~]\# chage -E "Jun 2, 2020" wangshibo<br>  <br>[root@localhost ~]\# chage -l wangshibo<br>Last password change          : Mar 09, 2017<br>Password expires          : Mar 29, 2017<br>Password inactive         : never<br>Account expires           : Jun 02, 2020<br>Minimum number of days between password change    : 0<br>Maximum number of days between password change    : 20<br>Number of days of warning before password expires : 7 |


*************** 当你发现自己的才华撑不起野心时，就请安静下来学习吧！***************

分类: 常规运维, 安全性能

好文要顶 关注我 收藏该文 

![](images/BE909D91C72D4305B4FB76CBDC42EA5Ccon_weibo_24.png)

 

![](images/5726410743044FC8B1741518A1F3F12Bwechat.png)

![](images/9AF8B7CEE8E04F42974F3D925B807A48161124180837.png)

散尽浮华

关注 - 23

粉丝 - 3133

+加关注

0

0

« 上一篇： 通过容器提交镜像（docker commit）以及推送镜像（docker push）笔记

» 下一篇： 基于Nginx+Keepalived的LB服务监控（邮件报警）