var id = 0;
var db;
var scroll;

var insertedUniqueId;
var uid ;
var flagIsUpdate;
var GroupCollection = {};
var locationId;
var groupId;
var levelId;

//-- Workarounds for Update cases---
var originalGroupId;
var originalImage;
//----- 

var flagIsInfluencer;
var influencerId;
var PregnancyLevelID,NewMomLevelID;



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

/*
function loaded() {

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
  
 }

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
document.addEventListener('DOMContentLoaded', loaded, false);

*/

window.addEventListener('load', function() {
		var buttonBack;	
		var buttonCapture;	
		buttonBack = document.getElementById('btnBack');
		buttonCapture = document.getElementById('imgCaptured');

		// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
		FastClick.attach(buttonBack);
		FastClick.attach(buttonCapture);	
			

		buttonBack.addEventListener('touchend', function(event) {
			GoBack();
		}, false);
		
		buttonCapture.addEventListener('touchend', function(event) {
			 capturePhoto();
		}, false);
		
	}, false);
	
	/*
window.addEventListener("orientationchange", function() {
   setTimeout(function(){
		scroll.refresh();
	},0);
     
	
}, false);
*/
function GoBack()
{
	
	 if(flagIsInfluencer==1)
	 {
	 	RedirectToPage("influencers.html");
	 }
	 else
	 {
	 	RedirectToPage("groupparticipants.html"); 
	 }
}
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
	 // Get all Query String Parameters
		 locationId= getUrlVars()["locationId"];
		 groupId = getUrlVars()["groupId"];
		 flagIsInfluencer=getUrlVars()["influencer"];
		 
		  if (typeof flagIsInfluencer === "undefined") {	
		  	flagIsInfluencer=0;
		  }
		    if (typeof groupId === "undefined") {	
		  	groupId=0;
		  }
		 
	
	 // Assign the Hindi Texts
	   
	  $('#btnBack').html('<br>'+PARTICIPANT_BUTTON_BACK);
	  $('#btnCaptureImage').html('<br>'+PARTICIPANT_BUTTON_CAPTUREIMAGE); 
	  $('#addEntrySubmit').html('<hr width="0">'+PARTICIPANT_BUTTON_ENTRYSUBMIT); 
	  
	  $('#lblFirstName').html('<br><strong>'+PARTICIPANT_LABEL_FIRSTNAME+'<strong>');
	  $('#lblLastName').html('<br><strong>'+PARTICIPANT_LABEL_LASTNAME+'<strong>');
	  
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
	
	// Populate the avaialble Influencers
	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('Select ID,PregnancyLevelID,NewMomLevelID from game ',[],InitializeDBParameters_success);    	
	     }
	     , transaction_error);
}
function InitializeDBParameters_success(tx,results)
{
	var len = results.rows.length;
	
	 for (var i=0; i<len; i++) {
	 	var game = results.rows.item(i);	
	 	PregnancyLevelID=game.PregnancyLevelID;
	 	NewMomLevelID=game.NewMomLevelID;
	 }
  // Populate the avaialble Influencers
   
		db.transaction(function(tx)
		     {	     	
		     	tx.executeSql('Select ID,UniqueID,FirstName,LastName from participants p where p.LocationID='+locationId+' and p.influencer=1 ',[],PopulateInfluencer_success);    	
		     }
		     , transaction_error);
   
}

