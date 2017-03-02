Meteor.publish('staffEmail', function() {
    return StaffEmail.find();
});
