/*
 * index.js
 */

// Modify Date object to include an addHours and subHours functions
  Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
  }
  Date.prototype.subHours= function(h){
    this.setHours(this.getHours()-h);
    return this;
  }
  Date.prototype.addMinutes= function(m){
    this.setMinutes(this.getMinutes()+m);
    return this;
  }
  Date.prototype.subMinutes= function(m){
    this.setMinutes(this.getMinutes()-m);
    return this;
  }
  Date.prototype.addSeconds= function(s){
    this.setSeconds(this.getSeconds()+s);
    return this;
  }
  Date.prototype.subSeconds= function(s){
    this.setSeconds(this.getSeconds()-s);
    return this;
  }
  Date.prototype.toUTC = function(){
    //this requires the Moment.js library to be loaded
    if (moment) { this.setMinutes(this.getMinutes() + moment().utcOffset()); }
    return this;
  }

var as = {
  as_eventDetail_invitation : {
    el : "#as_eventDetail_invitation",
    hide : function(){
      this.remE();
      $('group.actionSheetContainer').one('webkittransitionend transitionend',function(){
        $(as.as_eventDetail_invitation.el).addClass('hidden');
      });
      $('group.actionSheetContainer').addClass('actionSheetOff');
      $('.app').removeClass('tilt');
    },
    show : function(){
      $('.app').addClass('tilt');
      as.as_eventDetail_invitation.remE().done(as.as_eventDetail_invitation.addE().done(as.as_eventDetail_invitation.render));
    },
    addE : function(){
      return $.Deferred(function(a){
        $(as.as_eventDetail_invitation.el + ' #btn_destroyAttendanceItem').hammer().on('tap', function(){
          as.as_eventDetail_invitation.destroyAttendance(user.currentAttendanceID).done(function(){
            console.log('Destroyed');
            pages.eventDetail.getAttendanceForEvent(user.currentEvent).done(function(attendanceArray){
              as.as_eventDetail_invitation.hide();
              pages.eventDetail.renderAttendance(attendanceArray);
            });
          });
        });
        $(as.as_eventDetail_invitation.el + ' #btn_cancel_attendance').hammer().on('tap', function(){
          as.as_eventDetail_invitation.hide();
        });
        a.resolve();
      }).promise();
    },
    remE : function(){
      return $.Deferred(function(r){
        $(as.as_eventDetail_invitation.el + ' #btn_destroyAttendanceItem').hammer().off('tap');
        $(as.as_eventDetail_invitation.el + ' #btn_cancel_attendance').hammer().off('tap');
        r.resolve();
      }).promise();
    },
    render : function(){
      //unhide the appropriate as content
      $(as.as_eventDetail_invitation.el).removeClass('hidden');
      //animate modal container
      $('group.actionSheetContainer').removeClass('actionSheetOff');
    },
    destroyAttendance : function(attendanceObjectID){
      return $.Deferred(function(da){
        if (typeof attendanceObjectID != "undefined") {
          var Attendance = Parse.Object.extend("Attendance");
          var attendanceQuery = new Parse.Query(Attendance);
          attendanceQuery.get(attendanceObjectID, {
            success: function(attendanceObject) {
              attendanceObject.destroy({
                success: function(myObject) {
                  // The object was deleted from the Parse Cloud.
                  da.resolve();
                },
                error: function(error) {
                  app.e("Oh no! I couldn't remove that invitation! Try again in a few minutes.");
                  app.l(JSON.stringify(error),2);
                  da.reject(error);
                }
              });
            },
            error: function(error) {
              app.e("Oh no! I couldn't find that invitation to recall it! Try again in a few minutes.");
              app.l(JSON.stringify(error),2);
              da.reject(error);
            }
          });
        }
      }).promise();
    }
  },
  as_eventDetail_invitation_rsvp : {
    el : "#as_eventDetail_invitation_rsvp",
    hide : function(){
      this.remE();
      $('group.actionSheetContainer').one('webkittransitionend transitionend',function(){
        $(as.as_eventDetail_invitation_rsvp.el).addClass('hidden');
      });
      $('group.actionSheetContainer').addClass('actionSheetOff');
      $('.app').removeClass('tilt');
    },
    show : function(){
      $('.app').addClass('tilt');
      as.as_eventDetail_invitation_rsvp.remE().done(as.as_eventDetail_invitation_rsvp.addE().done(as.as_eventDetail_invitation_rsvp.render));
    },
    addE : function(){
      return $.Deferred(function(a){
        $(as.as_eventDetail_invitation_rsvp.el + ' #btn_accept').hammer().on('tap', function(){
          as.as_eventDetail_invitation_rsvp.doAccept(user.currentAttendanceID).done(function(){
            console.log('Accepted');
            pages.eventDetail.getAttendanceForEvent(user.currentEvent).done(function(attendanceArray){
              as.as_eventDetail_invitation_rsvp.hide();
              pages.eventDetail.renderAttendance(attendanceArray);
            });
          });
        });
        $(as.as_eventDetail_invitation_rsvp.el + ' #btn_decline').hammer().on('tap', function(){
          as.as_eventDetail_invitation_rsvp.doDecline(user.currentAttendanceID).done(function(){
            console.log('Declined');
            pages.eventDetail.getAttendanceForEvent(user.currentEvent).done(function(attendanceArray){
              as.as_eventDetail_invitation_rsvp.hide();
              pages.eventDetail.renderAttendance(attendanceArray);
            });
          });
        });
        $(as.as_eventDetail_invitation_rsvp.el + ' #btn_cancel_rsvp').hammer().on('tap', function(){
          as.as_eventDetail_invitation_rsvp.hide();
        });
        a.resolve();
      }).promise();
    },
    remE : function(){
      return $.Deferred(function(r){
        $(as.as_eventDetail_invitation_rsvp.el + ' #btn_accept').hammer().off('tap');
        $(as.as_eventDetail_invitation_rsvp.el + ' #btn_decline').hammer().off('tap');
        $(as.as_eventDetail_invitation_rsvp.el + ' #btn_cancel_rsvp').hammer().off('tap');
        r.resolve();
      }).promise();
    },
    render : function(){
      //unhide the appropriate as content
      $(as.as_eventDetail_invitation_rsvp.el).removeClass('hidden');
      //animate modal container
      $('group.actionSheetContainer').removeClass('actionSheetOff');
    },
    doAccept : function(attendanceObjectID){
      return $.Deferred(function(da){
        if (typeof attendanceObjectID != "undefined") {
          var Attendance = Parse.Object.extend("Attendance");
          var attendanceQuery = new Parse.Query(Attendance);
          attendanceQuery.get(attendanceObjectID, {
            success: function(attendanceObject) {
              attendanceObject.set('status', 1);
              attendanceObject.save({
                success: function(myObject) {
                  da.resolve();
                },
                error: function(error) {
                  app.e("Oh no! I couldn't accept the invitation! Try again in a few minutes.");
                  app.l(JSON.stringify(error),2);
                  da.reject(error);
                }
              });
            },
            error: function(error) {
              app.e("Oh no! I couldn't find that invitation to accept it! Try again in a few minutes.");
              app.l(JSON.stringify(error),2);
              da.reject(error);
            }
          });
        }
      }).promise();
    },
    doDecline : function(attendanceObjectID){
      return $.Deferred(function(dd){
        if (typeof attendanceObjectID != "undefined") {
          var Attendance = Parse.Object.extend("Attendance");
          var attendanceQuery = new Parse.Query(Attendance);
          attendanceQuery.get(attendanceObjectID, {
            success: function(attendanceObject) {
              attendanceObject.set('status', 1);
              attendanceObject.save({
                success: function(myObject) {
                  dd.resolve();
                },
                error: function(error) {
                  app.e("Oh no! I couldn't decline the invitation! Try again in a few minutes.");
                  app.l(JSON.stringify(error),2);
                  dd.reject(error);
                }
              });
            },
            error: function(error) {
              app.e("Oh no! I couldn't find that invitation to decline! Try again in a few minutes.");
              app.l(JSON.stringify(error),2);
              dd.reject(error);
            }
          });
        }
      }).promise();
    }
  },
  as_start_sorts : {
    el : "#as_start_sorts",
    hide : function(){
      this.remE();
      $('group.actionSheetContainer').one('webkittransitionend transitionend',function(){
        $(as.as_start_sorts.el).addClass('hidden');
      });
      $('group.actionSheetContainer').addClass('actionSheetOff');
      $('.app').removeClass('tilt');
    },
    show : function(){
      $('.app').addClass('tilt');
      as.as_start_sorts.remE().done(as.as_start_sorts.addE().done(as.as_start_sorts.render));
    },
    addE : function(){
      return $.Deferred(function(a){
        $(as.as_start_sorts.el + ' #btn_accept').hammer().on('tap', function(){
          as.as_start_sorts.doAccept(user.currentAttendanceID).done(function(){
            console.log('Accepted');
            pages.eventDetail.getAttendanceForEvent(user.currentEvent).done(function(attendanceArray){
              as.as_start_sorts.hide();
              pages.eventDetail.renderAttendance(attendanceArray);
            });
          });
        });
        $(as.as_start_sorts.el + ' #btn_decline').hammer().on('tap', function(){
          as.as_start_sorts.doDecline(user.currentAttendanceID).done(function(){
            console.log('Declined');
            pages.eventDetail.getAttendanceForEvent(user.currentEvent).done(function(attendanceArray){
              as.as_start_sorts.hide();
              pages.eventDetail.renderAttendance(attendanceArray);
            });
          });
        });
        $(as.as_start_sorts.el + ' #btn_cancel_rsvp').hammer().on('tap', function(){
          as.as_start_sorts.hide();
        });
        a.resolve();
      }).promise();
    },
    remE : function(){
      return $.Deferred(function(r){
        $(as.as_start_sorts.el + ' #btn_accept').hammer().off('tap');
        $(as.as_start_sorts.el + ' #btn_decline').hammer().off('tap');
        $(as.as_start_sorts.el + ' #btn_cancel_rsvp').hammer().off('tap');
        r.resolve();
      }).promise();
    },
    render : function(){
      //unhide the appropriate as content
      $(as.as_start_sorts.el).removeClass('hidden');
      //animate modal container
      $('group.actionSheetContainer').removeClass('actionSheetOff');
    },
    doAccept : function(attendanceObjectID){
      return $.Deferred(function(da){
        if (typeof attendanceObjectID != "undefined") {
          var Attendance = Parse.Object.extend("Attendance");
          var attendanceQuery = new Parse.Query(Attendance);
          attendanceQuery.get(attendanceObjectID, {
            success: function(attendanceObject) {
              attendanceObject.set('status', 1);
              attendanceObject.save({
                success: function(myObject) {
                  da.resolve();
                },
                error: function(error) {
                  app.e("Oh no! I couldn't accept the invitation! Try again in a few minutes.");
                  app.l(JSON.stringify(error),2);
                  da.reject(error);
                }
              });
            },
            error: function(error) {
              app.e("Oh no! I couldn't find that invitation to accept it! Try again in a few minutes.");
              app.l(JSON.stringify(error),2);
              da.reject(error);
            }
          });
        }
      }).promise();
    },
    doDecline : function(attendanceObjectID){
      return $.Deferred(function(dd){
        if (typeof attendanceObjectID != "undefined") {
          var Attendance = Parse.Object.extend("Attendance");
          var attendanceQuery = new Parse.Query(Attendance);
          attendanceQuery.get(attendanceObjectID, {
            success: function(attendanceObject) {
              attendanceObject.set('status', 1);
              attendanceObject.save({
                success: function(myObject) {
                  dd.resolve();
                },
                error: function(error) {
                  app.e("Oh no! I couldn't decline the invitation! Try again in a few minutes.");
                  app.l(JSON.stringify(error),2);
                  dd.reject(error);
                }
              });
            },
            error: function(error) {
              app.e("Oh no! I couldn't find that invitation to decline! Try again in a few minutes.");
              app.l(JSON.stringify(error),2);
              dd.reject(error);
            }
          });
        }
      }).promise();
    }
  }
};

