

Meteor.startup(function(){
  if(Meteor.users.find().count()==0) {
      return Accounts.createUser({
        profile: {
          firstName: "Admin",
          lastName: "User"
        },
          email: "olbtesting@gmail.com",
          password: "KeUkMXELjQ3D"
      });
  }
});
