
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("rollTheDice", function(request, response) {
  response.success("Hello world!");
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