var modals = {
  mdl_item_create : {
    el : "#mdl_item_create",
    hide : function(){
      this.remE();
      $('group.modalContainer').one('webkittransitionend transitionend',function(){
        $(modals.mdl_item_create.el).addClass('hidden');
        setTimeout(function(){
          //reset the modal
          $('#frm_item_create')[0].reset();
          $(modals.mdl_item_create.el + ' #item_create_photoContainer').html('');
          $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').addClass('hidden');
        },1);
      });
      $('group.modalContainer').addClass('modalOff');
      $('.app').toggleClass('tilt');
    },
    show : function(){
      $('.app').toggleClass('tilt');
      modals.mdl_item_create.remE().done(modals.mdl_item_create.addE().done(modals.mdl_item_create.render));
    },
    addE : function() {
      return $.Deferred(function(a){
        $(modals.mdl_item_create.el + ' #frm_item_create').on('submit',function(e){
          if (user.tx.item == false) {
            modals.mdl_item_create.setData();
          }
          e.preventDefault();
        });
        $(modals.mdl_item_create.el + ' #btn_cancel').hammer().on('tap',function(e){
          modals.mdl_item_create.hide();
          e.preventDefault();
        });
        $(modals.mdl_item_create.el + ' #btn_save').hammer().on('tap',function(e){
          if (user.tx.item == false) {
            modals.mdl_item_create.setData();
          }
          e.preventDefault();
        });
        $(modals.mdl_item_create.el + ' #txt_upc').on('blur',function(e){
          var upc = $(modals.mdl_item_create.el + ' #txt_upc').val();
          if(upc != "" || upc != null){
            try {
              util.getDataUPC(upc,function(d){
                $(modals.mdl_item_create.el + ' #lbl_barcodeStatus').html('...item found!');
                //if an image is available, pre-load the image
                if( d.images.length >= 1 ){
                  util.convertImgToBase64(d.images[0],function(base64string){
                    var v = {
                      uri : base64string
                    };
                    var tpl = _.template( $('#tpl_item_create_photo').html() );
                    $(modals.mdl_item_create.el + ' #item_create_photoContainer').html(tpl(v));
                    $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').removeClass("hidden");
                  });
                }
                //populate the item name
                $(modals.mdl_item_create.el + ' #txt_name').val(d.name);
              },function(e){
                var obj = $(modals.mdl_item_create.el + ' #lbl_barcodeStatus');
                var objMsg = obj.html();
                obj.html('...item info not found. :(');
                setTimeout(function(){
                  obj.html(objMsg);
                },3000);
              });
            } catch (e) {
              app.l(JSON.stringify(e),2);
            }
          }
        });
        $(modals.mdl_item_create.el + ' #btn_scanBarcode').hammer().on('tap',function(e){
          var lblO = $(modals.mdl_item_create.el + ' #frm_item_create #lbl_barcodeStatus');
          var tmpLbl = lblO.html();
          lblO.html( $('#tpl_loading').html() );
          ActivityIndicator.show("Looking up UPC");
          //scan that code!
          cordova.plugins.barcodeScanner.scan(
            function (result) {
              ActivityIndicator.hide();
              if(result.cancelled == 0){
                lblO.html('...successful scan...');
                $('#frm_item_create #txt_upc').val(result.text);
                var upc = result.text;
                if(upc != "" || upc != null){
                  util.getDataUPC(upc,function(d){
                    //if an image is available, pre-load the image
                    if( d.images.length >= 1 ){
                      util.convertImgToBase64(d.images[0],function(base64string){
                        var v = {
                          uri : base64string
                        };
                        var tpl = _.template( $('#tpl_item_create_photo').html() );
                        $(modals.mdl_item_create.el + ' #item_create_photoContainer').html(tpl(v));
                        $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').removeClass("hidden");
                      });
                    }
                    //populate the item name
                    $(modals.mdl_item_create.el + ' #txt_name').val(d.name);

                  },function(e){
                    app.l(JSON.stringify(e),2);
                  });
                }
              } else {
                lblO.html(tmpLbl);
              }
            },
            function (error) {
              ActivityIndicator.hide();
              lblO.html(tmpLbl);
              app.e("Oops! Scan seems to have failed, but don't worry - we'll fix it. Eventiually.");
              app.l(JSON.stringify(error),2);
            }
          );
          e.preventDefault();
        });
        $(modals.mdl_item_create.el + ' #btn_takeItemPhoto').hammer().on('tap',function(e){
          util.photo.takeNew().done(function(base64string){
            var v = {
              uri : "data:image/jpeg;base64," + base64string
            };
            var tpl = _.template( $('#tpl_item_create_photo').html() );
            $(modals.mdl_item_create.el + ' #item_create_photoContainer').html(tpl(v));
            $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').removeClass('hidden');
          }).fail(function(err){
            app.e("Umm... This is embarassing. I can't seem to access your camera...  I don't know why not.  Do you?");
            app.l(JSON.stringify(err),2);
          });
          e.preventDefault();
        });
        $(modals.mdl_item_create.el + ' #btn_selectItemPhoto').hammer().on('tap',function(e){
          util.photo.fromLibrary().done(function(base64string){
            var v = {
              uri : "data:image/jpeg;base64," + base64string
            };

            var tpl = _.template( $('#tpl_item_create_photo').html() );
            $(modals.mdl_item_create.el + ' #item_create_photoContainer').html(tpl(v));
            $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').removeClass('hidden');
          }).fail(function(e){
            app.e("Umm... This is embarassing. I can't open the gallery.  I don't know why.  Do you?");
            app.l(JSON.stringify(e),2);
          });
          e.preventDefault();
        });
        $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').hammer().on('tap',function(e){
          $(modals.mdl_item_create.el + ' #item_create_photoContainer').html('');
          $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').addClass('hidden');
          e.preventDefault();
        });
        a.resolve();
      }).promise();
    },
    remE : function() {
      return $.Deferred(function(r){
        $(modals.mdl_item_create.el + ' #frm_item_create').off('submit');
        $(modals.mdl_item_create.el + ' #btn_cancel').hammer().off('tap');
        $(modals.mdl_item_create.el + ' #btn_save').hammer().off('tap');
        $(modals.mdl_item_create.el + ' #txt_upc').off('blur');
        $(modals.mdl_item_create.el + ' #btn_scanBarcode').hammer().off('tap');
        $(modals.mdl_item_create.el + ' #btn_takeItemPhoto').hammer().off('tap');
        $(modals.mdl_item_create.el + ' #btn_selectItemPhoto').hammer().off('tap');
        $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').hammer().off('tap');
        r.resolve();
      }).promise();
    },
    render : function(){
      $(modals.mdl_item_create.el + ' #item_create_photoContainer').html('');
      $(modals.mdl_item_create.el + ' #btn_deleteItemPhoto').addClass("hidden");
      //unhide the appropriate modal
      $(modals.mdl_item_create.el).removeClass('hidden');
      $(modals.mdl_item_create.el + ' content').scrollTop(0);
      //animate modal container
      $('group.modalContainer').removeClass('modalOff');
    },
    setData : function(){
      user.tx.item = true;
      ActivityIndicator.show("Saving");
      var Item = Parse.Object.extend("Item");
      var newItem = new Item();
      newItem.set('owner',Parse.User.current());
      newItem.set('name',$(modals.mdl_item_create.el+" #txt_name").val());
      newItem.set('description',$(modals.mdl_item_create.el+" #txt_description").val());
      newItem.set('upc',parseInt($(modals.mdl_item_create.el+" #txt_upc").val()));
      newItem.set('rating',parseInt($(modals.mdl_item_create.el+" #txt_rating").val()));
      newItem.set('lastSeenAt',$(modals.mdl_item_create.el+" #txt_lastSeenAt").val());
      newItem.set('estPrice',parseInt($(modals.mdl_item_create.el+" #txt_estPrice").val()));
      if($('#mdl_item_create #item_create_photoContainer img').length != 0){
        var t = $('#mdl_item_create #item_create_photoContainer img').attr('src');
        var a = ";base64,";
        var e = t.slice((t.indexOf("/")+1),t.indexOf(";"));
        var base64data = t.slice(t.indexOf(a) + a.length);
        var image = new Parse.File('item.'+e,{ base64 : base64data });
        image.save().then(function(){
          newItem.set('photo', image);
          newItem.save(null,{
            success : function(newItem){
              user.tx.item = false;
              ActivityIndicator.hide();
              user.wishList.push(newItem);
              pages.wishList.init();
              modals.mdl_item_create.hide();
            },
            error : function(newItem,error){
              user.tx.item = false;
              ActivityIndicator.hide();
              app.e("Couldn't save that item.  We'll look into it ASAP!");
              app.l(JSON.stringify(error,null,2),2);
            }
          });
        });
      } else {
        newItem.save(null,{
          success : function(newItem){
            ActivityIndicator.hide();
            user.tx.item = false;
            user.wishList.push(newItem);
            pages.wishList.init();
            modals.mdl_item_create.hide();
          },
          error : function(newItem,error){
            ActivityIndicator.hide();
            user.tx.item = false;
            app.e("Couldn't save that item.  We'll look into it ASAP!");
            app.l(JSON.stringify(error,null,2),2);
          }
        });
      }
    }
  },
  mdl_event_create : {
    el : "#mdl_event_create",
    hide : function(){
      this.remE();
      $('group.modalContainer').one('webkittransitionend transitionend',function(){
        $(modals.mdl_event_create.el).addClass('hidden');
        setTimeout(function(){
          //reset the modal
          $('#frm_item_create')[0].reset();
          $(modals.mdl_event_create.el + ' #item_create_photoContainer').html('');
          $(modals.mdl_event_create.el + ' #btn_deleteItemPhoto').addClass('hidden');
        },1);
      });
      $('group.modalContainer').addClass('modalOff');
      $('.app').toggleClass('tilt');
    },
    show : function(){
      $('.app').toggleClass('tilt');
      modals.mdl_event_create.remE().then(modals.mdl_event_create.addE().done(function(){
        modals.mdl_event_create.render();
        $(modals.mdl_event_create.el + ' content').scrollTop(0);
        //TODO
        //Uncomment for Event photo functions
        //$(modals.mdl_event_create.el + ' #item_create_photoContainer').html('');
        //$(modals.mdl_event_create.el + ' #btn_deleteItemPhoto').addClass("hidden");
      }));
    },
    addE : function() {
      return $.Deferred(function(a){
        $(modals.mdl_event_create.el + ' #frm_event_create').on('submit',function(e){
          if (user.tx.event == false) {
            modals.mdl_event_create.setData();
          }
          e.preventDefault();
        });
        $(modals.mdl_event_create.el + ' #btn_cancel').hammer().on('tap',function(e){
          modals.mdl_event_create.hide();
          e.preventDefault();
        });
        $(modals.mdl_event_create.el + ' #btn_save').hammer().on('tap',function(e){
          if (user.tx.event == false) {
            modals.mdl_event_create.setData();
          }
          e.preventDefault();
        });
        $(modals.mdl_event_create.el + ' #txt_upc').on('blur',function(e){
          var upc = $(modals.mdl_event_create.el + ' #txt_upc').val();
          if(upc != "" || upc != null){
            try {
              util.getDataUPC(upc,function(d){
                $(modals.mdl_event_create.el + ' #lbl_barcodeStatus').html('...item found!');
                //if an image is available, pre-load the image
                if( d.images.length >= 1 ){
                  util.convertImgToBase64(d.images[0],function(base64string){
                    var v = {
                      uri : base64string
                    };
                    var tpl = _.template( $('#tpl_item_create_photo').html() );
                    $(modals.mdl_event_create.el + ' #item_create_photoContainer').html(tpl(v));
                    $(modals.mdl_event_create.el + ' #btn_deleteItemPhoto').removeClass("hidden");
                  });
                }
                //populate the item name
                $(modals.mdl_event_create.el + ' #txt_name').val(d.name);
              },function(e){
                var obj = $(modals.mdl_event_create.el + ' #lbl_barcodeStatus');
                var objMsg = obj.html();
                obj.html('...item info not found. :(');
                setTimeout(function(){
                  obj.html(objMsg);
                },3000);
              });
            } catch (e) {
              app.l(JSON.stringify(e),2);
            }
          }
        });
        $(modals.mdl_event_create.el + ' #btn_scanBarcode').hammer().on('tap',function(e){
          var lblO = $(modals.mdl_event_create.el + ' #frm_item_create #lbl_barcodeStatus');
          var tmpLbl = lblO.html();
          lblO.html( $('#tpl_loading').html() );
          //scan that code!
          cordova.plugins.barcodeScanner.scan(
            function (result) {
              if(result.cancelled == 0){
                lblO.html('...successful scan...');
                $('#frm_item_create #txt_upc').val(result.text);
                var upc = result.text;
                if(upc != "" || upc != null){
                  util.getDataUPC(upc,function(d){
                    //if an image is available, pre-load the image
                    if( d.images.length >= 1 ){
                      util.convertImgToBase64(d.images[0],function(base64string){
                        var v = {
                          uri : base64string
                        };
                        var tpl = _.template( $('#tpl_item_create_photo').html() );
                        $(modals.mdl_event_create.el + ' #item_create_photoContainer').html(tpl(v));
                        $(modals.mdl_event_create.el + ' #btn_deleteItemPhoto').removeClass("hidden");
                      });
                    }
                    //populate the item name
                    $(modals.mdl_event_create.el + ' #txt_name').val(d.name);

                  },function(e){
                    app.l(JSON.stringify(e),2);
                  });
                }
              } else {
                lblO.html(tmpLbl);
              }
            },
            function (error) {
              lblO.html(tmpLbl);
              app.e("Oops! Scan seems to have failed, but don't worry - we'll fix it. Eventiually.");
              app.l(JSON.stringify(error),2);
            }
          );
          e.preventDefault();
        });
        $(modals.mdl_event_create.el + ' #btn_takeItemPhoto').hammer().on('tap',function(e){
          util.photo.takeNew().done(function(base64string){
            var v = {
              uri : "data:image/png;base64," + imgData
            };
            var tpl = _.template( $('#tpl_item_create_photo').html() );
            $(modals.mdl_event_create.el + ' #item_create_photoContainer').html(tpl(v));
            $(modals.mdl_event_create.el + ' #btn_deleteItemPhoto').removeClass('hidden');
          }).fail(function(e){
            app.e("Umm... This is embarassing. I can't access your camera...  I don't know why.  Do you?");
            app.l(JSON.stringify(e),2);
          });
          e.preventDefault();
        });
        $(modals.mdl_event_create.el + ' #btn_selectItemPhoto').hammer().on('tap',function(e){
          util.photo.fromLibrary().done(function(base64string){
            var v = {
              uri : "data:image/png;base64," + imgData
            };
            var tpl = _.template( $('#tpl_item_create_photo').html() );
            $(modals.mdl_event_create.el + ' #item_create_photoContainer').html(tpl(v));
            $(modals.mdl_event_create.el + ' #btn_deleteItemPhoto').removeClass('hidden');
          }).fail(function(e){
            app.e("Umm... This is embarassing. I can't open the gallery.  I don't know why.  Do you?");
            app.l(JSON.stringify(e),2);
          });
          e.preventDefault();
        });
        $(modals.mdl_event_create.el + ' #btn_deleteItemPhoto').hammer().on('tap',function(e){
          $(modals.mdl_event_create.el + ' #item_create_photoContainer').html('');
          $(modals.mdl_event_create.el + ' #btn_deleteItemPhoto').addClass('hidden');
          e.preventDefault();
        });
        a.resolve();
      }).promise();
    },
    remE : function() {
      return $.Deferred(function(r){
        $(modals.mdl_event_create.el + ' #frm_item_create').off('submit');
        $(modals.mdl_event_create.el + ' #btn_cancel').hammer().off('tap');
        $(modals.mdl_event_create.el + ' #btn_save').hammer().off('tap');
        $(modals.mdl_event_create.el + ' #txt_upc').off('blur');
        $(modals.mdl_event_create.el + ' #btn_scanBarcode').hammer().off('tap');
        $(modals.mdl_event_create.el + ' #btn_takeItemPhoto').hammer().off('tap');
        $(modals.mdl_event_create.el + ' #btn_selectItemPhoto').hammer().off('tap');
        $(modals.mdl_event_create.el + ' #btn_deleteItemPhoto').hammer().off('tap');
        r.resolve();
      }).promise();
    },
    render : function(){
      //set the time of the event to be now
        var currentDate = new Date();
        // Find the current time zone's offset in milliseconds.
        var timezoneOffset = currentDate.getTimezoneOffset() * 60 * 1000;
        // Subtract the time zone offset from the current UTC date, and pass
        //  that into the Date constructor to get a date whose UTC date/time is
        //  adjusted by timezoneOffset for display purposes.
        var localDate = new Date(currentDate.getTime() - timezoneOffset);
        // Get that local date's ISO date string and remove the Z.
        var localDateISOString = localDate.toISOString().replace('Z', '');
        // Finally, set the input's value to that timezone-less string.
        $(modals.mdl_event_create.el + ' #txt_date').val(localDateISOString);
      //unhide the appropriate modal
      $(modals.mdl_event_create.el).removeClass('hidden');
      //animate modal container
      $('group.modalContainer').removeClass('modalOff');
    },
    setData : function(){
      user.tx.event = true;
      ActivityIndicator.show("Saving");
      var eAt = moment($(modals.mdl_event_create.el + ' #txt_date').val()).local().valueOf();
      var Event = Parse.Object.extend("Event");
      var newEvent = new Event();
      newEvent.set('createdBy',Parse.User.current());
      newEvent.set('title',$(modals.mdl_event_create.el+" #txt_title").val());
      newEvent.set('description',$(modals.mdl_event_create.el+" #txt_description").val());
      newEvent.set('eventAt',new Date(eAt));
      newEvent.set('spendLimit',parseInt($(modals.mdl_event_create.el+" #txt_limit").val()));
      newEvent.set('isLocked',false);
      newEvent.save(null,{
        success : function(newEvent){
          user.tx.event = false;
          ActivityIndicator.hide();
          user.getEvents(true).done(function(){
            pages.events.render();
            modals.mdl_event_create.hide();
          });
        },
        error : function(newEvent,error){
          user.tx.event = false;
          ActivityIndicator.hide();
          app.e("Couldn't save the event!  We'll look into it ASAP!");
          app.l(JSON.stringify(error,null,2),2);
        }
      });
    }
  }
};

