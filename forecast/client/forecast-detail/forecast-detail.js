Template.forecastDetail.onCreated(function(){
  Meteor.subscribe("enrolledStudents");
  Meteor.subscribe("waitlistedStudents");
});

Template.forecastDetail.helpers({
/**
   * This function returns all the days of the week
   * @return {Array} Array containing the days of the week
   */
  daysOfWeek:function(){
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  },
  });