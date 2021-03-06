Template.navbar.onCreated(function(){
  Meteor.subscribe("applicationStudents");
});


Template.navbar.helpers({
  userEmail: function () {
    if(Meteor.user())
      return Meteor.user().emails[0].address;      
  },

  userName: function() {
    if(Meteor.user())
      return Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName;
  },

  applicants: function () {
    var apps = Students.find({status: "APPLICATION"},{sort: {createdAt: 1}}).count();
    var badge = document.getElementById("AppBadge");
    if(apps < 1){
      badge.style.visibility = "hidden";
    }else{
      badge.style.visibility = "visible";
    }
    return apps;
  }
});

Template.navbar.events({
  'click a.logout': function (e) {
    e.preventDefault();
    Meteor.logout();
    Router.go('signin');
  },

  'click #newPasswordButton': function(e) {
    Router.go('newpassword')
  },

  'click #addUserButton': function(e) {
    Router.go('register')
  },

  'click #deleteUserButton': function(e) {
    Router.go('deleteuser')
  },
    'click #staffEmailButton': function(e) {
    Router.go('staffEmail')
  }
});
