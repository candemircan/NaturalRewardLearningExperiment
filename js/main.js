import {nextPage, includeHTML, startPractice,
  comprehensionCheck,
  startExperiment} from './helpers.js';

includeHTML();

document.documentElement.addEventListener("click",function(){
if (document.documentElement.requestFullscreen){
  document.documentElement.requestFullscreen();
} else if (document.documentElement.webkitRequestFullScreen){
  document.documentElement.webkitRequestFullScreen();
} else if(document.documentElement.msRequestFullscreen){
    document.documentElement.msRequestFullscreen();
  } else if (document.documentElement.mozRequestFullScreen){
    document.documentElement.mozRequestFullScreen();
  }})
window.nextPage = nextPage;
window.startPractice = startPractice;
window.comprehensionCheck = comprehensionCheck;
window.startExperiment = startExperiment;