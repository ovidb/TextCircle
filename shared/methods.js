Meteor.methods({
	updateDocPrivacy:function(doc) {
		var realDoc = Documents.findOne({_id:doc._id, owner:this.userId});
		if (realDoc) {
			realDoc.isPrivate = doc.isPrivate;
			Documents.update({_id:doc._id}, realDoc);
		}
	},
	addDoc:function() {
		var doc;
		if(!this.userId) {// not logged in
			console.log("Adding document error: User not logged in");
			return;
		} else {
			doc = {owner: this.userId, createdOn: new Date(),
						 title: "my new doc"};
			var id = Documents.insert(doc);
			return id;
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
