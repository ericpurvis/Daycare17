Template.forecast.onCreated(function(){
  Meteor.subscribe("waitlistedStudents");
  Meteor.subscribe("enrolledStudents");
  Meteor.subscribe("classrooms");
  this.subscribe('classroomsWithStudents', {}, dataReady);
  function dataReady(){
    var id = Classrooms.findOne()._id;
    Session.set("selectedClassroomId", id);
    Session.set("selectedTimeFrame", "3");
    var today = new Date();
    Session.set("forecastStartDate", today);
  }
});



Template.forecast.helpers({
  /**
   * Returns all students where status="WAITLIST" and group="INFANT"
   * Ordered by oldest first
   * @returns {*}
   */
  students: function(){
    return Students.find({group: this.type, $or: [{status:"WAITLIST"}, {status:"PARTIALLY_ENROLLED"}]}, {sort:{order:1}});
  },


  /**
   * This function will return all the students in the class of the selected tab
   * @return {Meteor.cursor} cursor to the DB
   */
  studentsInThisClass: function(){
    var id = Session.get("selectedClassroomId");    
    return Students.find({classId: id, $or: [{status:"ENROLLED"}, {status:"PARTIALLY_ENROLLED"}]});
  },

  /**
   * Returns all the different classrooms
   * @return {Meteor.cursor} Cursor to the begining of all the classes
   */
  classrooms: function(){
    return Classrooms.find();
  },
  
    daysOfWeek:function(){
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  },
  
  forecastArray: function(){
    return createForecastModel(Session.get("forecastStartDate"),Session.get("selectedTimeFrame"));
  }
  
});



Template.forecast.events({
  'click .classroom-tabs li': function () {
    Session.set("selectedClassroomId",  this._id);
    
  },
  
  'change #timeframe': function (e,tpl) {
    Session.set("selectedTimeFrame",  tpl.$("#timeframe").val());
  },
  
  'input #sdate': function (e, tpl) {
    Session.set("forecastStartDate", e.target.sdate.value);
  }
  });
  /**
   * Takes the students from the current infant classrooms and adds them into the forecast model ( this will require a model be created for it)
   * Look at screen shot and google docs they sent for how the table should look and what fields are needed
   * 
   * this will create the model to be interpolated to the screen
   * 
   * This should take in a value to tell it to retrieve infant or toddler data.
   */
  function createForecastModel(startDate, timeFrameString)
  {
    var classroom = "";
    var forecastArray =[];
    var endDate = new Date(startDate);
    var timeFrame = parseInt(timeFrameString);
    endDate.setMonth(startDate.getMonth() + timeFrame);
    //console.log(startDate.getMonth());
    //console.log(startDate);
    //console.log(timeFrame);
    //console.log(endDate);
    var mon = 0;
    var tues = 0;
    var wed = 0;
    var thur = 0;
    var fri = 0;
    
    var id = Session.get("selectedClassroomId");  
    var studCount = Students.find({classId: id}).count();
    //console.log(studCount);
    var studentCursor = Students.find({classId: id});
    studentCursor.forEach(function(student){
      //console.log(student)
      //console.log(student)
      classroom = student.group;
      for(var i=0;i<student.daysEnrolled.length;i++){
        if("MONDAY" == student.daysEnrolled[i].day){
          mon++;
        }
        if("TUESDAY" == student.daysEnrolled[i].day){
          tues++;
        }
        if("WEDNESDAY" == student.daysEnrolled[i].day){
          wed++;
        }
        if("THURSDAY" == student.daysEnrolled[i].day){
          thur++;
        }
        if("FRIDAY" == student.daysEnrolled[i].day){
          fri++;
        }
      }
    });
    var arrayCount = 0;
    studentCursor.forEach(function(student){
      var forecastModel = {
        movements: String,
        monCount: String,
        tueCount:String,
        wedCount:String,
        thuCount: String,
        friCount: String,
        details: String,
      }
      if(student.moveDate > startDate && student.moveDate < endDate){
        //console.log("Student ARE in range");
        forecastModel.movements = "As of " + student.moveDate.toJSON().slice(0,10).replace(/-/g,'/') + " without " + student.firstName + " " + student.lastName;
        forecastModel.monCount = mon;
        forecastModel.tueCount = tues;
        forecastModel.wedCount = wed;
        forecastModel.thuCount = thur;
        forecastModel.friCount = fri;
        forecastModel.details = student.details;
        for(var i=0;i<student.daysEnrolled.length;i++){
          if("MONDAY" == student.daysEnrolled[i].day){
            mon--;
            forecastModel.monCount = mon;
          }
          if("TUESDAY" == student.daysEnrolled[i].day){
            tues--;
            forecastModel.tueCount = tues;
          }
          if("WEDNESDAY" == student.daysEnrolled[i].day){
            wed--;
            forecastModel.wedCount = wed;
          }
          if("THURSDAY" == student.daysEnrolled[i].day){
            thur--;
            forecastModel.thuCount = thur;
          }
          if("FRIDAY" == student.daysEnrolled[i].day){
            fri--;
            forecastModel.friCount = fri;
          }
        }
        forecastArray[arrayCount] = forecastModel;
        arrayCount++;
      }else{
        //console.log("Student not in range");
      }
    });
     var forecastModel = {
        movements: String,
        monCount: String,
        tueCount:String,
        wedCount:String,
        thuCount: String,
        friCount: String,
        details: String,
      }

    var available = 12;
    if(classroom == "INFANT"){
      available = 8;
    }
    forecastModel.movements = "Spots Available:";
    forecastModel.monCount = available - mon;
    forecastModel.tueCount = available - tues;
    forecastModel.wedCount = available - wed;
    forecastModel.thuCount = available - thur;
    forecastModel.friCount = available - fri;
    forecastModel.details = "";
    forecastArray[arrayCount] = forecastModel;
   // console.log(forecastArray);
   // console.log(mon);
   // console.log(tues);
   // console.log(wed);
   // console.log(thur);
   // console.log(fri);
    return forecastArray;
  }


