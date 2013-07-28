var id = 0;
var db;
var scroll;
var levelUser;
var insertedUniqueId;
var uid ;
var flagIsUpdate;
var GroupCollection = {};
var locationId;
var groupId;

//-- Workarounds for Update cases---
var originalGroupId;
var originalImage;
//----- 


function getUrlVars() {
	//alert('hi');
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
        }, 1000);       
  
 }

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
document.addEventListener('DOMContentLoaded', loaded, false);


window.addEventListener('load', function() {
		var buttonBack;	
		var buttonCapture;	
		buttonBack = document.getElementById('btnBack');
		buttonCapture = document.getElementById('imgCaptured');

		// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
		FastClick.attach(buttonBack);
		FastClick.attach(buttonCapture);	
			

		buttonBack.addEventListener('touchend', function(event) {
			 RedirectToPage("groupparticipants.html"); 
		}, false);
		
		buttonCapture.addEventListener('touchend', function(event) {
			 capturePhoto();
		}, false);
		
	}, false);
	
window.addEventListener("orientationchange", function() {
   setTimeout(function(){
		scroll.refresh();
	},0);
     
	
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
	 locationId= getUrlVars()["locationId"];
	 groupId = getUrlVars()["groupId"];
	 //alert(groupId);
	// Assign all the Hindi Label..
	  $('#btnBack').html('<br>&#2357;&#2366;&#2346;&#2360;');
	  $('#btnCaptureImage').html("<br><br>&#2347;&#2379;&#2335;&#2379; &#2354;&#2375;"); 
	  $('#addEntrySubmit').html("&#2360;&#2369;&#2352;&#2325;&#2381;&#2359;&#2367;&#2340; &#2325;&#2352;&#2375;"); 
	  
	  //
	
	$('#busy').hide();
	$('#uid').val(guid());	
	$('#uid').hide();	
	uid= getUrlVars()["uid"];
	
	 if (typeof uid === "undefined") {	 	
	 	flagIsUpdate=0;
	 	originalImage=$('#uid').val()+".jpg";
	 }
	 else
	 {
	 	flagIsUpdate=1;
	 }
	db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);
	// Assign the avaialble Single Select Values for
	
	// Populate the avaialble Levels
	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('Select ID,Name from levels',[],PopulateLevel_success);    	
	     }
	     , transaction_error);
}


function PopulateLocation_success(tx,results){
	var len = results.rows.length;
	var strLocationOptions='<div data-role="fieldcontain"><label for="locationId" class="select">Choose Location</label><select name="locationId" id="locationId" data-native-menu="false"><option value="0" data-placeholder="true">Choose Location</option>';
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
	     	tx.executeSql('Select ID,Name,LocationId from groups',[],PopulateGroup_success);    	
	     }
	     , transaction_error);
	
}
function PopulateGroup_success(tx,results){
	var len = results.rows.length;
	var strGroupOptions='<div data-role="fieldcontain"><select name="groupId" id="groupId" data-native-menu="false"><option value="0" data-placeholder="true">&#2360;&#2350;&#2370;&#2361; &#2325;&#2366; &#2330;&#2351;&#2344;</option>';
	var strGroupClose='</select></div>';
		
	 for (var i=0; i<len; i++) {
	 	var group = results.rows.item(i);	 
	 	strGroupOptions +='<option value="'+group.ID+'">'+group.Name+'</option>';
	 	GroupCollection[group.ID]=group.LocationId;
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
	var strLevelOptions='<div data-role="fieldcontain"><select name="level" id="level" data-native-menu="false"><option value="0" data-placeholder="true">&#2360;&#2381;&#2340;&#2352; &#2325;&#2366; &#2330;&#2351;&#2344;</option>';
	var strLevelClose='</select></div>';
		
	 for (var i=0; i<len; i++) {
	 	var level = results.rows.item(i);	 
	 	strLevelOptions +='<option value="'+level.ID+'">'+level.Name+'</option>';
	 }
	//alert(strGroupOptions+strGroupClose);
	$('#levelSelect').append(strLevelOptions+strLevelClose);
	$('#levelSelect').trigger( "create" );	
		
		
		// If the operation is for existing participant
		// Populate values from his profile..
		if(flagIsUpdate==1)
		{
			var  sql = "select e.ID,e.FirstName, e.LastName, e.UniqueID,e.Level, e.Image,e.LocationID,e.GroupID,e.IsNew,e.IsUpdate "
  			  + 	" from Participants e " 
			  +  " where e.UniqueID=:uid ";
			  
	 db.transaction(function(tx)
		     {	     	
		     	tx.executeSql(sql,[uid],PopulateProfile_success);    	
		     }
		     , transaction_error);
		}
}

// This function will populate the values in the form
function PopulateProfile_success(tx,results){
	
		var participant = results.rows.item(0);
		$('#uid').val(participant.UniqueID);
		$('#firstName').val(participant.FirstName);
		$('#lastName').val(participant.LastName);
		
	 //	$('#locationId').find("option[value='"+participant.LocationID+"']").attr("selected", true);
	//	$('#groupId').find("option[value='"+participant.GroupID+"']").attr("selected", true);
		$('#level').find("option[value='"+participant.Level+"']").attr("selected", true);		
		// Disable the level field
		
				
	//	$('#locationId').selectmenu("refresh", true);
		
		//$('#groupId').val(participant.GroupID);
		//$('#groupId').attr('value', participant.GroupID);
		originalGroupId=participant.GroupID;
		originalImage=participant.Image;
		//$('#groupId').selectmenu("refresh", true);
		//alert($('#groupId').attr('value'));
		
		$('#level').selectmenu("refresh", true);		
		$('#level').selectmenu("disable");
		
		
					
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
	
    window.location=pageUrl+"?locationId="+locationId+"&groupId="+groupId;
}

/*********************** Database Operations ****************************/

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}
   	
