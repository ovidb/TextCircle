this.Documents = new Mongo.Collection("documents");
if (Meteor.isClient){
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
		"current_date": function() {
			return new Date();
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
