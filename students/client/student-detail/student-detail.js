Template.studentDetail.onRendered(function(){
  // $('[data-toggle="tooltip"]').tooltip();
});

Template.studentDetail.helpers({
  /**
   * [parents description]
   * @return {[type]} [description]
   */
  parents:function(){
    var studentParents = StudentParents.find({studentId: this._id});
    var parentIds = studentParents.map(function(v){return v.parentId;});
    var parents = Parents.find({_id: {$in: parentIds}});
    return parents;
  },

  /**
   * [studentChosen description]
   * @return {[type]} [description]
   */
  studentChosen:function(){
    if(Session.get('selectedStudentId') != null){
      return true
    }
    else{
      return false;
    }
  },

  /**
   * [isInfant description]
   * @return {Boolean} [description]
   */
  isInfant:function(){
    var student = Students.findOne({_id:this._id});

    // check if no student was found
    if(!student) return;

    if(student.group=='INFANT'){
      return true;
    }
    return false;
  }
  
});

Template.studentDetail.events({
  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  "click #remove-student": function(event){
    event.preventDefault();
    if(Students.findOne({_id:this._id}).status=="PARTIALLY_ENROLLED"){
      Session.set('studentId', this._id);
      Modal.show('deletePartiallyEnrolledStudentsModal');
    }
    else{
      Session.set('studentToDelete', this._id);
      Modal.show('deleteConfirm');

      // Setting the selected student to null because when the move the
      // student, then the action buttons should go away
        Session.set('selectedStudentId', null);
    }

  },

  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  "click #edit-student": function(event){
    event.preventDefault();
    Session.set('studentToEdit', Session.get('selectedStudentId'));
    //sets editMode to waitlist to differentiate between waitlist and enrolled student edit
    Session.set('editMode', 'enrolled');
    Modal.show('editStudentModal');

  },

  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  "click #move-to-toddler":function(event){
    event.preventDefault();
    Session.set('studentToAdvance', this._id);
    // Setting the selected student to null because when the move the
    // student, then the action buttons should go away
    Session.set('selectedStudentId', null);
    
    Modal.show('toToddlerModal');
  },
  
  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  "click #move-to-waitlist":function(event){
    event.preventDefault();
    Session.set('studentToWaitlist', this._id);

    // Setting the selected student to null because when the move the
    // student, then the action buttons should go away
    Session.set('selectedStudentId', null);

    Modal.show('toWaitlistModal');
  }
});