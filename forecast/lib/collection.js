/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
Forecast = new Mongo.collection('forecast');
//SeatsAvailable = new Mongo.collection('seatsAvailable');

var Schemas = {};

Schemas.Forecast = new SimpleSchema({
  movements: {
      type: String,
      label: "Dates and Movements",
      max: 80,
  },
  
  monCount: {
      type: Number,
      label: "Monday",
      //Max: 
  },
  
  tueCount: {
      type: Number,
      label: "Tuesday",
      //Max:
  },
  
  wedCount: {
      type: Number,
      label: "Wednesday",
      //Max:
  },
  
  thuCount: {
      type: Number,
      label: "Thursday",
      //Max:
  },
  
  friCount: {
      type: Number,
      label: "Friday",
      //Max:
  },
  
});

//Potential code for bottom line of Forecast table.
//How many seats are availabe for each day.

/*
Schemas.SeatsAvailable = new SimpleSchema({
   available: {
     type: String,
     label: "Seats Available",
   } ,
   
   monAvail: {
      type: Number,
      label: "Monday",
   },
   
   tueAvail: {
       type: Number,
       label: "Tuesday",
   },
   
   wedAvail: {
       type: Number,
       label: "Wednesday",
   },
   
   ThuAvail: {
       type: Number,
       label: "Thursday",
   },
   
   friAvail: {
     type: Number,
     label: "Friday",
   },
   
});
*/

Forecast.attachSchema(Schemas.Forecast);

//SeatsAvailable.attachSchema(Schemas.SeatsAvailable);