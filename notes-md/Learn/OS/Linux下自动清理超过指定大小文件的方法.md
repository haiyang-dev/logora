Linux下自动清理超过指定大小文件的方法

 

由于线上业务用的squid，根据经验值如果长时间运行则缓存目录下的swap.state会慢慢变大，一旦超过60M，squid的性能就会急剧下降，因此需要定时去清理大于60M的swap.state文件。由此引出需求，查找cache目录下的所有大于60M的swap.state文件并清除，即：

1）查找cache目录下的所有swap.state文件

2）判断是否大于60M

3）大于60M则清空

解题思路:

以byte为单位显示文件大小,然后和60M大小做对比. 60M换算成字节为62914560这里判断是否大于60M，大于则使用echo 语句将对应文件置空。

60M=60*1024*1024=62914560 byte

可以使用dd命令创建一个60M的文件,测试下:

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20 | [root@kevin ~]\# dd if=/dev/zero of=/mnt/test bs=1M count=60<br>60+0 records in<br>60+0 records out<br>62914560 bytes (63 MB) copied, 0.0492826 s, 1.3 GB/s<br>[root@kevin ~]\# du -sh /mnt/test<br>60M     /mnt/test<br>[root@kevin ~]\# du -sh -b /mnt/test<br>62914560        /mnt/test<br>[root@kevin ~]\# ls -l /mnt/test<br>-rw-r--r--. 1 root root 62914560 Oct 12 14:15 /mnt/test<br> <br>注意:<br>如果文件是带小数点的M单位,比如文件大小为1.3M,则换算成byte单位时,就不能直接使用1.3\*1024\*1024=1363148.8这样计算了,因为这个<br>1.3M的大小是估算出来的M单位的大小,不是精确到的. 如果直接加-b参数换算成byte单位大小则就是精确的值了,如下:<br>[root@kevin logs]\# du -sh catalina.out<br>1.3M    catalina.out<br>[root@kevin logs]\# du -sh -b catalina.out<br>1349930 catalina.out<br>[root@kevin logs]\# ls -l catalina.out    <br>-rw-r--r--. 1 root root 1349930 Oct 12 14:20 catalina.out |