// Add grantee
function addEmployee()
{
	if(flagIsUpdate==1)
	{
		$('#busy').html('Updating Record');	
		db.transaction(UpdateEmployeeInDB);
	}
	else
	{
		$('#busy').html('Adding Record');	
		db.transaction(addEmployeeInDB);	
	}
}
function UpdateEmployeeInDB(tx)
{		
	var updatedGroupId=groupId;
	var isInfluencer=0;
	if(isInfluencer == 1)
	{
		updatedGroupId=0;
	}
	
	$('#busy').show();
	var sql = "Update Participants set FirstName='" + $('#firstName').val() +"',LastName='"+ $('#lastName').val()
	 +"',Image='"+ originalImage +"',GroupID='"+ updatedGroupId +"',LocationID='"+ locationId +"',IsUpdate='1'" 
	 + " where UniqueID=:uid";
	 
	
	tx.executeSql(sql,[uid],UpdateEmployeeInDB_success);
	
}
function UpdateEmployeeInDB_success(tx,results) {
	
	setTimeout(function(){ 	
  	 RedirectToPage("groupparticipants.html");
}, 1000);
	
}

function addEmployeeInDB(tx)
{	
	levelUser=$('#level').val();	
	$('#busy').show();		
	var sql = "INSERT INTO Participants (FirstName,LastName,UniqueID,Image,Level,Points,LocationID,GroupID,IsNew,IsUpdate) VALUES ('" + $('#firstName').val() +"','"
		+ $('#lastName').val() +"',"+ "'"+$('#uid').val()+"','"+ $('#uid').val() +".jpg'" +",'"+$('#level').val() +"','0','"+locationId+"','"
		+ groupId+"','1','0')"; 
		
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
	
}

function getObjectives_success(tx, results) {
	
	var len = results.rows.length;
	
	for (var i=0; i<len; i++) {
		var objective = results.rows.item(i);	 
			
		var sqlObjective="INSERT INTO Performance (UniqueID,ObjectiveID,Completed) VALUES ('" + insertedUniqueId +"','"
		+ objective.ID +"',"+ "'0')"; 
		       
		       
		       tx.executeSql(sqlObjective);    
		
	}
	
	
	setTimeout(function(){ 	
  	 RedirectToPage("groupparticipants.html");
  }, 1000);
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
                fileEntry.copyTo(dir, originalImage, onCopySuccess, fail); 
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
