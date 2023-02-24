import Trial from './trial.js';
import DataRecorder from './datarecorder.js';
import $ from "./jquery.module.js";

/** import the  html content from other files */
export function includeHTML() {
  let i;
  let elmnt;
  let file;
  let xhttp;
  /* Loop through a collection of all HTML elements: */
  const z = document.getElementsByTagName('*');
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /* search for elements with a certain atrribute:*/
    file = elmnt.getAttribute('include-html');
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {
            elmnt.innerHTML = this.responseText;
          }
          if (this.status == 404) {
            elmnt.innerHTML = 'Page not found.';
          }
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute('include-html');
          includeHTML();
        }
      };
      xhttp.open('GET', file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}

/** show next div elements and hide the old
 * @param {number} currentIndex
 */
export function nextPage(currentIndex) {
  const newIndex = currentIndex + 1;
  const oldPage = `page${currentIndex}`;
  const newPage = `page${newIndex}`;

  document.getElementById(oldPage).style.display = 'none';
  document.getElementById(newPage).style.display = 'block';
  window.scrollTo(0, 0);
}

/** checks if correct answers are provided and proceeds
 * to the experiment if so */
export function comprehensionCheck() {
  const ch1 = document.getElementById('icheck1').checked;
  const ch2 = document.getElementById('icheck2').checked;
  const ch3 = document.getElementById('icheck3').checked;


  if (ch1 && ch2 && ch3) {
    nextPage(3);
  } else {
    alert('You have answered some of the questions wrong and are therefore redirected to the initial page. Please try again');
    document.getElementById('page3').style.display = 'none';
    document.getElementById('page1').style.display = 'block';
    window.scrollTo(0,0);

  }
}


/** run practice trials */
export function startPractice() {

  const practiceJson = {
    'arm_0_image': {
      0: 'practice_stimuli/ps_0_right.jpg',
      1: 'practice_stimuli/ps_1_right.jpg',
      2: 'practice_stimuli/ps_2_right.jpg'},
    'arm_1_image': {
      0: 'practice_stimuli/ps_0_left.jpg',
      1: 'practice_stimuli/ps_1_left.jpg',
      2: 'practice_stimuli/ps_2_left.jpg'},
    'arm_0_reward': {
      0: 25,
      1: 36,
      2: 90},
    'arm_1_reward': {
      0: 60,
      1: 4,
      2: 55
    }
  }

  const practiceRecorder = new DataRecorder(practiceJson);
  const practiceTrials = new Trial(
      practiceJson,
      practiceRecorder,
      true,
      0);
  practiceTrials.runTrials();
}


/** start the experiment */
export function startExperiment() {

  const practice=false;
  




  var tempRequest = new XMLHttpRequest();
  tempRequest.open("GET", "temp.txt", false);
  tempRequest.send(null)
  console.log(tempRequest.responseText);
  var parNo = parseInt(tempRequest.responseText)
  var newParNo = parNo + 1;
  tempRequest.abort();


  $.post('./update_temp.php', {
    newPar: newParNo
  });

  var condFileRequest = new XMLHttpRequest();
  condFileRequest.open("GET", "condition_files/" + parNo + ".json", false);
  condFileRequest.send(null);
  var condFile = JSON.parse(condFileRequest.responseText);
  condFileRequest.abort();


  const myRecorder = new DataRecorder(condFile);
  const banditTrials = new Trial(
      condFile,
      myRecorder,
      practice,
      parNo);


  const nonExp = document.querySelectorAll(`[id^="page"]`);
  nonExp.forEach((element) => {
    element.style.display = 'none';
  });
  banditTrials.runTrials();
}
