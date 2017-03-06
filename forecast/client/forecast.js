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
  },
  
  isMember:function(forecast) {
    if(forecast.type=='MEMBER' && forecast.status == 'WAITLIST'){
      return true;
    }
    return false;
  },
  
  isExisting:function(forecast) {
    if(forecast.type=='EXISTING' && forecast.status == 'WAITLIST'){
      return true;
    }
    return false;
  },
  
  isRegular:function(forecast) {
  if ( !(forecast.type=='MEMBER' && forecast.status == 'WAITLIST') && !(forecast.type=='EXISTING' && forecast.status == 'WAITLIST') ){
      return true;
      }
      return false
  }
  
});



Template.forecast.events({
  'click .classroom-tabs li': function () {
    Session.set("selectedClassroomId",  this._id);
    
  },
  
 // 'click .export-table': function (){
  //    $("forecastTable").tableExport({filename: "forecasts",formats: "xls"});
 // },
  
  'change #timeframe': function (e,tpl) {
    Session.set("selectedTimeFrame",  tpl.$("#timeframe").val());
  },
  
  'keypress': function (e, tpl) {
    if (e.which === 13) {
    Session.set("forecastStartDate", new Date(tpl.$("#sdate").val()));
    }
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
    var forecastArray =[];
    var endDate = new Date(startDate);
    var timeFrame = parseInt(timeFrameString);
    endDate.setMonth(startDate.getMonth() + timeFrame);
    var waitlistAdds =[];
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
    var classroom = Classrooms.findOne({_id: id}).type;

    //pull students to look through;
    if(classroom =='INFANT'){
    var studentCursor = Students.find({classId: id},{sort: {moveDate: 1}});
    }else{
    var studentCursor = Students.find({status:"ENROLLED"},{sort: {moveDate: 1}});
    }
    
    
    //collect current enroll count on selected class ID
    studentCursor.forEach(function(student){
      //console.log(student)
      //console.log(student)
      for(var i=0;i<student.daysEnrolled.length;i++){
        if("MONDAY" == student.daysEnrolled[i].day && student.group == classroom){
          mon++;
        }
        if("TUESDAY" == student.daysEnrolled[i].day && student.group == classroom){
          tues++;
        }
        if("WEDNESDAY" == student.daysEnrolled[i].day && student.group == classroom){
          wed++;
        }
        if("THURSDAY" == student.daysEnrolled[i].day && student.group == classroom){
          thur++;
        }
        if("FRIDAY" == student.daysEnrolled[i].day && student.group == classroom){
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
        type: String,
        status: String,
      }
      
      if(student.moveDate > startDate && student.moveDate < endDate && classroom == "INFANT"){
        //console.log("Student ARE in range");
        forecastModel.movements = "As of " + student.moveDate.toJSON().slice(0,10).replace(/-/g,'/') + " without " + student.firstName + " " + student.lastName;
        forecastModel.monCount = mon;
        forecastModel.tueCount = tues;
        forecastModel.wedCount = wed;
        forecastModel.thuCount = thur;
        forecastModel.friCount = fri;
        forecastModel.details = student.details;
        forecastModel.type = student.type;
        forecastModel.status = student.status;
        
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
        
        //add model
        console.log("arrayCount line 202" + arrayCount);
        console.log("forecastArray line 203" + forecastArray);
        forecastArray[arrayCount] = forecastModel;
        arrayCount++;
        
        //SEE IF A STUDENT CAN BE ADDED FROM WAITLIST
        forecastArray = checkWaitlist(classroom, student.moveDate, forecastArray, waitlistAdds, student.group , student.order );
        arrayCount = forecastArray.length;
        console.log("Students to add");
        console.log(forecastArray);
        //Else if we're dealing with the toddler class
        //Check if move date falls within the specified range
        //Pull all students (infant and toddler) that are enrolled and fit this range
      }else if(student.moveDate > startDate && student.moveDate < endDate && classroom == "TODDLER"){
          
          //If student is an infant then print "with"
          if (student.group=="INFANT"){
               forecastModel.movements = "As of " + student.moveDate.toJSON().slice(0,10).replace(/-/g,'/') + " with " + student.firstName + " " + student.lastName;
               forecastModel.monCount = mon;
               forecastModel.tueCount = tues;
               forecastModel.wedCount = wed;
               forecastModel.thuCount = thur;
               forecastModel.friCount = fri;
               forecastModel.details = student.details;
               forecastModel.type = student.type;
               forecastModel.status = student.status;
               
               //Check for each day if there are spots available. Increment if so
               for(var i=0;i<student.daysEnrolled.length;i++){
                 if("MONDAY" == student.daysEnrolled[i].day){
                   if(mon < 12){
                     mon++;
                     forecastModel.monCount = mon;
                   }
                 }
                 if("TUESDAY" == student.daysEnrolled[i].day){
                   if(tues < 12){
                     tues++;
                     forecastModel.tueCount = tues;
                   }
                 }
                 if("WEDNESDAY" == student.daysEnrolled[i].day){
                   if(wed < 12){
                     wed++;
                     forecastModel.wedCount = wed;
                   }
                 }
                 if("THURSDAY" == student.daysEnrolled[i].day){
                   if(thur < 12){
                     thur++;
                     forecastModel.thuCount = thur;
                   }
                 }
                 if("FRIDAY" == student.daysEnrolled[i].day){
                   if(fri < 12){
                     fri++;
                     forecastModel.friCount = fri;
                   }
                 }
             }
            //add model
            console.log("arrayCount line 261" + arrayCount);
            console.log("forecastArray line 262" + forecastArray);
            forecastArray[arrayCount] = forecastModel;
            arrayCount++; 
          }
          
          //If student is a toddler then print "without" and act decrement each day accordingly
          else{
            forecastModel.movements = "As of " + student.moveDate.toJSON().slice(0,10).replace(/-/g,'/') + " without " + student.firstName + " " + student.lastName;
            forecastModel.monCount = mon;
            forecastModel.tueCount = tues;
            forecastModel.wedCount = wed;
            forecastModel.thuCount = thur;
            forecastModel.friCount = fri;
            forecastModel.details = student.details;
            forecastModel.type = student.type;
            forecastModel.status = student.status;
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
            
            //add model
            console.log("arrayCount line 302" + arrayCount);
            console.log("forecastArray line 303" + forecastArray);
            forecastArray[arrayCount] = forecastModel;
            arrayCount++;
            
            //SEE IF A STUDENT CAN BE ADDED FROM WAITLIST
            forecastArray = checkWaitlist(classroom, student.moveDate ,forecastArray,waitlistAdds,student.group , student.order );
            arrayCount = forecastArray.length;
          }
          
          
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
        type: String,
        status: String,
      }

    var available = 12;
    if(classroom == 'INFANT'){
      available = 8;
    }
    forecastModel.movements = "Spots Available:";
    forecastModel.monCount = available - mon;
    forecastModel.tueCount = available - tues;
    forecastModel.wedCount = available - wed;
    forecastModel.thuCount = available - thur;
    forecastModel.friCount = available - fri;
    forecastModel.details = "";
    forecastModel.type = "REGULAR";
    forecastModel.status = "ENROLLED";
    console.log("arrayCount line 345" + arrayCount);
    console.log("forecastArray line 346" + forecastArray);
    forecastArray[arrayCount] = forecastModel;
   // console.log(forecastArray);
   // console.log(mon);
   // console.log(tues);
   // console.log(wed);
   // console.log(thur);
   // console.log(fri);
    return forecastArray;
  }
  


  /**
   *This method checks the waitlist of the currently selected classroom and finds the first student that would be available to take the spot
   * CALL THIS METHOD EVERYTIME A STUDENT TRANSITIONS OUT OF A CLASSROOM
    **/
  function checkWaitlist(classroom, dateAval,forecastArray,waitlistAdds, studentGroup, studentOrder)//pass array with students on waitlist already added during current createModel instance
  {
    
      //save max values
    var maxAllowed = 12;
    if(classroom = "INFANT"){
      maxAllowed = 8;
    }
  
    //get last entry for up-to-date availability
    console.log("forecastArray.length line 373 " + (forecastArray.length - 1));
    console.log("forecastArray line 374 " + forecastArray);
    console.log("forecastArray[forecastArray.length - 1] line 374 " + forecastArray[forecastArray.length - 1]);
    var lastEntry = forecastArray[forecastArray.length - 1];
  
    console.log("lastEntry.monCount line 374 " + lastEntry.monCount);
    var mon = lastEntry.monCount;
      var tues = lastEntry.tueCount;
      var wed = lastEntry.wedCount;
      var thur = lastEntry.thuCount;
      var fri = lastEntry.friCount;
  
  
    console.log("hello 386");
    console.log(studentGroup);
    console.log(studentOrder);
    //pull all waitlist students waiting for current room
    var waitlistStudents = Students.find({$or: [{status:"WAITLIST"}, {status:"PARTIALLY_ENROLLED"}], group: studentGroup}); 
    console.log("hello 389");
    console.log(waitlistStudents);
    waitlistStudents.forEach(function(student){
      console.log(student);
          
      //if the student desires to start before or after date of availability.
      console.log("student.startDate");
      console.log(student.startDate);
      console.log("dateAval"); 
      console.log(dateAval); 
      if(student.startDate <= dateAval){
        
        //determine if any requested days could be added (variable)
        var canBeAdded = false;
        
        var forecastModel = {
          movements: String,
          monCount: String,
            tueCount:String,
            wedCount:String,
            thuCount: String,
              friCount: String,
              details: String,
              type: String,
            }
            console.log("student.daysWaitlisted");
          console.log(student.daysWaitlisted);
          console.log(student.daysWaitlisted.length);
          //see what days the current student wants
        for(var i=0;i<student.daysWaitlisted.length;i++){
          console.log(i);
          if("MONDAY" == student.daysWaitlisted[i].day){
            if(mon<maxAllowed){
              mon++;
              forecastModel.monCount = mon;
              canBeAdded = true;
            }
          }
          else if("TUESDAY" == student.daysWaitlisted[i].day){
            if(tues<maxAllowed){
              tues++;
              forecastModel.tueCount = tues;
              canBeAdded = true;
            }
          }
          else if("WEDNESDAY" == student.daysWaitlisted[i].day){
            if(wed<maxAllowed){
              wed++;
              forecastModel.wedCount = wed;
              canBeAdded = true;
            }
          }
          else if("THURSDAY" == student.daysWaitlisted[i].day){
            if(thur<maxAllowed){
              thur++;
              forecastModel.thurCount = thur;
              canBeAdded = true;
            }
          }
          else if("FRIDAY" == student.daysWaitlisted[i].day){
            if(fri<maxAllowed){
              fri++;
              forecastModel.friCount = fri;
              canBeAdded = true;
            }
          }
          console.log(i);
          }
          console.log("canBeAdded");
          console.log(canBeAdded);
          
          //if the current waitlist can be added, add to array and end method
          
          //***SINCE STUDENTS ARE ONLY SORTED BY ORDER, THE SAME STUDENT ON THE TOP OF THE LIST
          //WILL BE ADDED EVERY TIME THIS METHOD IS CALLED IF THE START DATE IS BEFORE OR AT THE DATE
          //AVALABLE. TO FIX THIS, MAKE AN ARRAY INSIDE createModel() AND PASS IT TO THIS METHOD, 
          //ADDING A STUDENTS ID TO IT EVERYTIME THEY ARE SUCESSFULLY PUT IN THE MODEL. THEN, ONE 
          //LAST CHECK YOU WILL DO BEFORE ADDING TO THE MODEL IS MAKING SURE THEY HAVENT ALREADY BEEN 
          //ADDED BEFORE, ie SEEING IF THERE ID IS IN THE ARRAY OF STUDENTS ALREADY ADDED. IF THEY ARE, 
          //IGNORE THEM AND CONTINUE THROUGH THE FOR-EACH LOOP (sorted by order and filtered by current class)
          console.log(student._id);
          console.log(waitlistAdds);
          if(waitlistAdds.length > 0 && waitlistAdds != null && waitlistAdds.includes(student._id)){
              canBeAdded = false;
          }
            console.log(canBeAdded);
          if(canBeAdded == true){
                console.log("before movements");
                forecastModel.movements = "As of " + dateAval.toJSON().slice(0,10).replace(/-/g,'/') + " with " + student.firstName + " " + student.lastName;
                console.log(forecastModel.movements);
                forecastModel.monCount = mon;
                forecastModel.tueCount = tues;
                forecastModel.wedCount = wed;
                forecastModel.thuCount = thur;
                forecastModel.friCount = fri;
                forecastModel.details = student.details;
                forecastModel.type = student.type;
                forecastModel.status = student.status;
                waitlistAdds.push(student._id);
                forecastArray.push(forecastModel);
            
          //add some unique attribute of student into array of successfully transitioned students.
          }
      
      }

   });
   return forecastArray;
}
 
  


