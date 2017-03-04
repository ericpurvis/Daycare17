StaffEmail = new Mongo.Collection('staffEmail');
Schemas= {};
Schemas.StaffEmail= new SimpleSchema({
    num:{
	type: Number
    },
    email:{
	type: SimpleSchema.RegEx.Email    
    }
});

StaffEmail.attachSchema(Schemas.StaffEmail);