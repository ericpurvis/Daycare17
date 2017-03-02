Meteor.methods({
  
  
  /**
   * This function will directly add student to classroom using the given information. Used on "Classroom" page
   *and with "Add Student" modal.
   * 
   * @param  {Object} application All the information submitted from the client
   * @return {}             Result of the operations
   */
    "directlyEnroll": function(application){
    
    // check to see if they have selected at least one day
    if(application.days.length === 0){
      throw new Meteor.Error("No day select",
        "You must select at least one day of the week.");
    }
    
    //checking if not conceived was checked on application
    var notConceived;
    if(application.student.conceived=="NC"){
      notConceived = true;
    }
    else{
      notConceived=false;
    }
    if(!notConceived && application.student.dob == null){
      throw new Meteor.Error("Must either have date of birth picked or not yet conceived selected");
    }
    
    var imageId = Random.id();
    // NOTE: Blocks the Thread
    // insert the parent
    var parentId = Parents.insert({
      firstName: application.parent.firstName,
      lastName: application.parent.lastName,
      address: application.parent.address.street + " " + application.parent.address.city + " " + application.parent.address.state + " " + application.parent.address.zip,
      phoneNumber: application.parent.phone,
      email: application.parent.email,
      image: "http://api.adorable.io/avatars/100/"+ imageId +".png",
      createdAt: new Date()
    });

    // constructing the days for the student profile
    var days = [];
    var week = {M: "monday", T: "tuesday", W: "wednesday", TH: "thursday", F: "friday"};
    var flexible = false;
    if(application.flexible=="flexible"){
      flexible=true;
    }
    application.days.forEach(function (day) {
      days.push({
        day: week[day].toUpperCase(),
        flexible: flexible
      });
    });

    imageId = Random.id();
    
    
    //determine DOB
    var moveDate;
    var monthsToMoveDate;
    var dob;
    
    if(notConceived){
      dob=undefined;
      moveDate=undefined;
    }else{
      if(application.pregnant){
        dob = new Date(moment(application.student.dueDate));
      }else{
        dob = new Date(moment(application.student.dob));
      }
      var ageInMonths = moment().diff(dob, 'months') || "";
      if (ageInMonths < Meteor.settings.public.infantTransMonth) {
        monthsToMoveDate = Meteor.settings.public.infantTransMonth;
        moveDate = new Date(new Date(dob).setMonth(dob.getMonth()+monthsToMoveDate));
      }
      else {
        monthsToMoveDate = Meteor.settings.public.toddlerTransMonth;
        moveDate = new Date(new Date(dob).setMonth(dob.getMonth()+monthsToMoveDate));
      }
    }
    var classType = application.group.toUpperCase();
    var classroom = Classrooms.findOne({type: classType});
    
    // insert the student, check if conceived to determine if dob should be inserted
    var studentToBeInserted = {
      firstName: application.student.firstName,
      lastName: application.student.lastName,
      dateOfBirth: dob,
      group: application.group.toUpperCase(),
      status: "enrolled".toUpperCase(),
      paidApplicationFee: false,
      startDate: new Date(moment(application.startDate)),
      moveDate: moveDate,
      daysEnrolled: days,
      daysRequested: [],
      daysWaitlisted:[],
      classId: classroom._id,
      image: "http://api.adorable.io/avatars/100/" + imageId + ".png",
      createdAt: new Date(),
      color: "#3498db",
      details: application.details,
      conceived: notConceived,
      //dueDate: application.student.dueDate
    };
       
    studentToBeInserted.type = application.type.toUpperCase();
    
    var studentId = Students.insert(studentToBeInserted);

    // inserting the studentParent document
    var studentParentId = StudentParents.insert({
      studentId: studentId,
      parentId: parentId,
      isPrimary: true,
      createdAt: new Date()
    });

    //check if there is second parent and then add parent
    if(application.secondParent.active){
      var secondParentId = Parents.insert({
        firstName: application.secondParent.firstName,
        lastName: application.secondParent.lastName,
        address: application.secondParent.address.street + " " + application.secondParent.address.city + " " + application.secondParent.address.state + " " + application.secondParent.address.zip,
        phoneNumber: application.secondParent.phone,
        email: application.secondParent.email,
        image: "http://api.adorable.io/avatars/100/"+ imageId +".png",
        createdAt: new Date()
      });
      var studentParentId = StudentParents.insert({
        studentId: studentId,
        parentId: secondParentId,
        isPrimary: true,
        createdAt: new Date()
      });
    }
 },
  /**
   * [addTask description]
   * @param {[type]} task [description]
   */
  addSystemTask: function(task){
    // Check the different variables passed
    // Use the Check Package https://atmospherejs.com/meteor/check
	check(task, {
    description: String,
    type: String
  });
    return ActionItems.insert({
      title: "title",
      description: task.description,
      type: task.type,
      createdBy: Meteor.userId(),
      createdAt: new Date(),
	  isCompleted: false,
    isSystemMessage: true
    });
  }
 });