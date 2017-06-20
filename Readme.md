Node-Restream - WARNING!!! This is just education project (not for production purpose)
===================


----------


**What is this?**  
This is free [Node.js](https://github.com/nodejs/node "Node.js") + [FFmpeg](https://github.com/FFmpeg/FFmpeg) + [nginx-rtmp-module](https://github.com/arut/nginx-rtmp-module) based restream app (like restream.io). 
 


----------


 **Use case?**  
 You have bradcasting sofware (Vmix, Wirecast, Xsplit, FLME, OBS, ffmpeg) and you want without re-encoding publish your video to multiply streaming platform (Youtube Live, Twich, Facebook Live, custom rtmp server and etc.). You can do it by buying wowza, wowzacloud or use premium version of restream.io. At now, You can make your own restream platform from free components.
 


----------
**Installing components**  
In case you have debian based OS just type in treminal.

    sudo apt-get update && sudo apt install -y nodejs ffmpeg

For install nginx you need compile it from source. For the instruction go to [nginx-rtmp-module](https://github.com/arut/nginx-rtmp-module) page.


----------
**Run app**  
At now, supported only development  mode. 
First you need to install dependencies. In project directory type
```bash
npm install
```
Wait until npm install all. If you have no errors, run app by typing
```bash
npm start
```
Go to [localhost:3003](http://localhost:3003) in your browser

----------
**TODO list**  

 1. Just input on webpage for place rtmp stream +
 2. Button for get info about stream in human readable format +
 3. Button for re-stream start \ stop. +  
  3.1 Multiply streaming +  
  3.2 Refresh stream list +  
  3.3 Allow to kill selected stream +
 4. Mongo db save streams
 5. Authorization for one user \ for others - please login\ first user - admin
  5.1. Login just by name  
  5.2. Re-factor code to save stream linked to user  
  5.3. True login with password  
  ..5.3.1. Registration page  
  ..5.3.2. Login page  
  ..5.3.3. Page for removing user  
 6. Play button on added stream
 7. Hls stream player.
 8. Re-spawn stream when it die
 9. Show information about input stream (status, restarts counter).
 10. Recording button
 


----------
**KNOWN BUGS**  

 1. Streams die without "close" callback emitted
 2. When you kill stream, stream die but ffmpeg process still running (process running, stream no)