// Parse Cloud Code (main.js)

var _ = require('underscore');
var Mailgun = require('mailgun');
Mailgun.initialize('robot.shh-santa.com', 'key-adbe6932e8b425ec158ef5ca5d31f867');

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
//define sort algorithm
function suffleSattolo(array) {
  //https://en.wikipedia.org/wiki/Fisher–Yates_shuffle#Sattolo.27s_algorithm
  for(var i = array.length; i-- > 1; ){
    var j = Math.floor(Math.random() * i);
    var tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
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
                var theHat = usersGoing.slice(0);
                suffleSattolo(theHat);
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
  var sendingUser = Parse.User.current();
  if (typeof request.object.get('email') != "undefined") {
    var email = request.object.get('email');
    var User = Parse.Object.extend("User");
    var userQuery = new Parse.Query(User);
    userQuery.equalTo('email', email);
    userQuery.first({
      success: function(userResult){
        request.object.set('attendee', userResult);
        //send Mailgun Email
        Mailgun.sendEmail({
          to: email,
          from: "Santa's Robo-Elf <no-reply@shh-santa.com>",
          subject: "You're Invited!",
          html: "<p>HEYO!</p><p>"+ sendingUser.get('displayName') +" has sent you an invitation to join a Secret Santa event in the <strong>Shh Santa!</strong> <em>mobile app</em>!</p><p>To download the app and accept your invitation, select your mobile platform below...</p><p><a href='https://geo.itunes.apple.com/us/app/shh-santa!/id1057261178?mt=8' style='display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/images/badges/en-us/badge_appstore-lrg.svg) no-repeat;width:165px;height:40px;''></a><br><a href='https://geo.itunes.apple.com/us/app/shh-santa!/id1057261178?mt=8'>Click here to download on the Apple App Store</a></p><p><a href='https://play.google.com/store/apps/details?id=co.n2d.ShhSanta&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img alt='Get it on Google Play' height='40' src='https://play.google.com/intl/en_us/badges/images/generic/en-play-badge.png' /></a><br><a href='https://play.google.com/store/apps/details?id=co.n2d.ShhSanta&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1''>Click here to download on the Google Play Store</a></p><p>If you already have the <strong>Shh Santa!</strong> app, your event is waiting for you in the <em>Invitations</em> tab under <em>Events</em>.</p><p><br>Sincerely,<br><strong>Santa's Robo-Elf</strong><br><small><a href='http://shh-santa.com/'>shh-santa.com</a><br><a href='http://shh-santa.com/privacy.html'>Privacy Policy</a></small></p><p><small>PS.<br>Don't reply directly to this email, I'm just a robot!</small></p>"
        }, {
          success: function(httpResponse) {
            console.log(httpResponse);
            console.log('Sent via Mailgun to '+email);
            //response.success("Email sent!");
            response.success();
          },
          error: function(httpResponse) {
            console.error(httpResponse);
            console.log('Mailgun could not send email to '+email);
            //response.error("Uh oh, something went wrong");
            response.success();
          }
        });
      },
      error: function(e){
        console.error(e);
      }
    });
  }
});