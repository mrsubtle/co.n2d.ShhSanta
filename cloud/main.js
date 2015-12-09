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

Parse.Cloud.define("setInstallationUser", function(request, response){
  var user = Parse.User.current();
  var installationID = request.params.installationID;

  var Installation = Parse.Object.extend("_Installation");
  var installationQuery = new Parse.Query(Installation);
  installationQuery.get(installationID, {
    success: function(installationObject) {
      console.log("Got installation object "+installationObject.id);
      console.log("Adding user "+user.id);
      installationObject.set('User', user);
      installationObject.set('channels', ["global","U_"+user.id]);
      installationObject.save({
        success: function(updatedInstallationObject) {
          console.log('Updated installation '+myObject.id+' for User '+user.id);
          user.set("hasPushLinked",true);
          user.save();
          response.success(updatedInstallationObject);
        },
        error: function(error) {
          response.error(error);
        }
      });
    },
    error: function(error) {
      console.log("Could not get installation object "+installationID);
      response.error(error);
    }
  });
});

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
          html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><head><meta name="viewport" content="width=device-width"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>You are invited!</title></head><body itemscope="" itemtype="http://schema.org/EmailMessage" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0; padding: 0" bgcolor="#f6f6f6"><table style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; width: 100%; background-color: #f6f6f6; margin: 0" bgcolor="#f6f6f6"><tr style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><td style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; vertical-align: top; margin: 0" valign="top"></td><td width="600" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; width: 100% !important; margin: 0 auto; padding: 0" valign="top"><div style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; max-width: 600px; display: block; margin: 0 auto; padding: 0"><table width="100%" cellpadding="0" cellspacing="0" itemprop="action" itemscope="" itemtype="http://schema.org/ConfirmAction" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9" bgcolor="#fff"><tr style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><td style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; vertical-align: top; margin: 0; padding: 10px" valign="top"><img src="http://shh-santa.com/email/invited-header-01.png" width="100%" alt="You are Invited!" title="You are Invited!" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; max-width: 100%; border-bottom-width: 1px; border-bottom-color: #e0e0e0; border-bottom-style: solid; margin: 0"></td></tr><tr style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><td style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; vertical-align: top; margin: 0; padding: 10px" valign="top"><meta itemprop="name" content="Download App" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><table width="100%" cellpadding="0" cellspacing="0" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><tr style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><td style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; vertical-align: top; margin: 0; padding: 0 0 20px" valign="top"><p style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; font-weight: normal; margin: 0 0 10px">Heyo!</p><p style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; font-weight: normal; margin: 0 0 10px">'+ sendingUser.get('displayName') +' has sent you an invitation to join a <strong style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0">Secret Santa</strong> event in the <em style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><strong style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0">Shh Santa!</strong> mobile app</em>!</p></td></tr><tr style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><td style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; vertical-align: top; margin: 0; padding: 0 0 20px" valign="top">To download the app and accept your invitation, select your mobile platform below.</td></tr><tr style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><td itemprop="handler" itemscope="" itemtype="http://schema.org/HttpActionHandler" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; vertical-align: top; text-align: center; margin: 0; padding: 0 0 20px" align="center" valign="top"><a href="https://geo.itunes.apple.com/us/app/shh-santa!/id1057261178?mt=8" itemprop="url" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; color: #348eda; text-decoration: underline; margin: 0"><img src="http://shh-santa.com/email/apple-appstore-badge.png" height="40" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; max-width: 100%; margin: 0"></a><br style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><a href="https://geo.itunes.apple.com/us/app/shh-santa!/id1057261178?mt=8" itemprop="url" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; color: #348eda; text-decoration: underline; margin: 0">Download from the Apple App Store</a></td></tr><tr style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><td itemprop="handler" itemscope="" itemtype="http://schema.org/HttpActionHandler" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; vertical-align: top; text-align: center; margin: 0; padding: 0 0 20px" align="center" valign="top"><a href="https://play.google.com/store/apps/details?id=co.n2d.ShhSanta&amp;utm_source=global_co&amp;utm_medium=prtnr&amp;utm_content=Mar2515&amp;utm_campaign=PartBadge&amp;pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1" itemprop="url" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; color: #348eda; text-decoration: underline; margin: 0"><img src="http://shh-santa.com/email/google-play-badge.png" height="40" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; max-width: 100%; margin: 0"></a><br style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><a href="https://play.google.com/store/apps/details?id=co.n2d.ShhSanta&amp;utm_source=global_co&amp;utm_medium=prtnr&amp;utm_content=Mar2515&amp;utm_campaign=PartBadge&amp;pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1" itemprop="url" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; color: #348eda; text-decoration: underline; margin: 0">Download from Google Play</a></td></tr><tr style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><td style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; vertical-align: top; margin: 0; padding: 0 0 20px" valign="top"><p style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; font-weight: normal; margin: 0 0 10px"><br style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0">Sincerely,</p><p style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; font-weight: normal; margin: 0 0 10px"><strong style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0">Santa\'s Robo-Elf</strong><br style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><a href="http://shh-santa.com" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; color: #348eda; text-decoration: underline; margin: 0">shh-santa.com</a></p></td></tr></table></td></tr></table><div style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px"><table width="100%" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><tr style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><td style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px" align="center" valign="top">Visit <a href="http://facebook.com/shhsanta" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 12px; color: #999; text-decoration: underline; margin: 0">Shh Santa</a> on Facebook.</td></tr><tr style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; margin: 0"><td style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px" align="center" valign="top"><a href="http://shh-santa.com/privacy.html" style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 12px; color: #999; text-decoration: underline; margin: 0">Privacy Policy</a></td></tr></table></div></div></td><td style="font-family: \'Avenir Next\', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 17px; vertical-align: top; margin: 0" valign="top"></td></tr></table></body></html>'
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