var pages = {
  login : {
    init : function(){
      pages.login.remE();
      pages.login.addE();
    },
    addE : function(){
      $('#frm_Login').on('submit', function(e){
        pages.login.doLogin();
        e.preventDefault();
      });
      $('#btn_signup').hammer().on('tap', function(e){
        //tapped the signup button
        app.showScreen($('section#signup'),true);
        e.preventDefault();
      });
    },
    remE : function(){
      $('#frm_Login').off('submit');
      $('#btn_signup').hammer().off('tap');
    },
    doLogin : function(){
      $('#lbl_loginError').removeClass('bad');
      $('#lbl_loginError').removeClass('good');
      $('#lbl_loginError').html('working...');
      $('#lbl_loginError').removeClass('clear');
      //place the Login code here
      Parse.User.logIn($('#frm_Login #txt_username').val(), $('#frm_Login #txt_password').val(), {
        success: function(u) {
          $('#lbl_loginError').addClass('good');
          $('#lbl_loginError').html('success!');

          // Do stuff after successful login.

          $('input').blur();
          setTimeout(function(){
            $('#lbl_loginError').addClass('clear');
          },5000);

          //do the user sign-in
          app.signin();
        },
        error: function(u, error) {
          $('#lbl_loginError').addClass('bad');
          // The login failed. Check error to see why.
          if(error.code == 101){
            $('#lbl_loginError').html('bad email or password!');
            setTimeout(function(){
              $('#lbl_loginError').addClass('clear');
            },5000);
          }
          console.error(error);
        }
      });
    }
  },
  signup : {
    init : function(){
      pages.signup.remE();
      pages.signup.addE();
    },
    addE : function(){
      $('#frm_signup').on('submit', function(e){
        pages.signup.doSignUp();
        e.preventDefault();
      });
      $('#frm_signup #txt_username').on('focus',function(){
        if ($(this).val() == "" || $(this).val() == null){
          $(this).val(util.generateElfName());
          $(this).select();
        }
      });
      $('#frm_signup #txt_passwordConfirm').on('keyup',function(){
        if($(this).val() == $('#frm_signup #txt_password').val()){
          $(this).removeClass('bad');
          $(this).addClass('good');
        } else {
          $(this).removeClass('good');
          $(this).addClass('bad');
        }

        //if there are no "bad" fields, enable the submit
        if($('#frm_signup .bad').length == 0){
          $('#frm_signup #btn_submit-signup').prop('disabled',false);
        } else {
          $('#frm_signup #btn_submit-signup').prop('disabled',true);
        }
      });
      $('#frm_signup #btn_cancel').hammer().on('tap',function(){
        app.showScreen($('section#login'));
      });
    },
    remE : function(){
      $('form#frm_signup').off('submit');
      $('#frm_signup #txt_username').off('focus');
      $('#frm_signup #txt_username').hammer().off('tap');
      $('#frm_signup #txt_passwordConfirm').off('keyup');
      $('section#signup #btn_cancel').hammer().off('tap');
    },
    doSignUp : function(){
      user.parse = new Parse.User();
      user.parse.set("username", $('#frm_signup #txt_email').val());
      user.parse.set("elfName", $('#frm_signup #txt_elfName').val());
      user.parse.set("password", $('#frm_signup #txt_password').val());
      user.parse.set("email", $('#frm_signup #txt_email').val());

      // other fields can be set just like with Parse.Object
      user.parse.set("firstName", $('#frm_signup #txt_firstName').val());
      user.parse.set("lastName", $('#frm_signup #txt_lastName').val());
      user.parse.set("displayName", $('#frm_signup #txt_firstName').val()+" "+$('#frm_signup #txt_lastName').val().substr(0,1)+".");

      user.parse.signUp(null, {
        success: function(user) {
          // Hooray! Let them use the app now.
          app.signin();
        },
        error: function(user, error) {
          // Show the error message somewhere and let the user try again.
          $('#lbl_signupError').html(error.message);
          $('#lbl_signupError').removeClass('clear');
          app.l(JSON.stringify(error,null,2),2);
          setTimeout(function(){
            $('#lbl_signupError').addClass('clear');
          },5000);
        }
      });
    }
  },
  start : {
    init : function(forceDataUpdate){
      pages.start.getData(forceDataUpdate).done(function(santaListArray){
        pages.start.render(santaListArray);
      });
      pages.events.getData().done(function(){
        pages.events.render();
      });
    },
    addE : function(){
      return $.Deferred(function(a){
        app.addE();
        $('#start.screen #santaList li.recipient').on('click',function(e){
          var ID = $(this).data('id');
          $(this).addClass('loading');
          var ParseSanta = _.find(user.santaList, function(obj) {
              return obj.get('recipient').id == ID; 
          });
          user.currentRecipient = ParseSanta.get('recipient');
          pages.personWishList.init(user.currentRecipient);
        });
        a.resolve();
      }).promise();
    },
    remE : function(){
      return $.Deferred(function(r){
        app.remE();
        $('#start.screen #santaList li').off('click');
        r.resolve();
      }).promise();
    },
    render: function(santaListArray){
      return $.Deferred(function(render){
        if(santaListArray.length > 0){
          $('#start.screen #santaList').html("");
          _.each(santaListArray,function(o,i,a){
            var obj = {
              id : o.id,
              isDoneShopping : o.get('isDoneShopping'),
              isDoneWrapping : o.get('isDoneWrapping'),
              recipient : o.get('recipient'),
              event : o.get('event')
            };
            var template = _.template( $('#tpl_start_listItem').html() );
            $('.screen#start #santaList').append(template(obj));
          });
        } else {
          var emptyTpl = _.template( $('#tpl_start_listItem_empty').html() );
          $('.screen#start #santaList').html( emptyTpl({}) );
        }
        //app.remE().done(app.addE);
        pages.start.remE().done(pages.start.addE);
        render.resolve();
      }).promise();
    },
    getData : function(forceDataUpdate){
      //show the loading indicator on the Santa Shopping List
      //$('#start.screen #santaList').html('');
      //var loaderTpl = _.template( $('#tpl_loading').html() );
      //$('#start.screen #santaList').append( loaderTpl({textToShow:"Santa's Shopping List"}) );
      app.l('Getting santa list items...');
      return $.Deferred(function(getData){
        user.getSantas(forceDataUpdate).done(function(santaList){
          getData.resolve(santaList);
        }).fail(function(error){
          getData.reject(error);
        });
      }).promise();
    }
  },
  wishList : {
    init : function(forceDataUpdate){
      pages.wishList.getData(forceDataUpdate).done(function(){
        pages.wishList.render().done(function(){
          pages.wishList.remE().done(pages.wishList.addE);
        });
      });
    },
    addE : function(){
      app.addE();
      return $.Deferred(function(a){
        $('nav#top #btn_addItem').hammer().on('tap',function(){
          modals.mdl_item_create.show();
        });
        $('#wishList.screen ul#wishList li.item hitbox').hammer().on('tap', function(){
          //DEBUG
          console.log('wishList TAPPED ITEM');
          var iID = $(this).data('id');
          $('#wishList.screen ul#wishList li#'+$(this).data('id')+'.item').addClass('loading');
          var ParseItem = _.find(user.wishList, function(obj) {
              return obj.id == iID; 
          });
          user.currentItem = ParseItem;
          //DEBUG
          console.log(ParseItem);
          pages.itemDetail.init(ParseItem);
        });
        a.resolve();
      }).promise();
    },
    remE : function(){
      app.remE();
      return $.Deferred(function(r){
        $('nav#top #btn_addItem').hammer().off('tap');
        $('#wishList.screen ul#wishList li.item').hammer().off('tap');
        r.resolve();
      }).promise();
    },
    render : function(){
      return $.Deferred(function(render){
        $('#wishList.screen #wishList').html('');
        if(user.wishList.length > 0){
          _.each(user.wishList,function(o,i,a){
            var t = _.template($('#tpl_wishList_listItem').html());
            var d = {
              id : o.id,
              oid : Parse.User.current().id,
              isOwner : true,
              name : o.get('name'),
              description : o.get('description'),
              price : typeof o.get('estPrice') == "undefined" || o.get('estPrice') == null ? null : o.get('estPrice'),
              where : typeof o.get('lastSeenAt') == "undefined" || o.get('lastSeenAt') == "" ? null : o.get('lastSeenAt'),
              purchased : false,
              photoURL : typeof o.get('photo') != "undefined" ? o.get('photo').url() : ''
            };
            $('#wishList.screen #wishList').append(t(d));
          });
        } else {
          var t = _.template($('#tpl_wishList_listItem_empty').html());
          $('#wishList.screen #wishList').html(t({}));
        }
        render.resolve()
      }).promise();
    },
    getData : function(forceDataUpdate){
      app.l('Getting wish list items...');
      //show the loading indicator on the wishList
      $('#wishList.screen #wishList').html('');
      var loaderTpl = _.template( $('#tpl_loading').html() );
      $('#wishList.screen #wishList').append(loaderTpl({}));
      //perfom data GET
      return $.Deferred(function(getData){
        user.getWishList(forceDataUpdate).done(function(wishListArray){
          getData.resolve(wishListArray);
        });
      }).promise();
    }
  },
  events : {
    init : function(forceDataUpdate){
      pages.events.getData(forceDataUpdate).done(function(){
        pages.events.render();
      });
    },
    addE : function(){
      return $.Deferred(function(a){
        app.addE();
        $('nav#top #btn_addEvent').hammer().on('tap',function(){
          modals.mdl_event_create.show();
        });
        $('#events.screen tab-group tab').hammer().on('tap',function(){
          $('#events.screen tab-group tab').removeClass('active');
          $(this).addClass('active');
          pages.events.tabCheck();
        });
        $('#events.screen #eventList li').hammer().on('tap',function(){
          var eID = $(this).data('id');
          user.currentAttendanceID = $(this).data('aid');
          $(this).addClass('loading');
          var ParseAttendance = _.find(user.eventList, function(obj) {
              return obj.get('event').id == eID; 
          });
          pages.eventDetail.init(ParseAttendance.get('event'));
        });
        $('#events.screen #invitationList li').hammer().on('tap',function(){
          var eID = $(this).data('id');
          user.currentAttendanceID = $(this).data('aid');
          $(this).addClass('loading');
          var ParseAttendance = _.find(user.eventList, function(obj) {
              return obj.get('event').id == eID; 
          });
          pages.eventDetail.init(ParseAttendance.get('event'));
        });
        a.resolve();
      }).promise();
    },
    remE : function(){
      return $.Deferred(function(r){
        app.remE();
        $('nav#top #btn_addEvent').hammer().off('tap');
        $('#events.screen tab-group tab').hammer().off('tap');
        $('#events.screen #eventList li').hammer().off('tap');
        $('#events.screen #invitationList li').hammer().off('tap');
        r.resolve();
      }).promise();
    },
    tabCheck : function(tabToForceID){
      if (typeof tabToForceID != "undefined") {
        $('#events.screen tab-group tab').removeClass('active');
        $('#events.screen tab-group tab[data-for="'+tabToForceID+'"]').addClass('active');
      }
      $('#events.screen .tab-target').addClass('hidden');
      $('#events.screen tab-group tab').each(function(i,o){
        if($(this).hasClass('active')){
          $('#events.screen #'+$(this).data('for')+'.tab-target').removeClass('hidden');
        }
      });
    },
    render: function(){
      pages.events.tabCheck();
      var eventTpl = _.template( $('#tpl_events_listItem').html() );
      var eventEmptyTpl = _.template( $('#tpl_events_listItem_empty').html() );
      var invitationTpl = _.template( $('#tpl_invitation_listItem').html() );
      var invitationEmptyTpl = _.template( $('#tpl_invitation_listItem_empty').html() );
      $('#events.screen #eventList').html("");
      $('#events.screen #invitationList').html("");
      _.each(user.eventList, function(o,i,a){
        var object = {
          aid: o.id,
          id: o.get('event').id,
          date: o.get('event').get('eventAt'),
          title: o.get('event').get('title'),
          description: o.get('event').get('description'),
          spendLimit: o.get('event').get('spendLimit')
        };
        if (o.get('status') == 1 || o.get('status') == 2){
          $('#events.screen #eventList').append(eventTpl(object));
        } else if(o.get('status') == 99){
          $('#events.screen #invitationList').append(invitationTpl(object));
        }
      });
      if ($('#events.screen #eventList li.event').length == 0){
        $('#events.screen #eventList').html(eventEmptyTpl({}));
      }
      if ($('#events.screen #invitationList li.invitation').length == 0){
        $('#events.screen tab[data-for="invitationList"] badge').html('');
        $('#events.screen tab[data-for="invitationList"] badge').addClass('hidden');
        $('#events.screen #invitationList').html(invitationEmptyTpl({}));
        app.updateBadge($('nav.tabBar div.item.events'),$('#events.screen #invitationList li.invitation').length);
      } else {
        $('#events.screen tab[data-for="invitationList"] badge').html($('#events.screen #invitationList li.invitation').length);
        $('#events.screen tab[data-for="invitationList"] badge').removeClass('hidden');
        app.updateBadge($('nav.tabBar div.item.events'),$('#events.screen #invitationList li.invitation').length);
      }
      pages.events.remE().done(pages.events.addE);
    },
    getData: function(forceDataUpdate){
      return $.Deferred(function(gd){
        user.getEvents(forceDataUpdate).done(function(){
          gd.resolve();
        }).fail(function(error){
          gd.reject(error);
        });
      }).promise();
    }
  },
  eventDetail : {
    init : function(ParseEventObjectToLoad){
      var loadTime = new Date();
      //this function assumes you are passing the actual event object to render/query.
      //NOT simply the ID
      //set the attendance ID for the RSVP button to work
      $('#eventDetail.screen #frm_rsvp #txt_aid').val(user.currentAttendanceID);
      if(typeof ParseEventObjectToLoad != "undefined"){
        user.currentEvent = ParseEventObjectToLoad;
        pages.eventDetail.getAttendanceForEvent(ParseEventObjectToLoad).done(function(attendanceArray){
          var doneTime = new Date();
          var interval = (1000 - (doneTime-loadTime));
          //add attendance to event object
          ParseEventObjectToLoad.attendance = attendanceArray;
          setTimeout(function(){
            $('#event.screen li').removeClass('loading');
            pages.eventDetail.tabCheck();
            pages.eventDetail.renderAttendance(attendanceArray);
            pages.eventDetail.render(ParseEventObjectToLoad);
          },interval < 0 ? 0 : interval);
        });
      }
    },
    addE : function(eventObject){
      return $.Deferred(function(a){
        app.addE();
        $('nav#top #btn_back_eventDetail').hammer().on('tap', function(){
          var dirty = util.formIsDirty($('#eventDetail.screen form#eventDetail'));
          if (dirty) {
            navigator.notification.confirm(
              "You've made some changes, it seems.",//message
              function(buttonIndex){
                //buttonIndex is 1-based
                //alert was dismissed
                switch(buttonIndex){
                  case 1:
                    pages.eventDetail.updateEvent(eventObject).done(function(){
                      pages.events.render();
                      app.showScreen($('#events.screen'));
                    });
                    break;
                  case 2:
                    pages.events.render();
                    app.showScreen($('#events.screen'));
                    break;
                  default:
                }
              },//callback
              "Save changes?",//[title]
              ["Yes please!","No thanks."]//[buttonNames]
            );
          } else {
            pages.events.render();
            app.showScreen($('#events.screen'));
          }
          //app.showScreen($('#events.screen'));
        });
        $('#eventDetail.screen form#sendInvitation').on('submit', function(e){
          var email = $('#eventDetail.screen form#sendInvitation #txt_email').val();
          var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
          if (re.test(email) && user.tx.attendance == false){
            user.tx.attendance = true;
            var Attendance = Parse .Object.extend("Attendance");
            var attend = new Attendance();
            attend.set('email', email);
            attend.set('event', user.currentEvent);
            attend.set('status', 99); //0 = not going, 1 = going, 2 = organiser, 99 = not set
            attend.save(null,{
              success: function(attendanceObject){
                user.tx.attendance = false;
                app.l('Created Attendance Object');
                app.n("Sent!", "Your invitation is zooming through the Interwebs!", function(){
                  $('#eventDetail.screen form#sendInvitation')[0].reset();
                  pages.eventDetail.getAttendanceForEvent(user.currentEvent).done(function(attendanceArray){
                    pages.eventDetail.renderAttendance(attendanceArray);
                  });
                });
              },
              error: function(error){
                user.tx.attendance = false;
                app.e('Couldn\'t send the invitation! We\'re looking into it though!');
                app.l(JSON.stringify(error),2);
              }
            });
          }
          e.preventDefault();
        });
        $('#eventDetail.screen form#eventDetail').on('submit', function(e){
          $(this).data('dirty', util.formIsDirty($(this)));
          e.preventDefault();
        });
        $('#eventDetail.screen form#eventDetail input, #eventDetail.screen form#eventDetail textarea').on('propertychange change click keyup input paste', function(){
          if($(this).data('original') != $(this).val()){
            $(this).data('dirty', true);
          }
        });
        $('#eventDetail.screen tab-group tab').hammer().on('tap',function(){
          $('#eventDetail.screen tab-group tab').removeClass('active');
          $(this).addClass('active');
          $('input, textarea').blur();
          pages.eventDetail.tabCheck();
        });
        $('#eventDetail.screen ul li.attendee').hammer().on('tap', function(){
          if ($(this).data('status') != 2 && user.currentEvent.get('createdBy').id == Parse.User.current().id) {
            user.currentAttendanceID = $(this).data('aid');
            as.as_eventDetail_invitation.show();
          }
        });
        $('#eventDetail.screen #frm_rsvp').on('submit', function(e){
          user.currentAttendanceID = $('#eventDetail.screen #frm_rsvp #txt_aid').val();
          navigator.notification.confirm(
            "Are you goin', or are you a party pooper? LOL",//message
            function(buttonIndex){
              //buttonIndex is 1-based
              //alert was dismissed
              switch(buttonIndex){
                case 1:
                  var Attendance = Parse.Object.extend("Attendance");
                  var attendanceQuery = new Parse.Query(Attendance);
                  attendanceQuery.get(user.currentAttendanceID, {
                    success: function(attendanceObject) {
                      attendanceObject.set('status', 1);
                      attendanceObject.save({
                        success: function(myObject) {
                          pages.eventDetail.getAttendanceForEvent(user.currentEvent).done(function(attendanceArray){
                            //update the attendance list
                            pages.eventDetail.renderAttendance(attendanceArray);
                            pages.events.tabCheck("eventList");
                            app.showScreen($('#events.screen'),false,true);
                          });
                        },
                        error: function(error) {
                          app.e("Oh no! I couldn't accept the invitation! Try again in a few minutes.");
                          app.l(JSON.stringify(error),2);
                        }
                      });
                    },
                    error: function(error) {
                      app.e("Oh no! I couldn't find that invitation to accept it! Try again in a few minutes.");
                      app.l(JSON.stringify(error),2);
                    }
                  });
                  break;
                case 2:
                  var Attendance = Parse.Object.extend("Attendance");
                  var attendanceQuery = new Parse.Query(Attendance);
                  attendanceQuery.get(user.currentAttendanceID, {
                    success: function(attendanceObject) {
                      attendanceObject.set('status', 0);
                      attendanceObject.save({
                        success: function(myObject) {
                          pages.eventDetail.getAttendanceForEvent(user.currentEvent).done(function(attendanceArray){
                            //update the attendance list
                            pages.eventDetail.renderAttendance(attendanceArray);
                            pages.events.tabCheck("invitationList");
                            app.showScreen($('#events.screen'),false,true);
                          });
                        },
                        error: function(error) {
                          app.e("Oh no! I couldn't decline the invitation! Try again in a few minutes.");
                          app.l(JSON.stringify(error),2);
                        }
                      });
                    },
                    error: function(error) {
                      app.e("Oh no! I couldn't find that invitation to decline it! Try again in a few minutes.");
                      app.l(JSON.stringify(error),2);
                    }
                  });
                  break;
                default:
              }
            },//callback
            'RSVP',//[title]
            ["You bet, I'm going!","Not going (boooo)"]//[buttonNames]
          );
          e.preventDefault();
        });
        $('#eventDetail.screen #frm_admin').on('submit', function(e){
          e.preventDefault();
        });
        $('#eventDetail.screen #frm_admin #btn_event_delete').hammer().on('tap', function(e){
          navigator.notification.confirm(
            "Are you sure you want to delete this event?",//message
            function(buttonIndex){
              //buttonIndex is 1-based
              //alert was dismissed
              switch(buttonIndex){
                case 1:
                  pages.eventDetail.destroyEvent(user.currentEvent).done(function(){
                    app.showScreen($('#events.screen'), false, true);
                  });
                  break;
                case 2:
                  break;
                default:
              }
            },//callback
            "Confirm delete!",//[title]
            ["Yes please!","No thanks."]//[buttonNames]
          );
          e.preventDefault();
        });
        $('#eventDetail.screen #frm_admin #btn_event_close').hammer().on('tap', function(e){
          pages.eventDetail.closeEvent(user.currentEvent).done(function(eventRespObject){
            app.showScreen($('#start.screen'),false,true);
          });
          e.preventDefault();
        });
        $('#eventDetail.screen #frm_admin #btn_event_open').hammer().on('tap', function(e){
          pages.eventDetail.openEvent(user.currentEvent).done(function(eventRespObject){
            var tempEventList = _.without(user.eventList, user.currentEvent);
            tempEventList.push(eventRespObject);
            user.eventList = tempEventList;
            user.eventListUpdatedAt = new Date();
            app.showScreen($('#events.screen'),false,true);
          });
          e.preventDefault();
        });
        a.resolve();
      }).promise();
    },
    remE : function(){
      return $.Deferred(function(r){
        app.remE();
        $('nav#top #btn_back_eventDetail').hammer().off('tap');
        $('#eventDetail.screen form#sendInvitation').off('submit');
        $('#eventDetail.screen form#eventDetail').off('submit');
        $('#eventDetail.screen form#eventDetail input, #eventDetail.screen form#eventDetail textarea').off('propertychange change click keyup input paste');
        $('#eventDetail.screen tab-group tab').hammer().off('tap');
        $('#eventDetail.screen ul li.attendee').hammer().off('tap');
        $('#eventDetail.screen #frm_rsvp').off('submit');
        $('#eventDetail.screen #frm_admin').off('submit');
        $('#eventDetail.screen #frm_admin button').hammer().off('tap');
        r.resolve();
      }).promise();
    },
    tabCheck : function(){
      $('#eventDetail.screen .tab-target').addClass('hidden');
      $('#eventDetail.screen tab-group tab').each(function(i,o){
        if($(this).hasClass('active')){
          $('#eventDetail.screen #'+$(this).data('for')+'.tab-target').removeClass('hidden');
        }
      });
    },
    render : function(retrievedParseEventData){
      //check if current user is event admin
      var isAdmin = false;
      var eventAdmins = [];
      _.each(retrievedParseEventData.attendance,function(o,i,a){
        if(o.get('status') == 2){
          eventAdmins.push(o);
        }
        if (o.get('status') == 2 && o.get('attendee').id == Parse.User.current().id){
          isAdmin = true;
        }
      });
      var obj = {
        id : retrievedParseEventData.id,
        title : retrievedParseEventData.get('title'),
        date : retrievedParseEventData.get('eventAt'),
        dateString : util.formatDateForDTL(retrievedParseEventData.get('eventAt')),
        spendLimit : retrievedParseEventData.get('spendLimit'),
        description : retrievedParseEventData.get('description'),
        locked : retrievedParseEventData.get('isLocked'),
        isEventAdmin : isAdmin
      };
      //load detail template
      var edFormTpl = _.template( $('#tpl_eventDetail').html() );
      $('#eventDetail.screen #detail.tab-target').html( edFormTpl(obj) );
      if (isAdmin) {
        $('#eventDetail.screen #frm_rsvp').addClass('hidden');
        $('#eventDetail.screen #frm_admin').removeClass('hidden');
        if (retrievedParseEventData.get('isLocked') == false) {
          $('#eventDetail.screen #attendance form#sendInvitation').removeClass('hidden');
        } else {
          $('#eventDetail.screen #attendance form#sendInvitation').addClass('hidden');
        }
        
      } else {
        $('#eventDetail.screen #frm_rsvp').removeClass('hidden');
        $('#eventDetail.screen #frm_admin').addClass('hidden');
        $('#eventDetail.screen #attendance form#sendInvitation').addClass('hidden');
      }
      if(obj.locked){
        $('#eventDetail.screen #frm_admin #btn_event_close').addClass('hidden');
        $('#eventDetail.screen #frm_admin #btn_event_open').removeClass('hidden');
      } else {
        $('#eventDetail.screen #frm_admin #btn_event_close').removeClass('hidden');
        $('#eventDetail.screen #frm_admin #btn_event_open').addClass('hidden');
      }
      pages.eventDetail.remE().done(function(){
        pages.eventDetail.addE(user.currentEvent).done(function(){
          app.showScreen($('#eventDetail.screen'));
        });
      });
    },
    getAttendanceForEvent : function(ParseEvent){
      app.l('Retreiving Attendance for eventID: '+ParseEvent.id);
      return $.Deferred(function(getAttendanceForEvent){
        var Attendance = Parse.Object.extend("Attendance");
        var attendanceQuery = new Parse.Query(Attendance);
        attendanceQuery.equalTo('event', ParseEvent);
        attendanceQuery.include('attendee');
        attendanceQuery.find({
          success: function(attendanceArray){
            getAttendanceForEvent.resolve(attendanceArray);
          },
          error: function(e){
            app.e("Wat?! I can't find anyone for that event.  But I'll keep looking, and you can try again in a bit, ok? Ok.");
            app.l(JSON.stringify(e),2);
            getAttendanceForEvent.reject(e);
          }
        });
      }).promise();
    },
    renderAttendance : function(attendanceArray){
      var attendeeTpl = _.template( $('#tpl_eventDetail_attendanceItem').html() );
      var attendeeEmptyTpl = _.template( $('#tpl_eventDetail_attendanceItem_empty').html() );
      $('#eventDetail.screen ul#attendanceGoing').html(attendeeEmptyTpl({}));
      $('#eventDetail.screen ul#attendanceNotGoing').html(attendeeEmptyTpl({}));
      $('#eventDetail.screen ul#attendanceUnknown').html(attendeeEmptyTpl({}));
      var aGoing = [];
      var aNotGoing = [];
      var aUnknown = [];
      $('#eventDetail.screen .attendanceGoing.count').html(aGoing.length);
      $('#eventDetail.screen .attendanceNotGoing.count').html(aNotGoing.length);
      $('#eventDetail.screen .attendanceUnknown.count').html(aUnknown.length);
      _.each(attendanceArray, function(o,i,a){
        if (o.get('status') == 1 || o.get('status') == 2){
          aGoing.push(o);
        } else if(o.get('status') == 0) {
          aNotGoing.push(o);
        } else {
          aUnknown.push(o);
        }
      });
      if(aGoing.length > 0){
        $('#eventDetail.screen ul#attendanceGoing').html("");
        $('#eventDetail.screen .attendanceGoing.count').html(aGoing.length);
        _.each(aGoing, function(o,i,a){
          var obj = {
            aid : o.id,
            id : "0",
            isOwner : o.get('status') == 2 ? true : false,
            name : null,
            status : o.get('status'),
            email : o.get('email')
          };
          if (typeof o.get('attendee') != "undefined"){
            obj.id = o.get('attendee').id;
            obj.name = o.get('attendee').get('displayName');
            obj.email = o.get('attendee').get('email');
          }
          $('#eventDetail.screen ul#attendanceGoing').append(attendeeTpl(obj));
        });
      }
      if(aNotGoing.length > 0){
        $('#eventDetail.screen ul#attendanceNotGoing').html("");
        $('#eventDetail.screen .attendanceNotGoing.count').html(aNotGoing.length);
        _.each(aNotGoing, function(o,i,a){
          var obj = {
            aid : o.id,
            id : "0",
            isOwner : o.get('status') == 2 ? true : false,
            name : null,
            email : o.get('email')
          };
          if (typeof o.get('attendee') != "undefined"){
            obj.id = o.get('attendee').id;
            obj.name = o.get('attendee').get('displayName');
            obj.email = o.get('attendee').get('email');
          }
          $('#eventDetail.screen ul#attendanceNotGoing').append(attendeeTpl(obj));
        });
      }
      if(aUnknown.length > 0){
        $('#eventDetail.screen ul#attendanceUnknown').html("");
        $('#eventDetail.screen .attendanceUnknown.count').html(aUnknown.length);
        _.each(aUnknown, function(o,i,a){
          var obj = {
            aid : o.id,
            id : "0",
            isOwner : o.get('status') == 2 ? true : false,
            name : null,
            email : o.get('email')
          };
          if (typeof o.get('attendee') != "undefined"){
            obj.id = o.get('attendee').id;
            obj.name = o.get('attendee').get('displayName');
            obj.email = o.get('attendee').get('email');
          }
          $('#eventDetail.screen ul#attendanceUnknown').append(attendeeTpl(obj));
        });
      }
      pages.eventDetail.remE().done(function(){
        pages.eventDetail.addE(user.currentEvent);
      });
    },
    getData : function(ParseEventObjectToLoad){
      app.l('Retreiving data for eventID: '+ParseEventObjectToLoad.id);
      return $.Deferred(function(getData){
        var Event = Parse.Object.extend("Event");
        var eventDetailQuery = new Parse.Query(Event);
        eventDetailQuery.get(ParseEventObjectToLoad.id, {
          success: function(event){
            getData.resolve(event);
          },
          error: function(e){
            app.e("Wat?! I can't find that event.  But I'll keep looking, and you can try again in a bit, ok? Ok.");
            app.l(JSON.stringify(e),2);
            getData.reject(e);
          }
        });
      }).promise();
    },
    updateEvent : function(eventObject){
      return $.Deferred(function(ue){
        eventObject.set('title', $('#eventDetail.screen form#eventDetail #txt_title').val());
        eventObject.set('eventAt', util.DTLToDate($('#eventDetail.screen form#eventDetail #txt_date').val()));
        eventObject.set('spendLimit', parseInt($('#eventDetail.screen form#eventDetail #txt_spendLimit').val()));
        eventObject.set('description', $('#eventDetail.screen form#eventDetail #txt_description').val());
        eventObject.save({
          success: function(){
            ue.resolve();
          },
          error: function(error){
            app.l(JSON.stringify(error),2);
            app.e('Wat!? I couldn\'t save your changes.  I R THA DUM.');
            ue.reject();
          }
        });
      }).promise();
    },
    destroyEvent : function(eventObject){
      return $.Deferred(function(de){
        eventObject.destroy({
          success: function(){
            de.resolve();
          },
          error: function(e){
            app.e("I couldn't delete this event! Please try again in a minute.");
            app.l(JSON.stringify(e),2);
            de.reject(e);
          }
        });
      }).promise();
    },
    closeEvent : function(eventObject){
      return $.Deferred(function(ce){
        Parse.Cloud.run('rollTheDice', {
          ParseEventID : eventObject.id,
          close : true,
          assignSantas : true
        }, {
          success: function(responseEvent){
            ce.resolve(responseEvent);
          },
          error: function(error){
            app.e("I couldn't close this event, and assign everyone a Santa! Please try again in a minute.");
            app.l(JSON.stringify(error),2);
            ce.reject(error);
          }
        });
      }).promise();
    },
    openEvent : function(eventObject){
      return $.Deferred(function(ce){
        Parse.Cloud.run('rollTheDice', {
          ParseEventID : eventObject.id,
          close : false,
          assignSantas : false
        }, {
          success: function(responseEvent){
            ce.resolve(responseEvent);
          },
          error: function(error){
            app.e("I couldn't close this event, and assign everyone a Santa! Please try again in a minute.");
            app.l(JSON.stringify(error),2);
            ce.reject(error);
          }
        });
      }).promise();
    }
  },
  itemDetail : {
    init : function(ParseItem){
      user.currentItem = ParseItem;
      //DEBUG
      console.log('itemDetail INIT');
      console.log(ParseItem);
      var loadTime = new Date();
      //this screen MUST be initialized with a Parse "Item" object
      pages.itemDetail.getData(ParseItem).done(function(){
        var doneTime = new Date();
        var interval = (1000 - (doneTime-loadTime));
        setTimeout(function(){
          $('#wishList.screen li').removeClass('loading');
          pages.itemDetail.render(ParseItem).done(function(){
            pages.itemDetail.remE().done(pages.itemDetail.addE());
          });
        },interval < 0 ? 0 : interval);
      });
    },
    addE : function(){
      return $.Deferred(function(a){
        app.addE();
        $('nav#top #btn_back_itemDetail').hammer().on('tap', function(){
          var dirty = util.formIsDirty($('#itemDetail.screen form#frm_item'));
          if (dirty) {
            navigator.notification.confirm(
              "You've made some changes, it seems.",//message
              function(buttonIndex){
                //buttonIndex is 1-based
                //alert was dismissed
                switch(buttonIndex){
                  case 1:
                    pages.itemDetail.updateItem(user.currentItem).done(function(){
                      //app.showScreen($('#wishList.screen'), false, true);
                      app.back(true);
                    });
                    break;
                  case 2:
                    //app.showScreen($('#wishList.screen'));
                    app.back(false);
                    break;
                  default:
                }
              },//callback
              "Save changes?",//[title]
              ["Yes please!","No thanks."]//[buttonNames]
            );
          } else {
            //app.showScreen($('#wishList.screen'));
            app.back(false);
          }
          //app.showScreen($('#wishList.screen'));
        });
        $('#itemDetail.screen #frm_admin').on('submit', function(e){
          navigator.notification.confirm(
            "Are you sure you want to delete it?  Someone may have bought it for you already!",//message
            function(buttonIndex){
              //buttonIndex is 1-based
              switch(buttonIndex){
                case 1:
                  user.currentItem.destroy({
                    success: function(){
                      app.showScreen($('#wishList.screen'), false, true);
                    },
                    error: function(error){
                      app.e("Aw snap! I couldn't delete it! Try again in a few minutes.");
                      app.l(JSON.stringify(error),2);
                    }
                  });
                  break;
                case 2:
                  break;
                default:
              }
            },//callback
            "Delete it for realz?",//[title]
            ["Yes please!","No thanks."]//[buttonNames]
          );
          e.preventDefault();
        });
        $('#itemDetail.screen #frm_shop #btn_purchase_item').hammer().on('tap',function(e){
          pages.itemDetail.purchaseItem(user.currentItem, true).done(function(updatedItem){
            app.back(true);
          });
          e.preventDefault();
        });
        $('#itemDetail.screen #frm_shop #btn_unpurchase_item').hammer().on('tap',function(e){
          pages.itemDetail.purchaseItem(user.currentItem, false).done(function(updatedItem){
            app.back(true);
          });
          e.preventDefault();
        });
        $('#itemDetail.screen #frm_item').on('submit',function(e){
          pages.itemDetail.updateItem(user.currentItem).done(function(updatedItem){
            app.showScreen($('#wishList.screen'),false,true);
            $('#itemDetail.screen #frm_item')[0].reset();
          });
          e.preventDefault();
        });
        $('#itemDetail.screen #frm_item input').on('propertychange change click keyup input paste', function(){
          if($(this).data('original') != $(this).val()){
            $(this).data('dirty', true);
          }
        });
        a.resolve();
      }).promise();
    },
    remE : function(){
      return $.Deferred(function(r){
        app.remE();
        $('nav#top #btn_back_itemDetail').hammer().off('tap');
        $('#itemDetail.screen #frm_admin').off('submit');
        $('#itemDetail.screen #frm_shop #btn_purchase_item').hammer().off('tap');
        $('#itemDetail.screen #frm_shop #btn_unpurchase_item').hammer().off('tap');
        $('#itemDetail.screen #frm_item').off('submit');
        $('#itemDetail.screen #frm_item input').off('propertychange change click keyup input paste');
        r.resolve();
      }).promise();
    },
    render : function(ParseItem){
      return $.Deferred(function(r){
        $('#personWishList.screen li, #wishList.screen li').removeClass('loading');
        $('#itemDetail.screen #frm_admin #txt_iid').val(ParseItem.id);
        var itemDetailTpl = _.template( $('#tpl_itemDetail').html() );
        //DEBUG
        console.log('itemDetail RENDER');
        console.log(ParseItem);
        var obj = {
          id : ParseItem.id,
          oid : ParseItem.get('owner').id,
          photoURL : typeof ParseItem.get('photo') == "undefined" ? "" : ParseItem.get('photo').url(),
          name : ParseItem.get('name'),
          description : ParseItem.get('description'),
          upc : ParseItem.get('upc'),
          lastSeenAt : ParseItem.get('lastSeenAt'),
          estPrice : ParseItem.get('estPrice'),
          isOwner : ParseItem.get('owner').id == Parse.User.current().id ? true : false,
          purchased : typeof ParseItem.get('purchased') == "undefined" ? false : ParseItem.get('purchased')
        }
        $('#itemDetail.screen content').html(itemDetailTpl(obj));
        //$('#itemDetail.screen form#frm_admin').detach().appendTo('#itemDetail.screen content');
        app.showScreen($('#itemDetail.screen'));
        $('#itemDetail.screen content').scrollTop(0);

        r.resolve();
      }).promise();
    },
    updateItem : function(ParseItem){
      return $.Deferred(function(ui){
        if (user.tx.item == false){
          user.tx.item = true;
          ParseItem.set('name', $('#itemDetail.screen #frm_item #txt_name').val());
          ParseItem.set('description', $('#itemDetail.screen #frm_item #txt_description').val());
          ParseItem.set('upc', parseInt($('#itemDetail.screen #frm_item #txt_upc').val()));
          ParseItem.set('lastSeenAt', $('#itemDetail.screen #frm_item #txt_lastSeenAt').val());
          ParseItem.set('estPrice', parseInt($('#itemDetail.screen #frm_item #txt_estPrice').val()));
          ParseItem.save(null,{
            success: function(itemObject){
              user.tx.item = false;
              ui.resolve(itemObject);
            },
            error: function(error){
              user.tx.item = false;
              app.e('Couldn\'t save the updated item! We\'re looking into it though!');
              app.l(JSON.stringify(error),2);
              ui.reject(error);
            }
          });
        }
      }).promise();
    },
    purchaseItem : function(ParseItem, toggleBoolean){
      return $.Deferred(function(ui){
        if (user.tx.item == false){
          user.tx.item = true;
          ParseItem.set('purchased', toggleBoolean);
          ParseItem.save(null,{
            success: function(itemObject){
              user.tx.item = false;
              ui.resolve(itemObject);
            },
            error: function(error){
              user.tx.item = false;
              app.e('Couldn\'t mark this as purchased, or not! We\'re looking into it though, so try agin in a minute!');
              app.l(JSON.stringify(error),2);
              ui.reject(error);
            }
          });
        }
      }).promise();
    },
    getData : function(ParseItem, forceDataUpdate){
      if(typeof forceDataUpdate == "undefined"){
        forceDataUpdate = false;
      }
      return $.Deferred(function(getData){
        var Item = Parse.Object.extend("Item");
        var itemQuery = new Parse.Query(Item);
        itemQuery.include('owner');
        itemQuery.get(ParseItem.id,{
          success: function(updatedItem){
            getData.resolve(updatedItem);
          },
          error: function(error){
            app.e("Whoops! I couldn't update this item's data.  BUT, I have old date that I can show you.");
            app.l(JSON.stringify(error),2);
            getData.resolve(ParseItem);
          }
        });
      }).promise();
    }
  },
  personWishList : {
    init : function(ParseRecipient){
      if (typeof ParseRecipient == "undefined") {
        ParseRecipient = user.currentRecipient;
      }
      var loadTime = new Date();
      //this function assumes you are passing the actual Santas object to render/query.
      //NOT simply the ID
      $('#personWishList.screen').data('title', ParseRecipient.get('firstName')+"'s Wish List");
      pages.personWishList.getData(ParseRecipient).done(function(wishListArray){
        var doneTime = new Date();
        var interval = (1000 - (doneTime-loadTime));
        setTimeout(function(){
          $('#start.screen li').removeClass('loading');
          ActivityIndicator.hide();
          pages.personWishList.render(wishListArray);
        },interval < 0 ? 0 : interval);
      });
    },
    addE : function(){
      return $.Deferred(function(a){
        app.addE();
        $('nav#top #btn_back_personWishList').hammer().on('tap', function(){
          app.showScreen($('#start.screen'));
        });
        $('#personWishList.screen #wishList li.item hitbox').hammer().on('tap', function(){
          var iID = $(this).data('id');
          $(this).addClass('loading');
          var ParseItem = _.find(user.currentRecipientWishList, function(obj) {
              return obj.id == iID; 
          });
          user.currentItem = ParseItem;
          pages.itemDetail.init(ParseItem);
        });
        $('#personWishList.screen #wishList li.item input[type="checkbox"]').hammer().on('tap',function(e){
          var loadTime = new Date();
          var el = $(this);
          var iID = el.data('id');
          el.addClass('shake');
          var ParseItem = _.find(user.currentRecipientWishList, function(obj) {
              return obj.id == iID; 
          });
          user.currentItem = ParseItem;
          if (this.checked == false) {
            pages.itemDetail.purchaseItem(user.currentItem, true).done(function(updatedItem){
              var doneTime = new Date();
              var interval = (1000 - (doneTime-loadTime));
              setTimeout(function(){
                el.removeClass('shake');
                el.prop('checked', true);
              },interval < 0 ? 0 : interval);
            });
          } else {
            pages.itemDetail.purchaseItem(user.currentItem, false).done(function(updatedItem){
              var doneTime = new Date();
              var interval = (1000 - (doneTime-loadTime));
              setTimeout(function(){
                el.removeClass('shake');
                el.prop('checked', false);
              },interval < 0 ? 0 : interval);
            });
          }
        });
        $('#personWishList.screen #wishList li.item input[type="checkbox"]').on('click',function(e){
          e.preventDefault();
          //e.stopPropagation();
        });
        a.resolve();
      }).promise();
    },
    remE : function(){
      return $.Deferred(function(r){
        app.remE();
        $('nav#top #btn_back_personWishList').hammer().off('tap');
        $('#personWishList.screen #wishList li.item').hammer().off('tap');
        $('#personWishList.screen #wishList li.item input[type="checkbox"]').hammer().off('tap');
        $('#personWishList.screen #wishList li.item input[type="checkbox"]').off('click');
        r.resolve();
      }).promise();
    },
    render : function(wishListArray){
      return $.Deferred(function(r){
        $('#personWishList.screen #wishList').html('');
        _.each(wishListArray, function(o,i,a){
          var t = _.template($('#tpl_wishList_listItem').html());
          var d = {
            id : o.id,
            oid : o.get('owner').id,
            isOwner : false,
            name : o.get('name'),
            description : o.get('description'),
            price : typeof o.get('estPrice') == "undefined" || o.get('estPrice') == null ? null : o.get('estPrice'),
            where : typeof o.get('lastSeenAt') == "undefined" || o.get('lastSeenAt') == "" ? null : o.get('lastSeenAt'),
            purchased : typeof o.get('purchased') == "undefined" ? false : o.get('purchased'),
            photoURL : typeof o.get('photo') != "undefined" ? o.get('photo').url() : ''
          };
          $('#personWishList.screen #wishList').append(t(d));
        });
        pages.personWishList.remE().done(pages.personWishList.addE());
        app.showScreen($('#personWishList.screen'));
        $('#start.screen #santaList li').removeClass('loading');
        r.resolve();
      }).promise();
    },
    getData : function(ParseRecipient){
      return $.Deferred(function(getData){
        var Item = Parse.Object.extend("Item");
        var itemListQuery = new Parse.Query(Item);
        itemListQuery.equalTo('owner', ParseRecipient);
        itemListQuery.descending('rating');
        itemListQuery.find({
          success: function(wishList){
            user.currentRecipientWishList = wishList;
            getData.resolve(wishList);
          },
          error: function(e){
            app.e("Wat?! I can't find that person's Wish List.  But I'll keep looking, and you can try again in a bit, ok? Ok.");
            app.l(JSON.stringify(e),2);
            getData.reject(e);
          }
        });
      }).promise();
    }
  },
  settings : {
    init : function(forceDataUpdate){
      pages.settings.remE();
      pages.settings.addE();
      pages.settings.getData(forceDataUpdate);
    },
    addE : function(){
      $('section#settings #btn_logout').hammer().on('tap',function(e){
        app.exit();
        e.preventDefault();
      });
    },
    remE : function(){
      $('section#settings #btn_logout').hammer().off('tap');
    },
    render : function(){
      //set the title to the user's Display Name
      $('nav#top .right').html( user.parse.get('firstName')+"'s Settings" );
      var av = null;
      if(user.parse.get('avatar')){
        av = user.parse.get('avatar').url();
      }
      var upData = {
        objectId : user.parse.get('objectId'),
        avatar : av,
        firstName : user.parse.get('firstName'),
        lastName : user.parse.get('lastName'),
        elfName : user.parse.get('username')
      };
      var template = _.template( $('#tpl_userProfile').html() );
      $('section#settings #userProfile').html('');
      $('section#settings #userProfile').append(template(upData));
    },
    getData : function(successCallback,failCallack){
      //get remote info
      Parse.User.current().fetch({
        success: function(user) {
          pages.settings.render();
          if(successCallback){
            successCallback();
          }
        },
        error: function(user,error) {
          app.e("Ah nuts!\nWe couldn't get your profile data!\nWe're on it though, try again later. :)");
          app.l( JSON.stringify(error,null,2) ,2);
          if(failCallack){
            failCallack();
          }
        }
      });
    }
  }
};