1) 方法一: "du -sh -b"

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46<br>47<br>48<br>49<br>50<br>51<br>52<br>53<br>54<br>55<br>56<br>57<br>58<br>59<br>60<br>61<br>62<br>63<br>64<br>65<br>66<br>67<br>68<br>69<br>70<br>71<br>72<br>73<br>74<br>75<br>76<br>77<br>78<br>79<br>80<br>81<br>82<br>83<br>84<br>85<br>86<br>87<br>88<br>89<br>90<br>91 | 语法<br>\# du [-abcDhHklmsSx][-L &lt;符号连接&gt;][-X &lt;文件&gt;][--block-size][--exclude=&lt;目录或文件&gt;][--max-depth=&lt;目录层数&gt;][--help][--version][目录或文件]<br>  <br>参数说明：<br>-a或-all                                  \#显示目录中个别文件的大小。<br>-b或-bytes                                \#显示目录或文件大小时，以byte为单位。<br>-c或--total                               \#除了显示个别目录或文件的大小外，同时也显示所有目录或文件的总和。<br>-D或--dereference-args                    \#显示指定符号连接的源文件大小。<br>-h或--human-readable                      \#以K，M，G为单位，提高信息的可读性。<br>-H或--si                                  \#与-h参数相同，但是K，M，G是以1000为换算单位。<br>-k或--kilobytes                           \#以1024 bytes为单位。<br>-l或--count-links                         \#重复计算硬件连接的文件。<br>-L&lt;符号连接&gt;或--dereference&lt;符号连接&gt;        \#显示选项中所指定符号连接的源文件大小。<br>-m或--megabytes                           \#以1MB为单位。<br>-s或--summarize                           \#仅显示总计。<br>-S或--separate-dirs                       \#显示个别目录的大小时，并不含其子目录的大小。<br>-x或--one-file-xystem                     \#一开始处理时的文件系统为准，若遇上其它不同的文件系统目录则略过。<br>-X&lt;文件&gt;或--exclude-from=&lt;文件&gt;            \#&lt;文件&gt;指定目录或文件。<br>--exclude=&lt;目录或文件&gt;                     \#略过指定的目录或文件。<br>--max-depth=&lt;目录层数&gt;                     \#超过指定层数的目录后，予以忽略。<br>--help 显示帮助。<br>--version                                \#显示版本信息。<br>  <br>[root@kevin ~]\# du -sh /data/cache/coss/squid\*/swap.state<br>4M /data/cache/coss/squid1/swap.state<br>270k /data/cache/coss/squid2/swap.state<br>4M /data/cache/coss/squid3/swap.state<br>8M /data/cache/coss/squid4/swap.state<br>53M /data/cache/coss/squid5/swap.state<br>35M /data/cache/coss/squid6/swap.state<br>6M /data/cache/coss/squid7/swap.state<br>7M /data/cache/coss/squid8/swap.state<br>97M /data/cache/coss/squid9/swap.state<br>75M /data/cache/coss/squid10/swap.state<br>  <br>[root@kevin ~]\# du -sh -b /data/cache/coss/squid\*/swap.state<br>4194304 /data/cache/coss/squid1/swap.state<br>276480 /data/cache/coss/squid2/swap.state<br>4194304 /data/cache/coss/squid3/swap.state<br>8388608 /data/cache/coss/squid4/swap.state<br>55574528 /data/cache/coss/squid5/swap.state<br>36700160 /data/cache/coss/squid6/swap.state<br>6291456 /data/cache/coss/squid7/swap.state<br>7340032 /data/cache/coss/squid8/swap.state<br>101711872 /data/cache/coss/squid9/swap.state<br>78643200 /data/cache/coss/squid11/swap.state<br>  <br>使用du -sh -b查找出相应文件的大小，同时使用awk 过滤第一个字段，只保留数字<br>[root@kevin ~]\# du -sh -b /data/cache/coss/squid\*/swap.state | awk '{ print $1 }' <br>4194304<br>276480<br>4194304<br>8388608<br>55574528<br>36700160<br>6291456<br>7340032<br>101711872<br>78643200<br> <br>[root@kevin ~]\# du -sh -b /data/cache/coss/squid\*/swap.state | awk '{ print $2 }' <br>/data/cache/coss/squid1/swap.state<br>/data/cache/coss/squid2/swap.state<br>/data/cache/coss/squid3/swap.state<br>/data/cache/coss/squid4/swap.state<br>/data/cache/coss/squid5/swap.state<br>/data/cache/coss/squid6/swap.state<br>/data/cache/coss/squid7/swap.state<br>/data/cache/coss/squid8/swap.state<br>/data/cache/coss/squid9/swap.state<br>/data/cache/coss/squid11/swap.state<br> <br>批量处理的脚本<br>[root@kevin ~]\# vim /root/cache\_gt\_60.sh<br>\#!/bin/bash<br>for size in $(du -sh -b /data/cache/coss/squid\*/swap.state| awk '{ print $1 }')<br>do<br>   for file in $(du -sh -b /data/cache/coss/squid\*/swap.state|grep ${size}|awk '{print $2}')<br>   do<br>         if [ ${size} -gt 62914560 ];then<br>         echo ${file} ${size}<br>         echo "" &gt; ${file}<br>         fi<br>    done<br>done<br>  <br>结合crontab进行定时执行<br>[root@kevin ~]\# chmod 755 /root/cache\_gt\_60.sh<br>[root@kevin ~]\# /bin/bash -x  /root/cache\_gt\_60.sh<br>[root@kevin ~]\# crontab -e<br>0 2 \* \* 6 /bin/bash -x /root/cache\_gt\_60.sh &gt; /dev/null 2&gt;&amp;1 |


2) 方法二: "ls -l"

