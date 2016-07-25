this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient){

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
					$("#viewer_iframe")
						.contents().find("html")
						.html(cm_editor.getValue());
					Meteor.call("addEditingUser");
				});
			}
		},
	});
	Template.editingUsers.helpers({
		users: function() {
			var doc, eUsers, users;
			doc = Documents.findOne();
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
	})

	//////////////
	// EVENTS
	/////////////
	Template.navbar.events({
		"click .js-add-doc": function(event) {
			event.preventDefault();
			console.log("Add a new doc");
			if(!Meteor.user()) {//user not avaliable
				alert("You need to login first!");
			} else {
				// user logged in, inserting docs
				Meteor.call("addDoc");
			}
		}
	})


} // end isClient

if (Meteor.isServer){
	Meteor.startup(function(){
		// code to run on server at startup
		if (!Documents.findOne()) {
			Documents.insert({title: 'My new document'});
		}
	})

}
Meteor.methods({
	addDoc:function() {
		var doc;
		if(!this.userId) {// not logged in
			console.log("Adding document error: User not logged in");
			return;
		} else {
			doc = {owner: this.userId, createdOn: new Date(),
						 title: "my new doc"};
			Documents.insert(doc);
		}
	},
	addEditingUser: function() {
		var doc, user, eUsers;
		doc = Documents.findOne();
		if(!doc) {return;}
		if(!this.userId) {return;}
		//we should have a doc and a user here
		user = Meteor.user().profile;
		user.lastEdit = new Date();

		eUsers = EditingUsers.findOne({docid: doc._id});
		if (!eUsers) {
			eUsers = {
				docid:doc._id,
				users:{},
			};
		}
		eUsers.users[this.userId] = user;

		EditingUsers.upsert({_id: eUsers._id},eUsers);
	}
});

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