var app = {
  meta:{
    "currentPersonObjectID" : "",
    lastScreen : $('#start.screen')
  },
  d:{
    //semantics3 not used
    s3:{
      key : 'SEM3B276C4B7FC81D24558D608D8121DF6AA',
      secret : 'YjQ1NTMzNDRmMTNmMzQyNzgyMjhlOWQ1ODVjMThlZGM',
      productURI : 'https://api.semantics3.com/v1/products?q=',
      productTestURI : 'https://api.semantics3.com/test/v1/products?q='
    },
    outpan : {
      key : 'e4df75113dd952806a676e683515c618'
    },
    //session log
    s:[],
    //persistent log
    l:[]
  },
  init: function() {
    localStorage.sessionLog = "";
    if (localStorage.logs){
      app.d.l = JSON.parse(localStorage.logs);
    }

    //init shake detection
    shake = new Shake({
      threshold : 15
    });
    shake.start();
    $(window).on('shake',function(){
      var newElfName = util.generateElfName();
      navigator.notification.confirm(
        "(tee hee)",//message
        function(buttonIndex){
          //buttonIndex is 1-based
          //alert was dismissed
          switch(buttonIndex){
            case 1:
              console.log(newElfName);
              break;
            case 2:
              cordova.plugins.clipboard.copy(newElfName);
              break;
            default:
          }
        },//callback
        newElfName,//[title]
        ["lol, ok cloze","copy"]//[buttonNames]
      );
    });


    app.bindEvents();

    //check if the user's token exists, and is still valid through Parse
    if(Parse.User.current()){
      //load the user data
      app.signin();
    } else {
      //load the login screen
      app.showScreen($('#login.screen'),true);
    }
  },
  exit: function(){
    Parse.User.logOut();
    user.parse = Parse.User.current(); //should now be NULL
    localStorage.setItem('user',JSON.stringify(user));
    location.reload(true);
  },
  signin: function(){
    user.parse = Parse.User.current();
    //persist to localStorage
    localStorage.setItem('user',JSON.stringify(user));
    //load the start screen on signin
    app.showScreen($('#start.screen'),true,false);
  },
  back: function(forceDataUpdate){
    if (typeof forceDataUpdate == "undefined") {
      forceDataUpdate = false;
    }
    switch (app.meta.lastScreen.attr('id')) {
      case 'wishList':
        app.showScreen($('#wishList.screen'),false,forceDataUpdate);
        break;
      case 'personWishList':
        ActivityIndicator.show('Loading');
        //pages.personWishList.render(user.currentRecipientWishList);
        pages.personWishList.init(user.currentRecipient);
        break;
      default:
        console.log(s.attr('id'));
    }
    //app.showScreen(app.meta.lastScreen, false, forceDataUpdate);
  },
  showScreen: function(s, animateBoolean, forceDataUpdate){
    app.meta.lastScreen = $('section.screen:not(.hidden)');
    if (typeof forceDataUpdate == "undefined") {
      forceDataUpdate = false;
    }
    if(animateBoolean){
      //animate crap
      $('section.screen:not(.hidden)').each(function(){
        $(this).addClass('animate300').addClass('clear');
        $(this).one('webkitTransitionEnd',function(){
          $(this).addClass('hidden');
          $(this).removeClass('animate300').removeClass('clear');
        });
      });
    } else {
      //toggle crap
      $('section.screen').each(function(){
        $(this).addClass('hidden').addClass('clear');
      });
    }

    //set the nav#top title
    if (s.data('title')) {
      $('nav#top .right').html(s.data('title'));
    } else {
      $('nav#top .right').html('Shh Santa!');
    }

    //show the nav#top left action icon
    $('nav#top .left i').addClass('clear');
    $('nav#top .left i').addClass('hidden');
    if (s.data('nav-icon')) {
      $('nav#top .left i[id='+s.data('nav-icon')+']').removeClass('hidden');
      setTimeout(function(){
        $('nav#top .left i[id='+s.data('nav-icon')+']').removeClass('clear');
      },10);
    }

    //mark all tabBar icons as inactive
    $('nav#tab .item').each(function(i){
      $(this).removeClass('active');
    });
    $('nav#tab .item[data-screen="'+s.attr('id')+'"]').addClass('active');

    //set all tab img to "off"
    $('nav#tab .item img.off').each(function(i){
      $(this).removeClass('hidden');
    });
    $('nav#tab .item img.on').each(function(i){
      $(this).addClass('hidden');
    });
    //set the selected tab img to "on"
    $('nav#tab .item[data-screen='+s.attr('id')+'] img.off').addClass('hidden');
    $('nav#tab .item[data-screen='+s.attr('id')+'] img.on').removeClass('hidden');

    //ready to show the screen

    if(animateBoolean){
      //animate crap
      s.addClass('clear').removeClass('hidden').addClass('animate300');
      setTimeout(function(){
        s.removeClass('clear');
      },10);
      s.one('webkitTransitionEnd',function(){
        s.removeClass('animate300');
      });
    } else {
      //toggle crap
      s.removeClass('clear').removeClass('hidden');
    }


    //custom page actions
    switch (s.attr('id')) {
      case 'login':
        pages.login.init();
        break;
      case 'start':
        pages.start.init(forceDataUpdate);
        break;
      case 'signup':
        pages.signup.init();
        break;
      case 'events':
        pages.events.init(forceDataUpdate);
        break;
      case 'settings':
        pages.settings.init(forceDataUpdate);
        break;
      case 'wishList':
        user.currentRecipient = Parse.User.current();
        pages.wishList.init(forceDataUpdate);
        break;
      default:
        console.log(s.attr('id'));
    }

    if(s.data("nav")==true){
      $('nav#top').removeClass('hideTop');
    } else {
      $('nav#top').addClass('hideTop');
    }
    if(s.data("tabbar")==true){
      $('nav#tab').removeClass('hideBottom');
    } else {
      $('nav#tab').addClass('hideBottom');
    }
  },
  s: function(message,type){
    //function to log to console and message session queue.
    //type == 0 (log) 1 (warn) 2 (error)
    var d = new Date();
    if (!type) { type = 0; }
      var log = {
        "date" : d.getTime(),
        "msg" : message,
        "type" : type
      };
      if (type == 2){
        console.error(log.date+'('+log.type+'): '+log.msg);
      } else if (type == 1) {
        console.warn(log.date+'('+log.type+'): '+log.msg);
      } else {
        console.log(log.date+'('+log.type+'): '+log.msg);
      }

      //add to localStorage Log
      app.d.s.push(log);
      localStorage.sessionLog = JSON.stringify(app.d.s);
  },
  l: function(message,type){
    //function to log to console and message queue.
    //type == 0 (log) 1 (warn) 2 (error)
    var d = new Date();
    if (!type) { type = 0; }
    var log = {
      "date" : d.getTime(),
      "msg" : message,
      "type" : type
    };
    if (type == 2){
      console.error(log.date+'('+log.type+'): '+log.msg);
    } else if (type == 1) {
      console.warn(log.date+'('+log.type+'): '+log.msg);
    } else {
      console.log(log.date+'('+log.type+'): '+log.msg);
    }

    //add to localStorage Log
    app.d.l.push(log);
    localStorage.logs = JSON.stringify(app.d.l);
  },
  e: function(message){
    if(typeof message == "undefined"){
      message = "Something went wrong - but we've got the best Elves on the job.";
    }
    navigator.notification.alert(
      message,//message
      function(){},//callback
      'What a lump \'o coal',//[title]
      "Nuts."//[buttonNames]
    );
  },
  n: function(title, message, callback){
    if(typeof title == "undefined"){
      title = "Ahoy-hoy!";
    }
    if(typeof message == "undefined"){
      message = "Hello there! :)";
    }
    if(typeof callback == "undefined"){
      callback = function(){}
    }
    navigator.notification.alert(
      message,//message
      callback,//callback
      title,//[title]
      "Okie dokie"//[buttonNames]
    );
  },
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    app.remE();
    app.addE();
  },
  addE : function(){
    return $.Deferred(function(a){
      $('.touchable').on('touchstart mousedown',function(){
        $('.touchable').removeClass('touched');
        $(this).addClass('touched');
      });
      $('.touchable').on('touchend touchcancel mouseup',function(){
        $('.touchable').removeClass('touched');
      });
      $('.touchable').hammer().on('tap',function(e){
        e.preventDefault();
        $(this).addClass();
      });
      $('.shakeable').on('touchstart mousedown',function(){
        $('.shakeable').removeClass('shake');
        $(this).addClass('shake');
      });
      $('.shakeable').on('touchend touchcancel mouseup',function(){
        $('.shakeable').removeClass('shake');
      });
      //tab bar item actions
      $('nav#tab .item').hammer().on('tap',function(e){
        var s = $('section.screen#'+$(this).data('screen'));

        app.showScreen(s, false, $(this).hasClass('active') ? true : false);
      });
      a.resolve();
    }).promise();
  },
  remE : function(){
    return $.Deferred(function(r){
      $('.touchable').off('touchstart mousedown');
      $('.touchable').off('touchend touchcancel mouseup');
      $('.touchable').hammer().off('tap');
      $('.shakeable').off('touchstart mousedown');
      $('.shakeable').off('touchend touchcancel mouseup');
      //tab bar item actions
      $('nav#tab .item').hammer().off('tap');
      r.resolve();
    }).promise();
  },
  onDeviceReady: function() {
    app.s('deviceready');
  },
  updateBadge : function(tabBarObject, badgeInteger){
    if (badgeInteger == 0) {
      tabBarObject.removeAttr('data-badge');
    } else {
      tabBarObject.attr('data-badge', badgeInteger);
    }
  }
};