ls命令是linux下用来列出目录下的文件. 下面是关于ls的一些常规用法:

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41<br>42<br>43<br>44<br>45<br>46<br>47<br>48<br>49<br>50<br>51<br>52<br>53<br>54<br>55<br>56<br>57<br>58<br>59<br>60<br>61<br>62<br>63<br>64<br>65<br>66 | ls -a     \#列出文件下所有的文件，包括以&quot;.&quot;开头的隐藏文件（linux下文件隐藏文件是以.开头的，如果存在..代表存在着父目录）。<br>ls -l     \#列出文件的详细信息，如创建者，创建时间，文件的读写权限列表等等。<br>ls -F     \#在每一个文件的末尾加上一个字符说明该文件的类型。"@"表示符号链接、"|"表示FIFOS、"/"表示目录、"="表示套接字。<br>ls -s     \#在每个文件的后面打印出文件的大小。  size(大小)<br>ls -t     \#按时间进行文件的排序  Time(时间)<br>ls -A     \#列出除了"."和".."以外的文件。<br>ls -R     \#将目录下所有的子目录的文件都列出来，相当于我们编程中的&quot;递归”实现<br>ls -L     \#列出文件的链接名。Link（链接）<br>ls -S     \#以文件的大小进行排序<br> <br>ls可以结合管道符”|&quot;来进行一下复杂的操作。比如: ls | less用于实现文件列表的分页，ls<br> <br>[root@clamav-server ~]\# ls -l /data/cache/coss/squid\*/swap.state<br>-rw-r--r--. 1 root root      4194304  Oct 3 11:52 /data/cache/coss/squid1/swap.state<br>-rw-r--r--. 1 root root      276480 Oct 3 12:12 /data/cache/coss/squid2/swap.state<br>-rw-r--r--. 1 root root      4194304 Oct 3 12:34 /data/cache/coss/squid3/swap.state<br>-rw-r--r--. 1 root root      8388608 Oct 3 14:06 /data/cache/coss/squid4/swap.state<br>-rw-r--r--. 1 root root      55574528 Oct 3 14:13 /data/cache/coss/squid5/swap.state<br>-rw-r--r--. 1 root root      36700160 Oct 3 15:21 /data/cache/coss/squid6/swap.state<br>-rw-r--r--. 1 root root      6291456 Oct 3 15:58 /data/cache/coss/squid7/swap.state<br>-rw-r--r--. 1 root root      7340032 Oct 3 17:12 /data/cache/coss/squid8/swap.state<br>-rw-r--r--. 1 root root      101711872 Oct 3 17:40 /data/cache/coss/squid9/swap.state<br>-rw-r--r--. 1 root root      78643200 Oct 3 19:27 /data/cache/coss/squid11/swap.state<br> <br>[root@clamav-server ~]\# ls -l /data/cache/coss/squid\*/swap.state |awk '{print $5}'<br>4194304<br>276480<br>4194304<br>8388608<br>55574528<br>36700160<br>6291456<br>7340032<br>101711872<br>78643200<br>[root@clamav-server ~]\# ls -l /data/cache/coss/squid\*/swap.state |awk '{print $9}'<br>/data/cache/coss/squid1/swap.state<br>/data/cache/coss/squid2/swap.state<br>/data/cache/coss/squid3/swap.state<br>/data/cache/coss/squid4/swap.state<br>/data/cache/coss/squid5/swap.state<br>/data/cache/coss/squid6/swap.state<br>/data/cache/coss/squid7/swap.state<br>/data/cache/coss/squid8/swap.state<br>/data/cache/coss/squid9/swap.state<br>/data/cache/coss/squid11/swap.state<br> <br>批量处理的脚本<br>[root@clamav-server ~]\# vim /root/cache\_gt\_60.sh<br>\#!/bin/bash<br>for size in $(ls -l /data/cache/coss/squid\*/swap.state |awk '{print $5}')<br>do<br>   for file in $(ls -l /data/cache/coss/squid\*/swap.state|grep $size |awk '{print $9}')<br>   do<br>         if [ ${size} -gt 62914560 ];then<br>         echo ${file} ${size}<br>         echo "" &gt; ${file}<br>         fi<br>    done<br>done<br> <br>结合crontab进行定时执行<br>[root@CRN-JZ-2-36X ~]\# chmod 755 /root/cache\_gt\_60.sh<br>[root@CRN-JZ-2-36X ~]\# /bin/bash -x  /root/cache\_gt\_60.sh<br>[root@CRN-JZ-2-36X ~]\# crontab -e<br>0 2 \* \* 6 /bin/bash -x /root/cache\_gt\_60.sh &gt; /dev/null 2&gt;&amp;1 |


