Meteor.subscribe("documents");
Meteor.subscribe("editingUsers");

Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function() {
  this.render("navbar", {to:"header"});
  this.render("docList", {to:"main"});
});

Router.route('/documents/:_id', function() {
  Session.set("docid", this.params._id);
  this.render("navbar", {to:"header"});
  this.render("docItem", {to:"main"});
});

Template.docList.helpers({
  documents:function() {
    return Documents.find();
  }
});

Template.editor.helpers({
  docid:function() {
    setCurrentDocument();
    return Session.get("docid");
  },
  config:function() {
    //get access to the editor
    return function(editor) {
      editor.on("change", function(cm_editor, info) {
        //show line number
        editor.setOption("lineNumbers", true);
        //set theme
        editor.setOption("theme", "cobalt")
        //change event handler
        //get current value from editor
        var editorValue = cm_editor.getValue();
        //get excerpt from editor value
        var excerpt = editorValue.substring(1,250);

        $("#viewer_iframe")
          .contents().find("html")
          .html(editorValue);
        Meteor.call("addEditingUser", Session.get("docid"));
        Meteor.call("updateDocExceprt", Session.get("docid"), excerpt);
      });
    }
  },
});
Template.editingUsers.helpers({
  users: function() {
    var doc, eUsers, users;
    doc = Documents.findOne({_id:Session.get("docid")});
    if(!doc) {return;}//give up
    eUsers = EditingUsers.findOne({docid:doc._id});
    if(!eUsers) {return;} //give up
    //iterate the keys
    users = new Array();
    var i = 0;
    for (var user_id in eUsers.users) {
      users[i] = fixObjectKeys(eUsers.users[user_id]);
      i++;
    }
    return users;

  }
});
Template.navbar.helpers({
  documents:function() {
    return Documents.find();
  }
});
Template.docMeta.helpers({
  canEdit:function() {
    var doc;
    doc = Documents.findOne({_id:Session.get("docid")});
    if (doc) {
      if(doc.owner == Meteor.userId()) {
        return true;
      }
    }
    return false;
  },
  document:function() {
    return Documents.findOne({_id:Session.get("docid")});
  }
});
Template.editableText.helpers({
  userCanEdit: function(doc, Collection) {
    //ca edit if the current doc is owned by me.
    doc = Documents.findOne({_id:Session.get("docid"), owner: Meteor.userId()});
    if(doc) {
      return true;
    } else {
      return false;
    }
  }
});

//////////////
// EVENTS
/////////////
Template.navbar.events({
  "click .js-load-doc": function(event) {
    console.log(this);
    Session.set("docid", this._id);
  },
  "click .js-add-doc": function(event) {
    event.preventDefault();
    console.log("Add a new doc");
    if(!Meteor.user()) {//user not avaliable
      alert("You need to login first!");
    } else {
      // user logged in, inserting docs
      Meteor.call("addDoc", function(err, res) {
        if(!err) {// all good
          Session.set("docid", res);
        }
      });
    }
  }
})
Template.docMeta.events({
  "click .js-tog-private":function(event) {
    var doc = {
      _id:Session.get("docid"),
      isPrivate: event.target.checked
    };
    Meteor.call("updateDocPrivacy", doc);
  }
})
function setCurrentDocument() {
	var doc;
	if(!Session.get("docid")) {//no doc id set yet
		doc = Documents.findOne();
		if(doc) {
			Session.set("docid", doc._id);
		}
	}
}
function fixObjectKeys(obj) {
	var newObj = {};
	for (key in obj) {
		var key2 = key.replace("-","");
		newObj[key2] = obj[key];
	}
	return newObj;
}
