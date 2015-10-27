
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

//after an Event is saved, create an Attendance row for the user that created the event
Parse.Cloud.afterSave("Event", function(request) {
  var Attendance = Parse.Object.extend("Attendance");
  var attend = new Attendance();
  attend.set('attendee', request.object.get("createdBy"));
  attend.set('event', request.object);
  attend.set('status', 2); //0 = not going, 1 = going, 2 = organiser
  attend.save(null,{
  	success: function(attendanceObject){
  		console.log('Created Attendance Object');
  	},
  	error: function(error){
  		console.error(error);
  	}
  });
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