3) 方法三："find -size"

-size 选项用于查找满足指定的大小条件的文件(注意不查找目录), +表示大于, -表示小于, 没有+或-表示正好等于。

|   |   |
| - | - |
| 1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20<br>21<br>22<br>23<br>24<br>25<br>26<br>27<br>28<br>29<br>30<br>31<br>32<br>33<br>34<br>35<br>36<br>37<br>38<br>39<br>40<br>41 | [root@kevin ~]\# du -sh /data/cache/coss/squid\*/swap.state<br>4M /data/cache/coss/squid1/swap.state<br>270k /data/cache/coss/squid2/swap.state<br>4M /data/cache/coss/squid3/swap.state<br>8M /data/cache/coss/squid4/swap.state<br>53M /data/cache/coss/squid5/swap.state<br>35M /data/cache/coss/squid6/swap.state<br>6M /data/cache/coss/squid7/swap.state<br>7M /data/cache/coss/squid8/swap.state<br>97M /data/cache/coss/squid9/swap.state<br>75M /data/cache/coss/squid10/swap.state<br> <br>[root@kevin ~]\# find  /data/cache/coss/squid\*/swap.state -size +60M<br>/data/cache/coss/squid9/swap.state<br>/data/cache/coss/squid10/swap.state<br> <br>[root@redis-new03 ~]\# for i in $(find  /data/cache/coss/squid\*/swap.state -size +60M);do echo " " &gt; $i;done<br> <br>[root@kevin ~]\# du -sh /data/cache/coss/squid\*/swap.state<br>4M /data/cache/coss/squid1/swap.state<br>270k /data/cache/coss/squid2/swap.state<br>4M /data/cache/coss/squid3/swap.state<br>8M /data/cache/coss/squid4/swap.state<br>53M /data/cache/coss/squid5/swap.state<br>35M /data/cache/coss/squid6/swap.state<br>6M /data/cache/coss/squid7/swap.state<br>7M /data/cache/coss/squid8/swap.state<br>4.0K /data/cache/coss/squid9/swap.state<br>4.0K /data/cache/coss/squid10/swap.state<br> <br>编写脚本<br>[root@kevin ~]\# vim /root/cache\_gt\_60.sh<br>\#!/bin/bash<br>for i in $(find  /data/cache/coss/squid\*/swap.state -size +60M);<br>do<br>   echo " " &gt; $i;<br>done<br> <br>结合crontab进行定时执行<br>[root@kevin ~]\# crontab -e<br>0 2 \* \* 6 /bin/bash -x /root/cache\_gt\_60.sh &gt; /dev/null 2&gt;&amp;1 |


*************** 当你发现自己的才华撑不起野心时，就请安静下来学习吧！***************

分类: Shell

好文要顶 关注我 收藏该文 

![](images/5DFFA0F06E4149EF928CAF0BD65BD30Acon_weibo_24.png)

 

![](images/7D38C785B2394D65BE88034A433A9696wechat.png)

![](images/47B8A0AE9A4143EF8EACFDB6740EBF9F161124180837.png)

散尽浮华

关注 - 23

粉丝 - 3133

+加关注

1

0

« 上一篇： Shell中打印匹配关键字的前后行 [echo、grep用法]

» 下一篇： php安装扩展模块后，重启不生效的原因及解决办法

posted @ 2018-10-11 00:29  散尽浮华  阅读(4279)  评论(4)  编辑  收藏



评论

  

#1楼 2018-10-12 14:27 | 潇湘隐者

使用du -sk * 应该可以避免du -sh * 遇到的问题

支持(0) 反对(0)

  

#2楼 [楼主] 2018-10-12 16:22 | 散尽浮华

@ 潇湘隐者

恩,是的。 du -sh -k 或 du -sh -b都可以的。

支持(0) 反对(0)

  

#3楼 2018-11-02 01:07 | 金枪语

find -size不就可以

支持(0) 反对(0)

  

#4楼 [楼主] 2018-11-02 09:12 | 散尽浮华

@ 金枪语

恩，实现方法很多种