var user = {
  parse : null,
  santaList : [],
  santaListUpdatedAt : new Date(2000,01,01),
  getSantas : function(forceDataUpdate){
    app.l('Getting user\'s santas...');
    return $.Deferred(function(getSantas){
      if (forceDataUpdate || user.santaListUpdatedAt <= new Date().subMinutes(15)) {
        //Get data from Parse
        var Santas = Parse.Object.extend("Santas");
        var santasQuery = new Parse.Query(Santas);
        santasQuery.equalTo('santa', Parse.User.current());
        santasQuery.include('recipient');
        santasQuery.include('event');
        santasQuery.ascending('createdAt');
        santasQuery.find({
          success: function(r){
            user.santaList = _.sortBy(r, function(i){ return i.get('event').get('eventAt'); });;
            user.santaListUpdatedAt = new Date();
            app.l('...got user\'s santa list FROM PARSE');
            getSantas.resolve(user.santaList);
          },
          error: function(e){
            app.l(JSON.stringify(e),2);
            app.e("Wowsa! I can't find your Secret Santa list right now! Try again in a few minutes, ok?");
            getSantas.reject(e);
          }
        });
      } else {
        app.l('...got user\'s santa list FROM CACHE');
        getSantas.resolve(user.santaList);
      }
    }).promise();
  },
  eventList : [],
  eventListUpdatedAt : new Date(2000,01,01),
  getEvents : function(forceDataUpdate){
    app.l('Getting user\'s events and invitations...');
    return $.Deferred(function(getEvents){
      if (forceDataUpdate || user.eventListUpdatedAt <= new Date().subMinutes(15)) {
        //Get data from Parse
        var Attendance = Parse.Object.extend("Attendance");
        var attendanceByAttendeeQuery = new Parse.Query(Attendance);
        attendanceByAttendeeQuery.equalTo('attendee', Parse.User.current());
        var attendanceByEmailQuery = new Parse.Query(Attendance);
        attendanceByEmailQuery.equalTo('email', Parse.User.current().get('email'));
        var attendanceQuery = new Parse.Query.or(attendanceByAttendeeQuery, attendanceByEmailQuery);
        attendanceQuery.include('event');
        attendanceQuery.ascending('createdAt');
        attendanceQuery.find({
          success: function(r){
            user.eventList = r;
            user.eventListUpdatedAt = new Date();
            app.l('...got user\'s events and invitations FROM PARSE');
            getEvents.resolve(user.eventList);
          },
          error: function(e){
            //TODO
            //Tie error to master logging system
            console.error(e);
            app.e("Wowsa! I can't find your events right now! Try again in a few minutes, ok?");
            getEvents.reject(e);
          }
        });
      } else {
        app.l('...got user\'s events and invitations FROM CACHE');
        getEvents.resolve(user.eventList);
      }
    }).promise();
  },
  wishList : [],
  wishListUpdatedAt : new Date(2000,01,01),
  getWishList : function(forceDataUpdate){
    app.l('Getting user\'s wish list...');
    return $.Deferred(function(getData){
      if (forceDataUpdate || user.wishListUpdatedAt <= new Date().subMinutes(5)) {
        var Item = Parse.Object.extend('Item');
        var wishListQuery = new Parse.Query(Item);
        wishListQuery.descending('rating');
        wishListQuery.equalTo('owner', Parse.User.current());
        //include the _User object
        wishListQuery.include('owner');
        wishListQuery.find({
          success : function(results){
            //got the data
            user.wishList = results;
            user.wishListUpdatedAt = new Date();
            app.l('...got wish list items FROM PARSE');
            getData.resolve(user.wishList);
          },
          error : function(error){
            app.e("Darn it! I couldn't find your Wish List.  Gimmea sec, and try again.");
            app.l(JSON.stringify(error,null,2),2);
            getData.reject(error);
          }
        });
      } else {
        app.l('...got wish list items FROM CACHE');
        getData.resolve(user.wishList);
      }
    }).promise();
  },
  currentEvent : {},
  currentItem : {},
  currentAttendanceID : "",
  currentRecipient : {},
  currentRecipientWishList : [],
  tx : {
    //transmission flags to prevent data-spamming
    user : false,
    event : false,
    item : false,
    attendance : false
  }
};

