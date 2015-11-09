// Parse Cloud Code (main.js)

var _ = require('underscore');

var util = {
  shuffleFY : function (input) {
    for (var i = input.length-1; i >=0; i--) {
     
      var randomIndex = Math.floor(Math.random()*(i+1)); 
      var itemAtIndex = input[randomIndex]; 
       
      input[randomIndex] = input[i]; 
      input[i] = itemAtIndex;
    }
    return input;
  },
  shuffleSattolo : function (array) {
    for (var i = array.length-1; i >=0; i--) {
     
      var j = Math.floor(Math.random()*(i)); 
      var itemAtIndex = array[j]; 
       
      array[j] = array[i]; 
      array[i] = itemAtIndex;
    }
    return array;
  }
};

function getAttendaceForEvent(ParseEvent){
  var Attendance = Parse.Object.extend('Attendance');
  var attendaceQuery = new Parse.Query(Attendance);
  attendaceQuery.equalTo('event', ParseEvent);
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

function shuffle(array) {
  //Fisher-Yates (aka Knuth) Shuffle
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


Parse.Cloud.define("rollTheDice", function(request, response) {
  var id = request.params.ParseEventID;
  var Event = Parse.Object.extend("Event");
  var eventQuery = new Parse.Query(Event);
  eventQuery.get(id, {
    success: function(eventObject){
      eventObject.set('isLocked', request.params.close);
      eventObject.save({
        success: function(lockedEvent){
          if (request.params.close == true) {
            var Attendance = Parse.Object.extend('Attendance');
            var attendaceQuery = new Parse.Query(Attendance);
            attendaceQuery.equalTo('event', lockedEvent);
            attendaceQuery.include('attendee');
            attendaceQuery.find({
              success: function(attendanceArray){
                var usersGoing = [];
                _.each(attendanceArray, function(o,i,a){
                  if(o.get('status') == 1 || o.get('status') == 2) {
                    usersGoing.push(o.get("attendee"));
                  }
                });
                var santasArray = [];
                //TODO
                //investigate if a better solution exists
                //current as per http://stackoverflow.com/questions/27630794/shuffle-array-so-no-two-keys-are-in-the-same-location
                var theHat = _.shuffle(usersGoing);
                //var theHat1 = _.shuffle(usersGoing);
                //var theHat2 = _.union(_.rest(theHat1), [_.first(theHat1)]);
                //iterate over attendanceArray and draw from theHat2
                _.each(usersGoing, function(o,i,a){
                  //assign santas to recipients
                  santasArray.push({
                    santa : o,
                    recipient : theHat[i]
                  });
                });
                var Santas = Parse.Object.extend("Santas");
                if (request.params.assignSantas == true){
                  _.each(santasArray,function(o,i,a){
                    var santa = new Santas();
                    santa.set('santa', o.santa);
                    santa.set('recipient', o.recipient);
                    santa.set('event', lockedEvent);
                    santa.set('isDoneShopping', false);
                    santa.set('isDoneWrapping', false);
                    santa.save({
                      success: function(santaResult){
                        console.log(santaResult);
                      },
                      error: function(e){
                        console.error(e);
                      }
                    });
                  });
                }
                response.success(lockedEvent);
              },
              error: function(error){
                console.error(error);
                response.error({ message: "Failed to get the event ("+eventObject.id+") attendees" });
              }
            });
          } else {
            console.log("Destroying Santas for EventID: "+lockedEvent.id);
            var Santas = Parse.Object.extend('Santas');
            var santasQuery = new Parse.Query(Santas);
            santasQuery.equalTo('event', lockedEvent);
            santasQuery.each(function(santa){
              console.log("Destroying Santa ID: "+santa.id);
              santa.destroy();
            }).then(function(){
              response.success(lockedEvent);
            });
          }
        },
        error: function(e){
          console.error(e);
          response.error({ error: e, message: "Failed to save the event ("+eventObject.id+") after locking" });
        }
      });
      //response.success(eventObject);
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