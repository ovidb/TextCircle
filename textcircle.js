this.Documents = new Mongo.Collection("documents");
var myVar = 10;

if (Meteor.isClient){

	Meteor.setInterval(function() {
			Session.set("current_date", new Date());
	}, 1000);


	Template.editor.helpers({
		docid:function() {
			var doc = Documents.findOne();
			if (doc) {
				return doc._id;
			} else {
				return undefined;
			}

		}
	});
	Template.date_display.helpers({
		current_date: function() {
			return Session.get("current_date");
		},
		myVar: function() {
			return myVar;
		}
	});
}

if (Meteor.isServer){
	Meteor.startup(function(){
		// code to run on server at startup
		if (!Documents.findOne()) {
			Documents.insert({title: 'My new document'});
		}
	})
}
