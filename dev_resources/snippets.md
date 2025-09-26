**To see which IOS devices are connected to a mac**:
`ios-deploy -c`

**To log errors in IOS**:
1) Launch console.app on mac
2) Select iPhone
3) Launch app and navigate to the point it is crashing
4) Press start to record the error.
5) <app crashes or does something bad>
6) Press pause on the console
7) Select errors only, and select all messages
8) Share to the notes app
9) Copy and paste from notes to logs/ios/safari-console-logs.log

When looking in the logs you can look for  your bundle ID (com.tixapp.appeal), or if the app has crashed you can search for "crashed" in the logs.