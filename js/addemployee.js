var id = 0;
var db;
var scroll;
var levelUser;
var insertedUniqueId;

function loaded() {
	//alert('loaded');
	setTimeout(function () { 
        scroll = new iScroll('wrapper', {
		useTransform: false,
		onBeforeScrollStart: function (e) {
			var target = e.target;
			while (target.nodeType != 1) target = target.parentNode;

		
		if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
				e.preventDefault();
		}
	});
        }, 100);         
    
     setTimeout(function(){
		scroll.refresh();
	},200);	
 }

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
document.addEventListener('DOMContentLoaded', loaded, false);


window.addEventListener('load', function() {
		var buttonBack;	
		var buttonCapture;	
		buttonBack = document.getElementById('btnBack');
		buttonCapture = document.getElementById('btnCaptureImage');

		// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
		FastClick.attach(buttonBack);		

		buttonBack.addEventListener('touchend', function(event) {
			 RedirectToPage('index.html'); 
		}, false);
		
		buttonCapture.addEventListener('touchend', function(event) {
			 capturePhoto();
		}, false);
		
	}, false);
	
window.addEventListener("orientationchange", function() {
    setTimeout(function(){
		scroll.refresh();
	},200);	 
}, false);

document.addEventListener("deviceready", onDeviceReady, false);

function gotFS(fileSystem) {
    console.log("got filesystem");
    // save the file system for later access
    //console.log(fileSystem.root.fullPath);
    window.rootFS = fileSystem.root;
	$('#photofilepath').val(window.rootFS.fullPath);
}

document.addEventListener('deviceready', function() {                
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}, false);

function onDeviceReady() {
	//loaded();
	$('#busy').hide();
	$('#uid').val(guid());	
	$('#uid').hide();	
	db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);
	// Assign the avaialble Single Select Values for
	
	  db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('Select ID,Name from locations',[],PopulateLocation_success);    	
	     }
	     , transaction_error);
	
	// Location
	// $('#locationSelect').append('<div data-role="fieldcontain"><select name="locationId" id="locationId" data-native-menu="false"><option value="Choose Location" data-placeholder="true">Choose Location</option><option value="standard">Location 1</option><option value="rush">Location 2</option><option value="express">Location 3</option><option value="overnight">Location 4</option></select></div>'		 	
	//	 );
		 
		 
		 
	//Group
	//$('#groupSelect').append('<div data-role="fieldcontain"><select name="groupId" id="groupId" data-native-menu="false"><option value="Choose Group" data-placeholder="true">Choose Group</option><option value="standard">Group 1</option><option value="rush">Group 2</option><option value="express">Group 3</option><option value="overnight">Group 4</option></select></div>'		 	
	//	 );
		 
		 // Refresh the UI..
	//	 $('#locationSelect').trigger( "create" );	
	//	 $('#groupSelect').trigger( "create" );	
}
function PopulateLocation_success(tx,results){
	var len = results.rows.length;
	var strLocationOptions='<div data-role="fieldcontain"><label for="locationId" class="select">Choose Location</label><br><select name="locationId" id="locationId" data-native-menu="false"><option value="0" data-placeholder="true">Choose Location</option>';
	var strLocationClose='</select></div>';
	
	 for (var i=0; i<len; i++) {
	 	var location = results.rows.item(i);	 
	 	strLocationOptions +='<option value="'+location.ID+'">'+location.Name+'</option>';
	 }
	//alert(strLocationOptions+strLocationClose);
	$('#locationSelect').append(strLocationOptions+strLocationClose);
	$('#locationSelect').trigger( "create" );	
	
	// Now Populate Groups
	
	  db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('Select ID,Name from groups',[],PopulateGroup_success);    	
	     }
	     , transaction_error);
	
}
function PopulateGroup_success(tx,results){
	var len = results.rows.length;
	var strGroupOptions='<div data-role="fieldcontain"><label for="groupId" class="select">Choose Group</label><br><select name="groupId" id="groupId" data-native-menu="false"><option value="0" data-placeholder="true">Choose Group</option>';
	var strGroupClose='</select></div>';
		
	 for (var i=0; i<len; i++) {
	 	var group = results.rows.item(i);	 
	 	strGroupOptions +='<option value="'+group.ID+'">'+group.Name+'</option>';
	 }
	//alert(strGroupOptions+strGroupClose);
	$('#groupSelect').append(strGroupOptions+strGroupClose);
	$('#groupSelect').trigger( "create" );	
	
	 db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('Select ID,Name from levels',[],PopulateLevel_success);    	
	     }
	     , transaction_error);
	
}