//various utility functions
var util = {
  random : function(min,max){
    return Math.floor(Math.random() * (max - min)) + min;
  },
  elf : {
    firstNameSyllables : [
      "mon",
      "fay",
      "shi",
      "zag",
      "blarg",
      "resh",
      "izen",
      "chi",
      "under",
      "little",
      "hill",
      "donk",
      "larp",
      "jazz",
      "ears",
      "hat",
      "tarp",
      "zion",
      "ity",
      "mirf",
      "mop",
      "tree",
      "pine",
      "magic",
      "mana",
      "tree",
      "sugar",
      "candy",
      "sock",
      "gift",
      "buddy",
      "derp",
      "woo",
      "ear",
      "pointy",
      "kris",
      "grumpy",
      "happy",
      "silly",
      "dopy",
      "wiley",
      "funny",
      "fuzzy"
    ],
    lastNameSyllables : [
      "malo",
      "zak",
      "aboo",
      "wonk",
      "derp",
      "wood",
      "brush",
      "thrup",
      "green",
      "brown",
      "seed",
      "nut",
      "son",
      "kilt",
      "shoe",
      "ton",
      "hole",
      "butch",
      "esis",
      "ou",
      "ash",
      "wind",
      "weak",
      "magi",
      "large",
      "pro",
      "bush",
      "shrub",
      "hill",
      "top",
      "bottom",
      "thistle",
      "leaf",
      "mountain",
      "cliff",
      "isle",
      "islay",
      "pond",
      "candy",
      "cane",
      "pit",
      "hole",
      "story",
      "book",
      "tool",
      "cheer",
      "funny",
      "furry",
      "fuzzy",
      "silly"
    ]
  },
  generateElfName : function(){
    //first name
    var fn = "";
    var numSyllablesFN = util.random(1,2);
    for (var i = 0; i < numSyllablesFN; i++) {
      fn += util.elf.firstNameSyllables[util.random(0,util.elf.firstNameSyllables.length)];
    }
    var fnFirstLetter = fn.substr(0,1).toUpperCase();
    fn = fn.slice(1);
    fn = fnFirstLetter + fn;

    //last name
    var ln = "";
    var numSyllablesLN = util.random(2,3);
    for (var i = 0; i < numSyllablesLN; i++) {
      ln += util.elf.lastNameSyllables[util.random(0,util.elf.lastNameSyllables.length)];
    }
    var lnFirstLetter = ln.substr(0,1).toUpperCase();
    ln = ln.slice(1);
    ln = lnFirstLetter + ln;

    return fn + " " + ln
  },
  shake : null,
  formatDate : function(date){
    return moment(date).format('dddd, MMM Do YYYY [at] h:mm A');
  },
  formatDateForDTL : function(date){
    //prepare the event date value for the datetime-local input element
    //
    // Find the current time zone's offset in milliseconds.
    var timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
    // Subtract the time zone offset from the current UTC date, and pass
    //  that into the Date constructor to get a date whose UTC date/time is
    //  adjusted by timezoneOffset for display purposes.
    var localDate = new Date(date.getTime() - timezoneOffset);
    // Get that local date's ISO date string and remove the Z.
    return localDate.toISOString().replace('Z', '');
  },
  DTLToDate : function(ISODateStringFromDTL){
    return new Date(moment(ISODateStringFromDTL).local().valueOf());
  },
  formIsDirty : function(formObject){
    var isDirty = false;
    formObject.find('input').each(function(i,v){
      if ($(this).data('dirty') == true) {
        isDirty = true;
      }
    });
    formObject.find('textarea').each(function(i,v){
      if ($(this).data('dirty') == true) {
        isDirty = true;
      }
    });

    return isDirty;
  },
  getDataUPC : function(upc, successCallback, errorCallback){
    // NEW lookup via Outpan test UPC: 714201313585
    // Test string: http://www.outpan.com/api/get-product.php?barcode=0714201313585&apikey=e4df75113dd952806a676e683515c618
    var url = 'http://www.outpan.com/api/get-product.php?barcode='+upc+'&apikey='+app.d.outpan.key;
    //var response = {};
    app.l('Product lookup for UPC:'+upc);
    $.getJSON(url,null).done(function(d){
      if(d.error){
        if(errorCallback){
          errorCallback(d);
        }
      } else {
        if(successCallback){
          successCallback(d);
        }
      }
    }).fail(function(e){
      if(errorCallback){
        errorCallback(e);
      }
    }).always(function(){
      app.l('Product lookup complete for UPC:'+upc);
    });
  },
  photo : {
    fromLibrary : function(){
      return $.Deferred(function(flf){
        navigator.camera.getPicture(function(data){
          //success
          flf.resolve(data);
        }, function(){
          //error
          flf.reject(e);
        }, {
          //options
          quality: 50,
          destinationType: 0, //0 = DATA_URL, 1 = FILE_URI
          sourceType: 0, //0 = Library, 1 = Camera
          allowEdit: true,
          encodingType: 0, //0 = JPG, 1 = PNG
          targetWidth: 512,
          targetHeight: 512,
          saveToPhotoAlbum: false,
          cameraDirection: 0 //0 = back, 1 = front
        });
      }).promise();
    },
    takeNew : function(){
      return $.Deferred(function(tnf){
        navigator.camera.getPicture(function(data){
          //success
          tnf.resolve(data);
        }, function(e){
          //error
          tnf.reject(e);
        }, {
          //options
          quality: 50,
          destinationType: 0, //0 = DATA_URL, 1 = FILE_URI
          sourceType: 1, //0 = Library, 1 = Camera
          allowEdit: true,
          encodingType: 0, //0 = JPG, 1 = PNG
          targetWidth: 512,
          targetHeight: 512,
          saveToPhotoAlbum: true,
          cameraDirection: 0 //0 = back, 1 = front
        });
      }).promise();
    }
  },
  convertImgToBase64 : function(url, callback, outputFormat){
    /*
      Supported input formats
      =====
      image/png
      image/jpeg
      image/jpg
      image/gif
      image/bmp
      image/tiff
      image/x-icon
      image/svg+xml
      image/webp
      image/xxx

      Supported output formats
      =====
      image/png
      image/jpeg
      image/webp (chrome)
    */
    var canvas = document.createElement('CANVAS'),
    ctx = canvas.getContext('2d'),
    img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
      var dataURL;
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      callback.call(this, dataURL);
      canvas = null;
    };
    img.src = url;
  }
}
