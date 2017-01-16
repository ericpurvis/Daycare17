Template.toToddlerModal.onCreated(function(){
  Meteor.subscribe("enrolledStudents");
});

Template.toToddlerModal.helpers({
  /**
   * [daysEnrolled description]
   * @return {[type]} [description]
   */
  daysEnrolled:function(){
    var id = Session.get('studentToAdvance');
    var student = Students.findOne({_id:id});
    if(!student) return;
    return student.daysEnrolled;
  },

  /**
   * [days description]
   * @return {[type]} [description]
   */
  days:function(){
    return Session.get('daysNotSelected');
  },

  /**
   * [dayChecked description]
   * @param  {[type]} day [description]
   * @return {[type]}     [description]
   */
  dayChecked:function(day){

    var id=Session.get('studentToAdvance');
    var student = Students.findOne({_id:id});
    var i = 0;
    
    while(i<student.daysEnrolled.length) {
      if(day==student.daysEnrolled[i].day){
        return 'checked';
      }
      i++;
    }

    return false;
  }
});


Template.toToddlerModal.events({
  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  "click #advance": function(event) {
    event.preventDefault();
    var id = Session.get('studentToAdvance');
    var days=[];

    $("input:checkbox[name=days]:checked").each(function(){
      days.push($(this).val());
    });
    Session.set('daysSelected', days);

    var daysNotSelected=[];
    //function returns an array of days that are waitlisted but not selected
    Meteor.call('compareDaysEnrolled', id, days, function(err,res){
      if(res.length > 0){
        //sets daysNotSelected session to the return value of compareDays
        Session.set('daysNotSelected',res);
        
        //shows and hides css classes
        $(".hidden").removeClass('hidden');
        $(".toHide").addClass('hidden');

      }

      else {
        //created object of days to enroll and days to waitlist, in this case the days to waitlist will be empty
        var totalDays = {
          daysChecked: days,
          daysNotChecked: []
        };
        
        Meteor.call('moveStudent', id, totalDays, moveStudentCallback);
        Modal.hide('toToddlerModal');
      }
    });
  },

  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  "click #yes":function(event){
    event.preventDefault();
    var id = Session.get('studentToAdvance');
    var daysSelected = Session.get('daysSelected');
    var daysNotSelected = Session.get('daysNotSelected');
    var totalDays = {
      daysChecked: daysSelected,
      daysNotChecked: daysNotSelected
    };

    Meteor.call('moveStudent', id, totalDays, function(err,res){
      Meteor.call('moveToWaitlist', id, totalDays.daysNotChecked, "TODDLER", "PARTIALLY_ENROLLED", moveToWaitlistCallback);
    });
  },

  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  "click #no":function(event){
    event.preventDefault();

    var id = Session.get('studentToAdvance');
    var daysSelected = Session.get('daysSelected');
    var totalDays = {
      daysChecked: daysSelected,
      daysNotChecked: []
    };
    Meteor.call('moveStudent', id, totalDays, moveStudentCallback);
  }
});

function moveStudentCallback(err,res){
  if(err){
    Errors.insert({type:'students', message:'Something went wrong', seen:false});
    // Do some real error checking and let the use know what happned
    console.log(err);
    // alert(err);
  }

  if(res.status === 201){

    Router.go("students");
  }
  return;
}

function moveToWaitlistCallback(err,res){
  if(err){
    Errors.insert({type:'students', message:'Something went wrong', seen:false});
    // Do some real error checking and let the use know what happned
    console.log(err);
    // alert(err);
  }

  if(res.status === 201){

    Router.go("students");
  }
  return;
}