function PopulateLevel_success(tx,results){
	var len = results.rows.length;
	var strLevelOptions='<div data-role="fieldcontain"><label for="level" class="select">Choose Level</label><br><select name="level" id="level" data-native-menu="false"><option value="0" data-placeholder="true">Choose Level</option>';
	var strLevelClose='</select></div>';
		
	 for (var i=0; i<len; i++) {
	 	var level = results.rows.item(i);	 
	 	strLevelOptions +='<option value="'+level.ID+'">'+level.Name+'</option>';
	 }
	//alert(strGroupOptions+strGroupClose);
	$('#levelSelect').append(strLevelOptions+strLevelClose);
	$('#levelSelect').trigger( "create" );		
}



// Get querystring parameter
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

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

// genrate unique Id to associate with the grantee
function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
   
}

// Redirect to the Home Page
function RedirectToPage(pageUrl) {
	$('#busy').hide();	
    window.location=pageUrl;
}

/*********************** Database Operations ****************************/

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}
   	
// Add grantee
function addEmployee()
{
	db.transaction(addEmployeeInDB);	
}

function addEmployeeInDB(tx)
{	
	levelUser=$('#level').val();	
	$('#busy').show();		
	var sql = "INSERT INTO Participants (FirstName,LastName,UniqueID,Image,Level,Points,LocationID,GroupID,IsNew,IsUpdate) VALUES ('" + $('#firstName').val() +"','"
		+ $('#lastName').val() +"',"+ "'"+$('#uid').val()+"','"+ $('#uid').val() +".jpg'" +",'"+$('#level').val() +"','0','"+$('#locationId').val()+"','"+
		$('#groupId').val() +"','1','0')"; 
		
	//alert(sql);
	tx.executeSql(sql,[],addEmployeeInDB_success);
	
	
	//alert('Query Executed');
}

function addEmployeeInDB_success(tx,results) {
	console.log("Employee Added"+results.insertId);
	insertedUniqueId=$('#uid').val();
	
	// Insert the performance of User in the Performance Table 
	// Get all the associated Objectives with the Level
	
	var sqlPerformance="select ID,Name,LevelId from objectives o"
			  +  " where o.LevelId=:levelUser ";
			 
				
	tx.executeSql(sqlPerformance, [levelUser], getObjectives_success);	
	
	//RedirectToPage("index.html");
}

function getObjectives_success(tx, results) {
	
	var len = results.rows.length;
	
	for (var i=0; i<len; i++) {
		var objective = results.rows.item(i);	 
			
		var sqlObjective="INSERT INTO Performance (UniqueID,ObjectiveID,Completed) VALUES ('" + insertedUniqueId +"','"
		+ objective.ID +"',"+ "'0')"; 
		       
		       
		       tx.executeSql(sqlObjective);    
		
	}
	
	$('#busy').hide();	
	RedirectToPage("index.html");
}




/******************************************************************************************/

/*------------------------- Phone Functions ---------------------------------------------*/

function capturePhoto() {
    navigator.camera.getPicture(onPhotoURISuccess, fail, { quality: 25, destinationType: Camera.DestinationType.FILE_URI ,saveToPhotoAlbum: true});
}

function onPhotoURISuccess(imageURI) {
    createFileEntry(imageURI);
	$('#imgCaptured').attr('src',imageURI);
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

/*------------------------- --------------------------------------------------------------*/
