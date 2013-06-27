var TAP = ('ontouchend' in window) ? 'touchend' : 'click';
document.addEventListener('DOMContentLoaded', function () {
x$('#friendSubmit').on(TAP, function () {
var filter = x$('#friendName')[0].value;
if (!filter) {
// no contents
return;
} else {
// name entered
alert("we're looking for " + filter);
}
});
});

function findContactByName(name, callback) {

var fields = ["displayName", "name"],
options = new ContactFindOptions();
options.filter = name;
options.multiple = true;
// find contacts
navigator.contacts.find(fields, onSuccess, onError, options);
}
// onSuccess: Get a snapshot of the current contacts
    //
    function onSuccess(contacts) {
        for (var i=0; i<contacts.length; i++) {
            console.log("Display Name = " + contacts[i].displayName);
        }
    }
	function onError() {
alert('Error: unable to read contacts');
};
if (!filter) {
// no contents
return;
} else {
findContactByName(filter, function (contacts) {
alert(contacts.length + ' contact(s) found matching "' +
filter + '"');
});
}