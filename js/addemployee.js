var id = 0;
var db;

$(document).ready(function() {
	
    $('#header').append('<div class="left Button" id="hello">Home</div>');   

    var touch = function(e) {
        if (! $(this).hasClass('ButtonPressed')) {
        	// function to call on button click..
        	window.location="index.html";
            $(this).toggleClass('Button ButtonPressed');
        }
    };
    
    var untouch = function(e) {
        if ($(this).hasClass('ButtonPressed')) {
        	//alert('unpress');
            $(this).toggleClass('Button ButtonPressed');
        }
    };

    $('#header .Button').each(function() {
        $(this).mousedown(touch).mouseleave(untouch).mouseup(untouch);
        $(this).bind('touchstart', touch).bind('touchend', untouch);
    });
   
});

document.addEventListener("deviceready", onDeviceReady, false);

function gotFS(fileSystem) {
    console.log("got filesystem");
    // save the file system for later access
    console.log(fileSystem.root.fullPath);
    window.rootFS = fileSystem.root;
	$('#photofilepath').val(window.rootFS.fullPath);
}

document.addEventListener('deviceready', function() {                
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}, false);

function onDeviceReady() {
		
	$('#busy').hide();
	$('#uid').val(guid());
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}
function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

function addEmployee()
{	
	db = window.openDatabase("EmployeeDirectoryDB", "1.0", "PhoneGap Demo", 200000);
	console.log("database opened");
	db.transaction(addEmployeeInDB,transaction_error,addEmployeeInDB_success);	
}
function transaction_error(tx, error) {
	$('#busy').hide();	
    alert("Database Error: " + error);
}
function addEmployeeInDB_success(tx) {
	console.log("Employee Added");
	$('#busy').hide();
	window.location="index.html";
}
function addEmployeeInDB(tx)
{	
	$('#busy').show();		
	var sql ="INSERT INTO employee (uid,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES ("+ "'"+$('#uid').val()+"','"+
	$('#firstName').val() +"','"+$('#lastName').val() +"',"+$('#managerId').val() +",'"+$('#title').val() +"','"+$('#department').val() +"','"+$('#officePhone').val() +"','"+
	$('#cellPhone').val() +"','"+$('#email').val() +"','"+$('#city').val() +"','"+$('#uid').val() +".jpg')"; 
	
	tx.executeSql(sql);
	//alert('Query Executed');
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function capturePhoto() {
    navigator.camera.getPicture(onPhotoURISuccess, fail, { quality: 25, destinationType: Camera.DestinationType.FILE_URI ,saveToPhotoAlbum: true});
}

function onPhotoURISuccess(imageURI) {
    createFileEntry(imageURI);
	$('#photofilepath').val(imageURI);
}

function createFileEntry(imageURI) {
    window.resolveLocalFileSystemURI(imageURI, copyPhoto, fail);    
}

function copyPhoto(fileEntry) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) { 
        fileSys.root.getDirectory("photos", {create: true, exclusive: false}, function(dir) { 
                fileEntry.copyTo(dir, $('#uid').val() +".jpg", onCopySuccess, fail); 
            }, fail); 
    }, fail); 
}

function onCopySuccess(entry) {
    console.log(entry.fullPath)
}

function fail(error) {
    console.log(error.code);
}
