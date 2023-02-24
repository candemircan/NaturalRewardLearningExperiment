/** Trial class to display images & the relevant reward upon choice */
export default class Trial {
  /**
       * Create trial class with the following:
       * @param  {Array} images An array of arrays with paths to bandit
       * arm images. Outer array has length of number of trials and each
       * inner has length two corresponding to image on the left (==0) &
       * the image on the right (==1)
       * @param  {Array} rewards An array of arrays with the same structure
       * as the images array, except each entry of the inner arrays represents
       * the associated reward
       * @param {Object} condFile Condition file in JSON format
       * @param {dataRecorder} recorder Custom dataRecorder class object
       * recording participant data
       * @param {boolean} practice true if running practice trials
       * controls what is shown after the trials
       * @param {number} parNo current participant no, used to save data
       */
  constructor(condFile, recorder, practice, parNo) {
    this.condFile = condFile;
    this.recorder = recorder;
    this.practice = practice;

    this.total_trials = Object.keys(condFile[Object.keys(condFile)[0]]).length
    this.current_trial = 0;
    this.parNo = parNo;

    // all the mappings
    this.stims = ['stim_1', 'stim_2']; // img ids
    this.highlight_map = {
      'ArrowLeft': this.stims[0],
      'ArrowRight': this.stims[1]}; // left & right arrow keys to highlight
    this.arrow_to_index = {
      'ArrowLeft': 0,
      'ArrowRight': 1}; // to record choice data
    this.arrow_to_id = {
      'ArrowLeft': 'leftImageP',
      'ArrowRight': 'rightImageP'}; // to alter displayed reward after choice
    
    this.arrow_to_reward = {
      'ArrowLeft': this.condFile['arm_0_reward'],
      'ArrowRight': this.condFile['arm_1_reward']
    };
    this.index_to_id = {
      0: 'leftImageP', 1:
        'rightImageP'}; // to hide the reward information later

    this.highlighted = false; // controls whether new key presses are recorded
    this.iti = 1500; // duration of choice & associated reward display
    this.loadTime = 1000 // duration of empty screen before loading stimuli

    // number of text elements for each column div.
    // filled later & used to index into & change the displayed reward
    this.text_elements = 0;

    // set to true once the block is completed
    this.done = false;

    // get prolific ID
    if (this.practice == false){
      this.recorder.prolificGetID()
    }
  }


  /** make trial div visible and fill the initial variables */
  createTrial() {
    // hide all the non-experiment elements
    const nonExp = document.querySelectorAll(`[id^="page"]`);
    nonExp.forEach((element) => {
      element.style.display = 'none';
    });

    // make experiment visible & fill with images
    document.getElementById('stim_1').setAttribute('src',
        this.condFile['arm_0_image'][this.current_trial]);
    document.getElementById('stim_2').setAttribute('src',
        this.condFile['arm_1_image'][this.current_trial]);



    // set innerHTML of index & create textnodes
    // containing reward information

    document.getElementById(
        'leftImageP').append(document.createTextNode(''));
    document.getElementById(
        'rightImageP').append(document.createTextNode(''));

    // to index into & change the displayed reward information later

    this.text_elements = document.getElementById(
        'rightImageP').childNodes.length - 1;

    
    setTimeout(function() {
      document.getElementById('trial').style.display = 'block';
    }.bind(this),this.loadTime);

    // start the timer for the first trial
    this.trial_start = Date.now();
  }


  /**
       * Highlight the choosen option, display the associated reward,
       * and record choice & reaction time data.
       * @param  {Event} event key press to be recorded &
       * to be used to display relevant information
       */
  highlightChoiceAndReward(event) {
    let notEvent = event.key == "ArrowLeft" ? "ArrowRight" : "ArrowLeft";
    this.recorder.recordReaction(this.trial_start);
    this.highlighted = true; // prevents registering new presses
    this.recorder.recordChoice(this.arrow_to_index[event.key]); // save choice
    // change the chosen img css to highlight it
    document.getElementById(
        this.highlight_map[event.key]).classList = 'highlight';
    // display the reward of the chosen
    document.getElementById(
        this.arrow_to_id[event.key]).childNodes[this.text_elements].nodeValue =
        this.arrow_to_reward[event.key][this.current_trial];
    
    document.getElementById(
      this.arrow_to_id[notEvent]).childNodes[this.text_elements].nodeValue =
      this.arrow_to_reward[notEvent][this.current_trial];
  }

  /** Hide reward information & update class parameters for next trial */
  interTrial() {

    document.getElementById('stim_1').classList = '';
    document.getElementById('stim_2').classList = '';
    this.highlighted = false;
    this.current_trial += 1;
  }

  /** Progress onto the next trial or end the block if no more trials */
  nextTrial() {
    // hide reward info
    document.getElementById('leftImageP').childNodes[this.text_elements].nodeValue = "";
    document.getElementById('rightImageP').childNodes[this.text_elements].nodeValue = "";
    if (this.current_trial < this.total_trials) {
      // get the new images
      document.getElementById('trial').style.display = 'none';
      document.getElementById(
          this.stims[0]).setAttribute(
          'src', this.condFile['arm_0_image'][this.current_trial]);
      document.getElementById(
          this.stims[1]).setAttribute(
          'src', this.condFile['arm_1_image'][this.current_trial]);
      
      
      if (!this.practice){    
        this.recorder.crunchNumbers();
        document.getElementById("paymentDiv").innerHTML = "";
        let currentPay = "Current Payment: " + this.recorder.compensation + " £";
        let payNode = document.createTextNode(currentPay);
        document.getElementById("paymentDiv").appendChild(payNode);
      }
  
      setTimeout(function() {
        document.getElementById('trial').style.display = 'block';
      }.bind(this),this.loadTime);
          

      this.trial_start = Date.now();
    } else { // end block
      if (this.practice) {
        document.getElementById('page3').style.display = 'block';
      } else {
        this.recorder.crunchNumbers()
        this.recorder.createSubmitDemographic(this.parNo);
        document.getElementById('page5').style.display = 'block';
        var moneyNode = document.createTextNode(this.recorder.compensation + "£");
        document.getElementById('money').appendChild(moneyNode)

        
      }
      this.done = true;
      document.getElementById('trial').style.display = 'none';
    }
  }


  /** call all functions needed from participant choice onwards in a trial
       * @param {Event} event key press of the participant
      */
  afterChoice(event) {
    // only call the functions if the pressed key is left or right arrow
    // and they have not been pressed yet in this trial & block has not ended
    if (this.highlight_map.hasOwnProperty(event.key) &
    !this.highlighted &
    !this.done) {
      this.highlightChoiceAndReward(event);

      // display reward & highlight for some time
      // before you move on to the next trial
      setTimeout(function() {
        this.interTrial();
        this.nextTrial();
      }.bind(this),
      this.iti);
    }
  }


  /** Run all trials of the block */
  runTrials() {
    this.createTrial();
    document.body.addEventListener(
        'keydown', this.afterChoice.bind(this));
  }
}
