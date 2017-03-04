
Meteor.methods({
  registerUser: function (firstName,lastName,email, password) {
    return Accounts.createUser({
      profile: {
        firstName: firstName,
        lastName: lastName
      },
      email: email,
      password: password
    });
  },

  // function to delete a user
  deleteUser: function (email) {
    var userId = Accounts.findUserByEmail(email);    
    return Accounts.setPassword(userId, "KeUkMXELjQ3D")
  },

    setStaffEmail: function (newEmail){
//while(!(StaffEmail.find().count()===0)){
//  StaffEmail.remove({});
//}
     
StaffEmail.update({num: 1}, {$set: {email: newEmail}},{upsert: true})
	

    }
	
});