function PopulateInfluencer_success(tx,results)
{
	var len = results.rows.length;
	var strLocationOptions='<div data-role="fieldcontain"><select name="influencerId" id="influencerId" data-native-menu="false"><option value="0" data-placeholder="true">&#2360;&#2361;&#2366;&#2351;&#2325; &#2330;&#2369;&#2344;&#2367;&#2351;&#2375;</option>';
	var strLocationClose='</select></div>';
	
	 for (var i=0; i<len; i++) {
	 	var influencer = results.rows.item(i);	 
	 	strLocationOptions +='<option value="'+influencer.UniqueID+'">'+influencer.FirstName+' '+influencer.LastName +'</option>';
	 }
	
	$('#influencerSelect').append(strLocationOptions+strLocationClose);
	$('#influencerSelect').trigger( "create" );
	
	
	var strCategoryOptions='<div data-role="fieldcontain"><select name="categoryId" id="categoryId" data-native-menu="false"><option value="0" data-placeholder="true">&#2358;&#2381;&#2352;&#2375;&#2339;&#2368; &#2330;&#2369;&#2344;&#2367;&#2351;&#2375;</option>';
	var strCategoryClose='</select></div>';
	strCategoryOptions +='<option value=1>'+PARTICIPANT_SELECT_CATEGORY_OPTION_PREGNANT+'</option>';
	strCategoryOptions +='<option value=2>'+PARTICIPANT_SELECT_CATEGORY_OPTION_NEWMOM+'</option>';
	strCategoryOptions +='<option value=3>'+PARTICIPANT_SELECT_CATEGORY_OPTION_PREGNANTANDNEWMOM+'</option>';
	
	
	$('#categorySelect').append(strCategoryOptions+strCategoryClose);
	$('#categorySelect').trigger( "create" );
	
	// Populate the Profile in case of Update
	if(flagIsInfluencer==1)
	{
		$('#categorySelect').hide();
		$('#influencerSelect').hide();		
	}
	
	if(flagIsUpdate==1)
		{
			var  sql = "select e.ID,e.FirstName, e.LastName, e.UniqueID,e.Level, e.Image,e.Category,e.InfluencerID,e.LocationID,e.GroupID,e.IsNew,e.IsUpdate "
  			  + 	" from Participants e " 
			  +  " where e.UniqueID=:uid ";
			  
	     db.transaction(function(tx)
		     {	     	
		     	tx.executeSql(sql,[uid],PopulateProfile_success);    	
		     }
		     , transaction_error);
		}
}

function PopulateLocation_success(tx,results){
	/*
	var len = results.rows.length;
	var strLocationOptions='<div data-role="fieldcontain"><label for="locationId" class="select">Choose Location</label><select name="locationId" id="locationId" data-native-menu="false"><option value="0" data-placeholder="true">Choose Location</option>';
	var strLocationClose='</select></div>';
	
	 for (var i=0; i<len; i++) {
	 	var location = results.rows.item(i);	 
	 	strLocationOptions +='<option value="'+location.ID+'">'+location.Name+'</option>';
	 }
	
	$('#locationSelect').append(strLocationOptions+strLocationClose);
	$('#locationSelect').trigger( "create" );	
	
	// Now Populate Groups
	
	  db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('Select ID,Name,LocationId from groups',[],PopulateGroup_success);    	
	     }
	     , transaction_error);
	     */
	
}
function PopulateGroup_success(tx,results){
	/*
	var len = results.rows.length;
	var strGroupOptions='<div data-role="fieldcontain"><select name="groupId" id="groupId" data-native-menu="false"><option value="0" data-placeholder="true">&#2360;&#2350;&#2370;&#2361; &#2325;&#2366; &#2330;&#2351;&#2344;</option>';
	var strGroupClose='</select></div>';
		
	 for (var i=0; i<len; i++) {
	 	var group = results.rows.item(i);	 
	 	strGroupOptions +='<option value="'+group.ID+'">'+group.Name+'</option>';
	 	GroupCollection[group.ID]=group.LocationId;
	 }
	
	$('#groupSelect').append(strGroupOptions+strGroupClose);
	$('#groupSelect').trigger( "create" );	
	
	 db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('Select ID,Name from levels',[],PopulateLevel_success);    	
	     }
	     , transaction_error);
	*/
}
function PopulateLevel_success(tx,results){
	/*
	var len = results.rows.length;
	var strLevelOptions='<div data-role="fieldcontain"><select name="level" id="level" data-native-menu="false"><option value="0" data-placeholder="true">&#2360;&#2381;&#2340;&#2352; &#2325;&#2366; &#2330;&#2351;&#2344;</option>';
	var strLevelClose='</select></div>';
		
	 for (var i=0; i<len; i++) {
	 	var level = results.rows.item(i);	 
	 	strLevelOptions +='<option value="'+level.ID+'">'+level.Name+'</option>';
	 }
	
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
		*/
}

