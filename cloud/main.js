// Parse Cloud Code (main.js)

var _ = require('underscore');

function getAttendaceForEvent(ParseEvent){
  var Attendance = Parse.Object.extend('Attendance');
  var attendaceQuery = new Parse.Query(Attendance);
  attendaceQuery.equalTo('event', ParseEvent.id);
  attendaceQuery.include('attendee');
  attendaceQuery.find({
    success: function(attendanceArray){
      return attendanceArray;
    },
    error: function(error){
      console.error(error);
      return false;
    }
  });
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Parse.Cloud.define("rollTheDice", function(request, response) {
  var id = request.params.ParseEventID;
  var Event = Parse.Object.extend("Event");
  var eventQuery = new Parse.Query(Event);
  eventQuery.get(id, {
    success: function(eventObject){
      eventObject.set('isLocked', true);
      eventObject.save({
        success: function(lockedEvent){
          //TODO
          //remove outstanding invitations? DECISION: Not to remove invites in the event a user prematurely locked the event
          var santasArray = [];
          var attendanceArray = getAttendaceForEvent(lockedEvent);
          var theHat = attendanceArray;
          if(attendanceArray){
            //iterate over attendanceArray and draw from theHat
            _.each(attendanceArray, function(o,i,a){
              //random SantaIndex for referencing theHat
              var hi = getRandomInt(0,(theHat.length-1));
              //iterate through attendees
              //verify that santa is not attendee
              if (i == (attendanceArray.length-1) && o.id == theHat[hi].id) {
                var tempR = santasArray[0].recipient
                santasArray[0] = {
                  santa : santasArray[0].santa,
                  recipient : theHat[hi]
                };
                santasArray.push({
                  santa : o,
                  recipient : tempR
                });
              } else {
                santasArray.push({
                  santa : o,
                  recipient : theHat[hi]
                });
              }
              theHat = _.rest(theHat, hi);
            });
            var Santas = Parse.Object.extend("Santas");
            _.each(santasArray,function(o,i,a){
              var santa = new Santas();
              santa.set('santa', o.santa);
              santa.set('recipient', o.recipient);
              santa.set('event', lockedEvent);
              santa.set('isDoneShopping', false);
              santa.set('isDoneWrapping', false);
              santa.save({
                success: function(){},
                error: function(e){
                  console.error(e);
                  response.error({ error: e, message: "Failed to save the santa object for event ("+lockedEvent.id+")" });
                }
              });
            });
            response.success(lockedEvent);
          } else {
            response.error({ message: "Failed to get the event ("+eventObject.id+") attendees" });
          }
        },
        error: function(e){
          console.error(e);
          response.error({ error: e, message: "Failed to save the event ("+eventObject.id+") after locking" });
        }
      });
      response.success(eventObject);
    },
    error: function(e){
      console.error(e);
      response.error({ error: e, message: "Failed to find that Event ID" });
    }
  });
});

//after an Event is saved, create an Attendance row for the user that created the event
Parse.Cloud.afterSave("Event", function(request) {
  var createdAt = request.object.get("createdAt");
  var updatedAt = request.object.get("updatedAt");
  var objectExisted = createdAt.getTime() != updatedAt.getTime() ? true : false;
  if(objectExisted == false){
    var Attendance = Parse.Object.extend("Attendance");
    var attend = new Attendance();
    attend.set('attendee', request.object.get("createdBy"));
    attend.set('email', request.user.get("email"));
    attend.set('event', request.object);
    attend.set('status', 2); //0 = not going, 1 = going, 2 = organiser, 99 = not set
    attend.save(null,{
      success: function(attendanceObject){
        console.log('Created Attendance Object');
      },
      error: function(error){
        console.error(error);
      }
    });
  }
});
Parse.Cloud.afterDelete("Event", function(request) {
  query = new Parse.Query("Attendance");
  query.equalTo("event", request.object);
  query.find({
    success: function(attendanceObjects) {
      Parse.Object.destroyAll(attendanceObjects, {
        success: function() {},
        error: function(error) {
          console.error("Error deleting related attendanceObjects " + error.code + ": " + error.message);
        }
      });
    },
    error: function(error) {
      console.error("Error finding related attendanceObjects " + error.code + ": " + error.message);
    }
  });
});
Parse.Cloud.beforeSave("Attendance", function(request, response){
  if (typeof request.object.get('email') != "undefined") {
    var email = request.object.get('email');
    var User = Parse.Object.extend("User");
    var userQuery = new Parse.Query(User);
    userQuery.equalTo('email', email);
    userQuery.first({
      success: function(userResult){
        request.object.set('attendee', userResult);
        response.success();
      },
      error: function(e){
        console.error(e);
      }
    });
  }
});