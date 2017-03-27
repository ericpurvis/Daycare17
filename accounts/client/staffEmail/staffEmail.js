Meteor.subscribe('staffEmail');


Template.staffEmail.events({
  'submit form.staffEmail': function(e, tpl){
      var console = console || {log: function(){}};
    // getting the user's input
 
      var staffEmailId = tpl.$("#email").val();
    
  
//StaffEmail.update({num: 1}, {$set: {email: staffEmailId}},{upsert: true});
   //window.console.warn(StaffEmail.findOne({num:1}).email);
	   
     //window.console.warn("3");
   
    e.preventDefault();
  
   Meteor.call('setStaffEmail',  staffEmailId);
   Modal.show('staffEmailModal');
   scroll(0,0);
   e.target.reset();
  
  }
  }
);

