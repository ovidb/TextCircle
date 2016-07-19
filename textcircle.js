this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient){

	Template.editor.helpers({
		docid:function() {
			var doc = Documents.findOne();
			if (doc) {
				return doc._id;
			} else {
				return undefined;
			}
		},
		config:function() {
			//get access to the editor
			return function(editor) {
				editor.on("change", function(cm_editor, info) {
					console.log(cm_editor.getValue());
					$("#viewer_iframe")
						.contents().find("html")
						.html(cm_editor.getValue());
					Meteor.call("addEditingUser");
				});
			}
		},
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
Meteor.methods({
	addEditingUser: function() {
		EditingUsers.insert({user: "Ovidiu"});
	}
});
