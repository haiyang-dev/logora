Steps to Configure Jenkins With Microsoft Teams for Notifications



1. Create a team

![](images/A4332EF1346F406FA192B7830C1A5AB1reate-a-team.png)

1. Click Add channel

![](images/809A054A82A941FF899B9BD212EED893-add-channel.png)

3. Once the channel is created, click connector

![](images/A3DC1BBCBBF1413285700F7D0DE2E85Cclipboard.png)

3. Select Jenkins and click Configure.

![](images/4702A64200E24FF6B394A3E0B9479625clipboard.png)

4. Enter a name for the Jenkins connection.

![](images/A7F2E8C09DE546F280FE84CA5E0D8CE7clipboard.png)

5. Copy the webhook URL and save it to the clipboard.

![](images/D92243E9FE1441899B917D3D1E74CDCDclipboard.png)

6. Log in to the Jenkins dashboard

![](images/C56F8C6A3E8E4415AD9A673A6D349A07clipboard.png)

7. Click Manage Jenkins from the left-hand side menu.

![](images/E4421A1F73484C97B514B667FF9084D7clipboard.png)

8. Click on Manage Plugins from the right-hand side.

![](images/F30CA61C8AC34AC4ABCE21532EEDA89Cclipboard.png)

9. Click on the Available tab.

![](images/34930B963C9448D48E0319529B45D280clipboard.png)

10. Search for Office 365 Connector and then check the checkbox and click the Install without restart button.

![](images/585D6D3D6FDF4066BB529153F75312C6clipboard.png)

11. Go to your project and click on the Configure button.

![](images/A5251EE37EAC44B3B80F07AB854EF3BDclipboard.png)

12. Click on the Office 365 Connector tab.

![](images/E938BF3E88C84E3FB6EAE7F5CE56FD3Eclipboard.png)

13. Click on the Add Webhook button.

14. Paste the webhook URL in the URL box and check for all those boxes for which you want to receive events and then click the Save button.

![](images/74AB2CA320C84ACBA594177170A08365clipboard.png)

15. Click the Build Now button.

![](images/EC6D6ED6031B490880DC978E6907D18Di_DgJIS4NLZA.png)

16. Once the build starts, you'll get notifications in the teams-notification channel.

![](images/4C882226AE38473CAC89B7022FF90198CxQGuV21bviw.png)

17. After the build is completed, you will get notifications in the teams-notification channel.

![](images/AEA082DC69C44353B333028FFB45BF3EtyX-20T_XdJA.png)

Conclusion

Jenkins can send notification from all your jobs to your team. It can use channels to send specific notifications for specific teams.

Further Reading

How to Integrate Your GitHub Repository to Your Jenkins Project

Continuous Integration With Jenkins on Alibaba Cloud

