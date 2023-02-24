import $ from "./jquery.module.js";

/** dataRecorder class to record participant data */
export default class DataRecorder {
  /** construct empty arrays to record the following data */
  constructor(condFile) {
    this.choices = [];
    this.points = [];
    this.regret = [];
    this.chanceRegret = [];
    this.rt = [];
    this.max;
    this.totalPoints;
    this.gender;
    this.explain;
    this.include;
    this.age;
    this.compensation;
    this.prolificId;

    this.condFile = condFile;
    this.maxBonus = 4;
    this.basePay = 2.00;

  }


  prolificGetID() {
    console.log('trying to get prolific ID')
    var regexS = "[\?&]PROLIFIC_PID=([^&#]*)";
    var regex = new RegExp(regexS);

    var tmpURL = document.location.href;

    var prolificID = regex.exec(tmpURL);
    console.log('ID is : ', prolificID);
    if (prolificID == null) {
        this.prolificId = "nonProlific" + Math.random();
    } else {
      this.prolificId = prolificID[1];
    }

    console.log(this.prolificId)

}


  /** add choice to the choices array
   * @param {number} choice record whether
   * the choice was left (==0) or right (==1)
  */
  recordChoice(choice) {
    this.choices.push(choice);
  }

  /** record reaction time of the trial
   * @param {Date} startTime start time of the trial
  */
  recordReaction(startTime) {
    this.rt.push(Date.now() - startTime);
  }


  /** calculate all the payment related numbers*/
  crunchNumbers(){
    // calculate regret for each trial
    // calculate chance level regret for each trial
    for (let i=0; i< this.choices.length; i++){
      this.points[i] = this.choices[i] == 0 ? this.condFile['arm_0_reward'][i] : this.condFile['arm_1_reward'][i];
      this.regret[i] = this.condFile['max_reward'][i] - this.points[i];
      this.chanceRegret[i] = (this.condFile['max_reward'][i] - this.condFile['min_reward'][i]) / 2;
    }

    this.meanRegret = Object.values(this.regret).reduce((partialSum, a) => partialSum + a, 0) / this.regret.length;
    this.meanChanceRegret = Object.values(this.chanceRegret).reduce((partialSum, a) => partialSum + a, 0) / this.regret.length;
    let diffRegret = this.meanChanceRegret > this.meanRegret ? this.meanChanceRegret - this.meanRegret : 0;
    this.compensation = (diffRegret/this.meanChanceRegret) * this.maxBonus + this.basePay;
    this.compensation = this.compensation.toFixed(2);


    this.max = Object.values(this.condFile['max_reward']).reduce((partialSum, a) => partialSum + a, 0);
    this.totalPoints = Object.values(this.points).reduce((partialSum, a) => partialSum + a, 0);


  }


  createSubmitDemographic(parNo) {

    document.getElementById('demographicButton').addEventListener("click", function(){
      let age = document.getElementById('age').value;
      let gender = document.querySelector('input[name="gender"]:checked').value;
      let explain = document.getElementById('explain').value;
      let include = document.querySelector('input[name="y_n"]:checked').value;

      if (gender.length == 0 || age < 18 || age > 90 || isNaN(age) || include.length == 0 || explain.length == 0) {
        alert('Please select your gender, enter your age, and fill out the additional questions');
      } else {
  
        this.age = age;
        this.gender = gender;
        this.explain = explain;
        this.include = include;
        this.saveData(parNo);
        nextPage(5);
      } 
    }.bind(this));

  }


  /** export data as json
   * @param {number} fileNo matching condition file name
  */
  saveData(fileNo){

    const savedData = {
      'choices': this.choices,
      'points': this.points,
      'rt': this.rt,
      'gender': this.gender,
      'age': this.age,
      'prolific_id': this.prolificId,
      'money': this.compensation,
      'explain': this.explain,
      'include': this.include
    
  };



  let fileName = 'data/' + fileNo + '.json';
  $.post('./save_data.php', {
    postresult: JSON.stringify(savedData),
    postfile: fileName
  }); 

  }
}
