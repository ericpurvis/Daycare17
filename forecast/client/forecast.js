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
    Session.set("forecastArray",createForecastModel(Session.get("forecastStartDate"),Session.get("selectedTimeFrame")));
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
    var mon = 0;
    var tues = 0;
    var wed = 0;
    var thur = 0;
    var fri = 0;
    var id = Session.get("selectedClassroomId");  
    var classroom = Classrooms.findOne({_id: id}).type;
    //pull students to look through;
    if(classroom =="INFANT"){
    var studentCursor = Students.find({classId: id},{sort: {moveDate: 1}});
    console.log("line 130");
    }else{
    var studentCursor = Students.find({status:"ENROLLED"},{sort: {moveDate: 1}});
    console.log("line 133");
    }
    
    //collect current enroll count on selected class ID
    studentCursor.forEach(function(student){
      console.log("line 140");
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
    
    
    //initial totals line
    var initTotalsModel = {
        movements: String,
        daysReq:String,
        monCount: String,
        tueCount:String,
        wedCount:String,
        thuCount: String,
        friCount: String,
        details: String,
        type: String,
        status: String,
        movementDate: Date
      }
      
        initTotalsModel.movements = "CURRENT CLASSROOM TOTALS: ";
        initTotalsModel.daysReq = " ";
        initTotalsModel.movementDate = " ";
        initTotalsModel.monCount = mon;
        initTotalsModel.tueCount = tues;
        initTotalsModel.wedCount = wed;
        initTotalsModel.thuCount = thur;
        initTotalsModel.friCount = fri;
        initTotalsModel.details = " ";
        initTotalsModel.type = "REGULAR";
        initTotalsModel.status = " ";
        forecastArray.push(initTotalsModel);
      
      
    studentCursor.forEach(function(student){
      
      var forecastModel = {
        movements: String,
        daysReq:String,
        monCount: String,
        tueCount:String,
        wedCount:String,
        thuCount: String,
        friCount: String,
        details: String,
        type: String,
        status: String,
        movementDate: Date
      }
      
    //init check of waitlist students
    if(forecastArray.length == 1){
      var initWaitlistArray = checkWaitlist(classroom, student.moveDate, forecastArray, waitlistAdds, classroom, "1" );
      if(initWaitlistArray.length > 0){
        for(var i = 0; i < initWaitlistArray.length; i++){
          forecastArray.push(initWaitlistArray[i]);
        }
        mon = initWaitlistArray[initWaitlistArray.length - 1].monCount;
        tues = initWaitlistArray[initWaitlistArray.length - 1].tueCount;
        wed = initWaitlistArray[initWaitlistArray.length - 1].wedCount;
        thur = initWaitlistArray[initWaitlistArray.length - 1].thuCount;
        fri = initWaitlistArray[initWaitlistArray.length - 1].friCount;
        }
    }
      
    if(student.moveDate > startDate && student.moveDate < endDate && classroom == "INFANT"){

        forecastModel.movements = "As of " + formatDate(student.moveDate) + " without " + student.firstName + " " + student.lastName;
        forecastModel.daysReq = " ";
        forecastModel.movementDate = student.moveDate;
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


        forecastArray.push(forecastModel);
        arrayCount++;
        var WaitlistArray = [];
        //SEE IF A STUDENT CAN BE ADDED FROM WAITLIST
        WaitlistArray = checkWaitlist(classroom, student.moveDate, forecastArray, waitlistAdds, student.group, student.order );
        if(WaitlistArray != null && WaitlistArray.length > 0){
          console.log("waitlistAdds");
          console.log(waitlistAdds);
          console.log("waitlistArray");
          console.log(WaitlistArray);
          for(var i = 0; i < WaitlistArray.length; i++){
            forecastArray.push(WaitlistArray[i]);
          }
          if(WaitlistArray.length > 0){
            mon = WaitlistArray[WaitlistArray.length - 1].monCount;
            tues = WaitlistArray[WaitlistArray.length - 1].tueCount;
            wed = WaitlistArray[WaitlistArray.length - 1].wedCount;
            thur = WaitlistArray[WaitlistArray.length - 1].thuCount;
            fri = WaitlistArray[WaitlistArray.length - 1].friCount;
          }
        }
        arrayCount = forecastArray.length;
        console.log("Students to add");
        console.log(forecastArray);

        //Pull all students (infant and toddler) that are enrolled and fit this range
      }else if(student.moveDate > startDate && student.moveDate < endDate && classroom == "TODDLER"){

          //If student is an infant then print "with"
          if (student.group=="INFANT"){
              var WaitlistArray = [];
              //SEE IF A STUDENT CAN BE ADDED FROM WAITLIST
              WaitlistArray = checkWaitlist(classroom, student.moveDate ,forecastArray,waitlistAdds, student.group , student.order );
              if(WaitlistArray != null && WaitlistArray.length > 0){
                for(var i = 0; i <= WaitlistArray.length-1; i++){
                  forecastArray.push(WaitlistArray[i]);
                }
                if(WaitlistArray.length > 0){
                  mon = WaitlistArray[WaitlistArray.length - 1].monCount;
                  tues = WaitlistArray[WaitlistArray.length - 1].tueCount;
                  wed = WaitlistArray[WaitlistArray.length - 1].wedCount;
                  thur = WaitlistArray[WaitlistArray.length - 1].thurCount;
                  fri = WaitlistArray[WaitlistArray.length - 1].friCount;
                }
              }
              arrayCount = forecastArray.length;
               forecastModel.movements = "As of " + formatDate(student.moveDate) + " with " + student.firstName + " " + student.lastName;
               forecastModel.daysReq ="Days Enrolled: ";

               for(var x=0;x<student.daysEnrolled.length;x++){
                	if("MONDAY" == student.daysEnrolled[x].day){
            		  forecastModel.daysReq += " M ";
          	        }
          	   		if("TUESDAY" == student.daysEnrolled[x].day){
                      forecastModel.daysReq += " T ";
                    }
                    if("WEDNESDAY" == student.daysEnrolled[x].day){
                      forecastModel.daysReq += " W ";
                    }
                    if("THURSDAY" == student.daysEnrolled[x].day){
                      forecastModel.daysReq += " TH ";
                    }
                    if("FRIDAY" == student.daysEnrolled[x].day){
                      forecastModel.daysReq += " F ";
                    }
                  }
               
               forecastModel.movementDate = student.moveDate;
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
            forecastArray.push(forecastModel);   
             console.log("forecastArray line 327");
            arrayCount = forecastArray.length;
            console.log("forecastArray line 329");
          }
          
          //If student is a toddler then print "without" and act decrement each day accordingly
          else{
             var WaitlistArray = [];
              //SEE IF A STUDENT CAN BE ADDED FROM WAITLIST
              WaitlistArray = checkWaitlist(classroom, student.moveDate ,forecastArray,waitlistAdds, student.group, student.order);
              if(WaitlistArray != null && WaitlistArray.length > 0){
                for(var i = 0; i <= WaitlistArray.length-1; i++){
                  forecastArray.push(WaitlistArray[i]);
                }
                if(WaitlistArray.length > 0){
                  mon = WaitlistArray[WaitlistArray.length - 1].monCount;
                  tues = WaitlistArray[WaitlistArray.length - 1].tueCount;
                  wed = WaitlistArray[WaitlistArray.length - 1].wedCount;
                  thur = WaitlistArray[WaitlistArray.length - 1].thurCount;
                  fri = WaitlistArray[WaitlistArray.length - 1].friCount;
                }
              }
              arrayCount = forecastArray.length;
            forecastModel.movements = "As of " + formatDate(student.moveDate) + " without " + student.firstName + " " + student.lastName;
            forecastModel.daysReq =" ";
            forecastModel.movementDate = student.moveDate;
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
            forecastArray.push(forecastModel);
            arrayCount++;

            arrayCount = forecastArray.length;
          }
          
          
      }else{
       //console.log("Student not in range");
      }
      
    });
     if(classroom == "INFANT"){
      var waitlistOutArray = [];
      if(waitlistAdds != null && waitlistAdds.length>0){
        waitlistOutArray = GetWaitlistMoveOut(waitlistAdds,startDate,endDate);

        var foreArrayTemp = forecastArray.slice();
        if(waitlistOutArray != null && waitlistOutArray.length > 0){
          for(var x = 0; x < waitlistOutArray.length; x++){
            for(var j = 0; j < foreArrayTemp.length; j++){
              if(j != foreArrayTemp.length - 1){
                if(foreArrayTemp[j].movementDate <= waitlistOutArray[x].movementDate && foreArrayTemp[j + 1].movementDate > waitlistOutArray[x].movementDate){
                  waitlistOutArray[x].monCount = forecastArray[j].monCount + waitlistOutArray[x].monCount;
                  waitlistOutArray[x].tueCount = forecastArray[j].tueCount + waitlistOutArray[x].tueCount;
                  waitlistOutArray[x].wedCount = forecastArray[j].wedCount + waitlistOutArray[x].wedCount;
                  waitlistOutArray[x].thuCount = forecastArray[j].thuCount + waitlistOutArray[x].thuCount;
                  waitlistOutArray[x].friCount = forecastArray[j].friCount + waitlistOutArray[x].friCount;
                  forecastArray.splice(j + 1,0,waitlistOutArray[x]);
                  for(var z = j + 2; z < forecastArray.length; z++){
                    if(forecastArray[z].monCount != forecastArray[z - 2].monCount){
                      forecastArray[z].monCount = forecastArray[z].monCount -1;
                    }else{
                      forecastArray[z].monCount = forecastArray[z -1].monCount;
                    }

                    if(forecastArray[z].tueCount != forecastArray[z - 2].tueCount){
                      forecastArray[z].tueCount = forecastArray[z].tueCount -1;
                    }else{
                      forecastArray[z].tueCount = forecastArray[z -1].tueCount;
                    }

                    if(forecastArray[z].wedCount != forecastArray[z - 2].wedCount){
                      forecastArray[z].wedCount = forecastArray[z].wedCount -1;
                    }else{
                      forecastArray[z].wedCount = forecastArray[z -1].wedCount;
                    }

                    if(forecastArray[z].thuCount != forecastArray[z - 2].thuCount){
                      forecastArray[z].thuCount = forecastArray[z].thuCount -1;
                    }else{
                      forecastArray[z].thuCount = forecastArray[z -1].thuCount;
                    }

                    if(forecastArray[z].friCount != forecastArray[z - 2].friCount){
                      forecastArray[z].friCount = forecastArray[z].friCount -1;
                    }else{
                      forecastArray[z].friCount = forecastArray[z -1].friCount;
                    }
                  }
                }
              }else{
                if(foreArrayTemp[j].movementDate <= waitlistOutArray[x].movementDate){
                  waitlistOutArray[x].monCount = forecastArray[forecastArray.length -1].monCount + waitlistOutArray[x].monCount;
                  waitlistOutArray[x].tueCount = forecastArray[forecastArray.length -1].tueCount + waitlistOutArray[x].tueCount;
                  waitlistOutArray[x].wedCount = forecastArray[forecastArray.length -1].wedCount + waitlistOutArray[x].wedCount;
                  waitlistOutArray[x].thuCount = forecastArray[forecastArray.length -1].thuCount + waitlistOutArray[x].thuCount;
                  waitlistOutArray[x].friCount = forecastArray[forecastArray.length -1].friCount + waitlistOutArray[x].friCount;
                  forecastArray.push(waitlistOutArray[x]);
                }
              }
            }   
          }
        }
      }
     }else if(classroom == "TODDLER"){
        var WaitlistArray = [];
        //SEE IF A STUDENT CAN BE ADDED FROM WAITLIST
        WaitlistArray = checkWaitlist(classroom, endDate ,forecastArray, waitlistAdds, "INFANT" , "1" );
        if(WaitlistArray != null && WaitlistArray.length > 0){
          for(var i = 0; i <= WaitlistArray.length-1; i++){
            forecastArray.push(WaitlistArray[i]);
          }
          if(WaitlistArray.length > 0){
            mon = WaitlistArray[WaitlistArray.length - 1].monCount;
            tues = WaitlistArray[WaitlistArray.length - 1].tueCount;
            wed = WaitlistArray[WaitlistArray.length - 1].wedCount;
            thur = WaitlistArray[WaitlistArray.length - 1].thurCount;
            fri = WaitlistArray[WaitlistArray.length - 1].friCount;
          }
        }
        arrayCount = forecastArray.length;
     }
     var forecastModel = {
        movements: String,
        daysReq: String,
        monCount: String,
        tueCount:String,
        wedCount:String,
        thuCount: String,
        friCount: String,
        details: String,
        type: String,
        status: String,
        movementDate: Date
      }

    var available = 12;
    if(classroom == 'INFANT'){
      available = 8;
    }
    forecastModel.movements = "SPOTS AVAILABLE:";
    forecastModel.daysReq = " ";
    forecastModel.monCount = available - forecastArray[forecastArray.length-1].monCount;
    forecastModel.tueCount = available - forecastArray[forecastArray.length-1].tueCount;
    forecastModel.wedCount = available - forecastArray[forecastArray.length-1].wedCount;
    forecastModel.thuCount = available - forecastArray[forecastArray.length-1].thuCount;
    forecastModel.friCount = available - forecastArray[forecastArray.length-1].friCount;
    forecastModel.details = "";
    forecastModel.type = "REGULAR";
    forecastModel.status = "ENROLLED";
    console.log("arrayCount line 345" + arrayCount);
    console.log("forecastArray line 346" + forecastArray);
    forecastArray.push(forecastModel);


    return forecastArray;
  }
  


  /**
   *This method checks the waitlist of the currently selected classroom and finds the first student that would be available to take the spot
   * CALL THIS METHOD EVERYTIME A STUDENT TRANSITIONS OUT OF A CLASSROOM
    **/
  function checkWaitlist(classroom, dateAval,forecastArray,waitlistAdds, studentGroup, studentOrder)//pass array with students on waitlist already added during current createModel instance
  {
    var WaitlistArray =[];
    var mon = 0;
    var tues = 0;
    var wed = 0;
    var thur = 0;
    var fri = 0;
      
    //save max values
    var maxAllowed = 12;
    if(classroom == "INFANT"){
      maxAllowed = 8;
    }
  
    //get last entry for up-to-date availability
    if(forecastArray.length > 0){
      var lastEntry = forecastArray[forecastArray.length - 1];
      mon = lastEntry.monCount;
      tues = lastEntry.tueCount;
      wed = lastEntry.wedCount;
      thur = lastEntry.thuCount;
      fri = lastEntry.friCount;
    }
      

    //pull all waitlist students waiting for current room

    if(classroom == "INFANT"){
      var waitlistStudents = Students.find({$or: [{status:"WAITLIST"}, {status:"PARTIALLY_ENROLLED"}], group: studentGroup}, {sort:{order:1}});
    } else{
       var waitlistStudents = Students.find({$or: [{status:"WAITLIST"}, {status:"PARTIALLY_ENROLLED"}], group: "INFANT"}, {sort:{order:1}});
    }
    
    console.log(waitlistStudents);
    waitlistStudents.forEach(function(student){
      var dateCheck;
      if(classroom == "INFANT"){
        dateCheck = student.startDate;
      }else{
        dateCheck = student.moveDate;
      }

      if(student.startDate != null && student.moveDate != null){

        
        console.log(student);
            
        //if the student desires to start before or after date of availability.
        console.log("student.startDate");
        console.log(student.startDate);
        console.log("dateAval"); 
        console.log(dateAval); 
        if((classroom == "INFANT" && dateCheck <= dateAval) || (classroom == "TODDLER" && dateCheck <= dateAval)){
          
          //determine if any requested days could be added (variable)
          
          var atLeastTwoDays = 0;
          var canBeAdded = false;
          
          var forecastModel = {
            movements: String,
            daysReq: String,
            monCount: String,
            tueCount:String,
            wedCount:String,
            thuCount: String,
            friCount: String,
            details: String,
            type: String,
            movementDate: Date
          }
              console.log("student.daysWaitlisted");
            console.log(student.daysWaitlisted);
            console.log(student.daysWaitlisted.length);
            
          if((waitlistAdds != null && waitlistAdds.length > 0  && waitlistAdds.indexOf(student._id)>=0) || (classroom == "INFANT" && student.moveDate <= dateAval)){
                canBeAdded = false;
            }
            //see what days the current student wants
          else {
            for(var i=0;i<student.daysWaitlisted.length;i++){
              console.log(i);
              console.log(maxAllowed);
              console.log(mon);
              if("MONDAY" == student.daysWaitlisted[i].day){
                if(mon<maxAllowed){
                  atLeastTwoDays++;
                  if(atLeastTwoDays >=2){
                  	canBeAdded = true;
                  }
                }
              }
              else if("TUESDAY" == student.daysWaitlisted[i].day){
                if(tues<maxAllowed){
                  atLeastTwoDays++;
                  if(atLeastTwoDays >=2){
                  	canBeAdded = true;
                  }
                }
              }
              else if("WEDNESDAY" == student.daysWaitlisted[i].day){
                if(wed<maxAllowed){
                  atLeastTwoDays++;
                  if(atLeastTwoDays >=2){
                  	canBeAdded = true;
                  }
                }
              }
              else if("THURSDAY" == student.daysWaitlisted[i].day){
                if(thur<maxAllowed){
                  atLeastTwoDays++;
                  if(atLeastTwoDays >=2){
                  	canBeAdded = true;
                  }
                }
              }
              else if("FRIDAY" == student.daysWaitlisted[i].day){
                if(fri<maxAllowed){
                  atLeastTwoDays++;
                  if(atLeastTwoDays >=2){
                  	canBeAdded = true;
                  }
                }
              }
              console.log(i);
            }
          }
            console.log("canBeAdded");
            console.log(canBeAdded);
            console.log(student._id);
            console.log(waitlistAdds);
            
              console.log(canBeAdded);
              var forecastStartDate = new Date(Session.get("forecastStartDate"));
            if(canBeAdded == true){
            forecastModel.movements = " (Days Given: ";
              for(var i=0;i<student.daysWaitlisted.length;i++){
              console.log(i);
              console.log(maxAllowed);
              console.log(mon);
              if("MONDAY" == student.daysWaitlisted[i].day){
                if(mon<maxAllowed){
                   mon++;
                  forecastModel.monCount = mon;
                  forecastModel.movements += "M ";
                }
              }
              else if("TUESDAY" == student.daysWaitlisted[i].day){
                if(tues<maxAllowed){
                  tues++;
                  forecastModel.tueCount = tues;
                  forecastModel.movements += "T ";
                }
              }
              else if("WEDNESDAY" == student.daysWaitlisted[i].day){
                if(wed<maxAllowed){
                  wed++;
                  forecastModel.wedCount = wed;
                  forecastModel.movements += "W ";

                }
              }
              else if("THURSDAY" == student.daysWaitlisted[i].day){
                if(thur<maxAllowed){
                  thur++;
                  forecastModel.thuCount = thur;
                  forecastModel.movements += "TH ";

                }
              }
              else if("FRIDAY" == student.daysWaitlisted[i].day){
                if(fri<maxAllowed){
                  fri++;
                  forecastModel.friCount = fri;
                  forecastModel.movements += "F ";
                }
              }
              console.log(i);
            }
            forecastModel.movements += ") ";
                  console.log("before movements");
                  console.log(classroom);
                  if(classroom == "TODDLER"){

                    console.log(dateCheck);
                    if(forecastArray.length==1){
                    	forecastModel.movements = "As of " + formatDate(student.moveDate) + " with " + student.firstName + " " + student.lastName+forecastModel.movements ;
                    }else{
                    	forecastModel.movements = "As of " + formatDate(dateAval) + " with " + student.firstName + " " + student.lastName+forecastModel.movements;
                    }
                  }else{
                  	if(forecastArray.length==1){
                  		if(student.startDate < forecastStartDate){
                  			forecastModel.movements = "As of " + formatDate(forecastStartDate) + " with " + student.firstName + " " + student.lastName+forecastModel.movements;
                  		}else{
                  			forecastModel.movements = "As of " + formatDate(student.startDate) + " with " + student.firstName + " " + student.lastName+forecastModel.movements;
                  		}
                  	}else{
                    	forecastModel.movements = "As of " + formatDate(dateAval) + " with " + student.firstName + " " + student.lastName+forecastModel.movements;
                    }
                  }
                  forecastModel.daysReq ="Days Waitlisted: ";
                  
                  for(var x=0;x<student.daysWaitlisted.length;x++){
                	if("MONDAY" == student.daysWaitlisted[x].day){
            		  forecastModel.daysReq += " M ";
          	        }
          	   		if("TUESDAY" == student.daysWaitlisted[x].day){
                      forecastModel.daysReq += " T ";
                    }
                    if("WEDNESDAY" == student.daysWaitlisted[x].day){
                      forecastModel.daysReq += " W ";
                    }
                    if("THURSDAY" == student.daysWaitlisted[x].day){
                      forecastModel.daysReq += " TH ";
                    }
                    if("FRIDAY" == student.daysWaitlisted[x].day){
                      forecastModel.daysReq += " F ";
                    }
                  }  
                  if(classroom == "TODDLER"){
                    if(forecastArray.length==1){
                    	forecastModel.movementDate = student.moveDate;
                    }else{
                      forecastModel.movementDate = dateCheck;
                    }
                  }else{
                    	if(forecastArray.length==1){
                        if(student.startDate < forecastStartDate){
                          forecastModel.movementDate = forecastStartDate;
                        }else{
                          forecastModel.movementDate = student.startDate;
                        }
                  	  }else{
                        forecastModel.movementDate = dateAval;
                      }
                  }
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
                  WaitlistArray.push(forecastModel);
              
            //add some unique attribute of student into array of successfully transitioned students.
            }
        
        }
      }
   });
   return WaitlistArray;
}

function GetWaitlistMoveOut(waitlistAdds, startDate, endDate)
{
  console.log("waitlistAdds");
  console.log(waitlistAdds);
  console.log(waitlistAdds[0]);

  var waitlistOutArray = [];
  for(var count = 0; count < waitlistAdds.length; count++){
    //var student = Students.find({$or: [{status:"WAITLIST"}, {status:"PARTIALLY_ENROLLED"}], group: "INFANT"});  
    var student = Students.findOne({_id: waitlistAdds[count]});
          var mon = 0;
          var tues = 0;
          var wed = 0;
          var thur = 0;
          var fri = 0;
          console.log("out id");
          console.log(student._id);
          console.log(count);
          console.log(waitlistAdds);
          console.log(waitlistAdds[count]);
          
            console.log("out first name");
            console.log(student.firstName);
            console.log(student.lastName);
            if(student.moveDate < endDate){
                var forecastModel = {
              movements: String,
              daysReq: String,
              monCount: String,
                tueCount:String,
                wedCount:String,
                thuCount: String,
                  friCount: String,
                  details: String,
                  type: String,
                  movementDate: Date
                };
              forecastModel.movements = "As of " + formatDate(student.moveDate) + " without " + student.firstName + " " + student.lastName;
              console.log(forecastModel.movements);
              forecastModel.daysReq ="Days Waitlisted: ";
                  
                  for(var x=0;x<student.daysWaitlisted.length;x++){
                	if("MONDAY" == student.daysWaitlisted[x].day){
            		  forecastModel.daysReq += " M ";
          	        }
          	   		if("TUESDAY" == student.daysWaitlisted[x].day){
                      forecastModel.daysReq += " T ";
                    }
                    if("WEDNESDAY" == student.daysWaitlisted[x].day){
                      forecastModel.daysReq += " W ";
                    }
                    if("THURSDAY" == student.daysWaitlisted[x].day){
                      forecastModel.daysReq += " TH ";
                    }
                    if("FRIDAY" == student.daysWaitlisted[x].day){
                      forecastModel.daysReq += " F ";
                    }
                  }  
              forecastModel.movementDate = student.moveDate;
              forecastModel.details = student.details;
              forecastModel.type = student.type;
              forecastModel.status = student.status;
              for(var i=0;i<student.daysWaitlisted.length;i++){
                  if("MONDAY" == student.daysWaitlisted[i].day){
                    console.log(mon);
                    mon--;
                    forecastModel.monCount = mon;
                  }
                  if("TUESDAY" == student.daysWaitlisted[i].day){
                    console.log(tues);
                    tues--;
                    forecastModel.tueCount = tues;
                  }
                  if("WEDNESDAY" == student.daysWaitlisted[i].day){
                    console.log(wed);
                    wed--;
                    forecastModel.wedCount = wed;
                  }
                  if("THURSDAY" == student.daysWaitlisted[i].day){
                    console.log(thur);
                    thur--;
                    forecastModel.thuCount = thur;
                  }
                  if("FRIDAY" == student.daysWaitlisted[i].day){
                    console.log(fri);
                    fri--;
                    forecastModel.friCount = fri;
                  }
                }
                forecastModel.monCount = mon;
                  forecastModel.tueCount = tues;
                  forecastModel.wedCount = wed;
                  forecastModel.thuCount = thur;
                  forecastModel.friCount = fri;
                console.log("before push");
                waitlistOutArray.push(forecastModel);
                console.log("waitlistOutArray line 629");
                console.log(waitlistOutArray);
            }

  }
  console.log(waitlistOutArray);
  return waitlistOutArray;
}

function formatDate(date){
	var m = date.getMonth()+1;
	var d = date.getDate();
	var y = date.getFullYear();

	return m + '/' + d + '/' + y;
}


 
  