// This function will populate the values in the form
function PopulateProfile_success(tx,results){
	
		var participant = results.rows.item(0);
		$('#uid').val(participant.UniqueID);
		$('#firstName').val(participant.FirstName);
		$('#lastName').val(participant.LastName);
		
		$('#categoryId').find("option[value='"+participant.Category+"']").attr("selected", true);
		$('#influencerId').find("option[value='"+participant.InfluencerID+"']").attr("selected", true);
		
		
		$('#categoryId').selectmenu("refresh", true);		
	    $('#categoryId').selectmenu("disable");
		
		$('#influencerId').selectmenu("refresh", true);		
	    $('#influencerId').selectmenu("disable");
	    
	    var photopath=window.rootFS.fullPath +"/photos/"+ participant.Image;
	    
	    $('#imgCaptured').attr('src',photopath);
	    
	 //	$('#locationId').find("option[value='"+participant.LocationID+"']").attr("selected", true);
	//	$('#groupId').find("option[value='"+participant.GroupID+"']").attr("selected", true);
	//	$('#level').find("option[value='"+participant.Level+"']").attr("selected", true);		
		// Disable the level field
		
				
	//	$('#locationId').selectmenu("refresh", true);
		
		//$('#groupId').val(participant.GroupID);
		//$('#groupId').attr('value', participant.GroupID);
	//	originalGroupId=participant.GroupID;
		originalImage=participant.Image;
		//$('#groupId').selectmenu("refresh", true);
	
		
	//	$('#level').selectmenu("refresh", true);		
	//	$('#level').selectmenu("disable");
		
		
					
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
		$('#busy').html(PARTICIPANT_MESSAGE_BUSY_UPDATERECORD);	
		db.transaction(UpdateEmployeeInDB);
	}
	else
	{
		$('#busy').html(PARTICIPANT_MESSAGE_BUSY_ADDRECORD);	
		db.transaction(addEmployeeInDB);	
	}
}
function UpdateEmployeeInDB(tx)
{		
	var updatedGroupId=groupId;

	if(flagIsInfluencer == 1)
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
		 if(flagIsInfluencer == 1)
		 {
		 	 RedirectToPage("influencers.html");
		 }
		 else
		 {
  			 RedirectToPage("groupparticipants.html");
  		 }
}, 1000);
	
}

function addEmployeeInDB(tx)
{	
	
	if($('#categoryId').val()==1 ||$('#categoryId').val()==3 )
	{		
		levelId = PregnancyLevelID;
	}
	else
	{
		levelId = NewMomLevelID;
	}	
	
	$('#busy').show();		
	var sql = "INSERT INTO Participants (FirstName,LastName,UniqueID,Image,Category,Influencer,InfluencerID,Payout,Level,Points,LocationID,GroupID,IsNew,IsUpdate,IsLevelCompleted) VALUES ('" + $('#firstName').val() +"','"
		+ $('#lastName').val() +"','" + $('#uid').val()+ "','"+ $('#uid').val() +".jpg" +"','" + $('#categoryId').val()
		+"','" + flagIsInfluencer + "','"+ $('#influencerId').val()+ "','0'" 
		+",'"+levelId +"','0','"+locationId+"','" + groupId+"','1','0','0')"; 
		
	
	tx.executeSql(sql,[],addEmployeeInDB_success,transaction_error);
	
	
	
}

function addEmployeeInDB_success(tx,results) {
	console.log("Employee Added"+results.insertId);
	
	insertedUniqueId=$('#uid').val();
	
	// Insert the performance of User in the Performance Table 
	// Get all the associated Objectives with the Level
	
	var sqlPerformance="select ID,Name,LevelId from objectives o"
			  +  " where o.LevelId= "+levelId;
			 
				
	if(flagIsInfluencer==0)
	{
		tx.executeSql(sqlPerformance, [], getObjectives_success);	
	}
	else
	{
		setTimeout(function(){ 	
		  	 RedirectToPage("influencers.html");
		  }, 1000);
	}
	
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
