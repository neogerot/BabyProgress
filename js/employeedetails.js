var scroll = new iScroll('wrapper', { vScrollbar: false, hScrollbar:false, hScroll: false });

var uid = getUrlVars()["uid"];
var groupId,locationId;
//alert('id:'+id);
var db;
var IsCurrentLevelCompleted=0;
var currentLevel;
var totalPoints;

//----------------------Mutex

document.addEventListener("deviceready", onDeviceReady, false);

window.addEventListener('load', function() {
		var testB,buttonSubmit;	
		testB = document.getElementById('btnBack');
		buttonSubmit=	document.getElementById('btnSubmit'); 
		// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
		//FastClick.attach(testB);		

		testB.addEventListener('touchend', function(event) {
			 RedirectToPage('groupparticipants.html'); 
		}, false);
		
		buttonSubmit.addEventListener('touchend', function(event) {
			SubmitPerformance();
		}, false);
		
	}, false);	
    	
window.addEventListener("orientationchange", function() {
   setTimeout(function(){
		scroll.refresh();
	});	 
}, false);

/*  File System 
   * 
   */
  function gotFS(fileSystem) {
    console.log("got filesystem");
    // save the file system for later access
   // console.log(fileSystem.root.fullPath);
    window.rootFS = fileSystem.root;	
	//alert("got filesystem");	   
}

  document.addEventListener('deviceready', function() {                
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}, false);
  

function onDeviceReady() {
	console.log("opening database");
	
	$('#btnBack').html('<br>'+PARTICIPANTDETAIL_BUTTON_BACK);
	$('#btnSubmit').html('<hr width="0">'+PARTICIPANTDETAIL_BUTTON_ENTRYSUBMIT);
	
	locationId= getUrlVars()["locationId"];
    groupId= getUrlVars()["groupId"];
    db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);
	console.log("database opened");
    db.transaction(getEmployee, transaction_error);
}

function fail()
{
   
}

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

function getEmployee(tx) {
	$('#busy').show();	
		
   var  sql = "select e.ID,e.FirstName, e.LastName, e.UniqueID, e.Image,e.Level, e.Points,e.LocationID,e.GroupID,e.IsNew,e.IsUpdate,lev.Name as levelname,lev.LevelNo,loc.Name as locationname,g.Name as groupname "
  			  + 	" from Participants e " 
  			  +    " join Locations loc on loc.ID=e.LocationID "
  			  +   " join Groups g on g.LocationId=loc.ID and e.GroupID=g.ID "
  			  +   " join Levels lev on e.level=lev.ID "
			  +  " where e.UniqueID=:uid "
			  + " order by e.LastName, e.FirstName";
				
	tx.executeSql(sql, [uid], getEmployee_success);
}

function getEmployee_success(tx, results) {
	//alert('employee details retreived');
	$('#busy').hide();
	
	var participant = results.rows.item(0);
	
	var photopath=window.rootFS.fullPath +"/photos/"+ participant.Image;//"/sdcard";
	
	$('#employeePic').attr('src', photopath);
	$('#participantEdit').attr('href',"addemployeenew.html?uid="+ participant.UniqueID+"&locationId="+locationId+"&groupId="+groupId); 	
	$('#fullName').text(participant.FirstName + ' ' + participant.LastName);
	//$('#level').html("<strong>Level:</strong>"+employee.levelname + ",<strong>Points:</strong>"+ employee.Points);
	
	//$('#level').html("<hr><h2>"+PARTICIPANTDETAIL_LABEL_POINTS+":</strong>"+ participant.Points +"</h2>");
	$('#location').html("<hr><h3>"+participant.locationname
	 +'<hr>'+ participant.groupname +"</h3>" );
	//$('#btnEditDetails').attr('href',"addemployeenew.html?uid="+ employee.UniqueID); 	
	//alert("addemployeenew.html?uid="+ employee.UniqueID);
	currentLevel=participant.LevelNo;
	db.transaction(getObjectives, transaction_error);
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

// load Objectives of the Participant
function getObjectives(tx) {
	$('#busy').show();
	var  sql = "select per.ID,obj.Name,obj.PlusPoints,obj.MinusPoints,obj.Mandatory,obj.Sequence,per.Completed " +
				"from Participants p  " +
				" JOIN Performance per on p.UniqueID = per.UniqueID " +
				" JOIN Objectives obj on per.ObjectiveId = obj.ID " +
				" where p.UniqueID=:uid " +
				" order by obj.Sequence";
				
	tx.executeSql(sql, [uid], getObjectives_success);	
}

function getObjectives_success(tx, results) {
	//alert('employee details retreived');
	$('#busy').hide();
	//alert('getObjectives_success');
	var len = results.rows.length;
	// Traverse all the Objectives	
	 
	 $('#objectives').append('<li data-role="list-divider"><strong>'+PARTICIPANTDETAIL_LABEL_CURRENTOBJECTIVES+':</strong> <span class="ui-li-count">'+len+'</span></li>');
	 totalPoints=0;
	 for (var i=0; i<len; i++) {
	 	var objective = results.rows.item(i);	 	
	 	
	if(objective.Completed==1)
	{
     	totalPoints +=objective.PlusPoints;
	}
	else
	{
		totalPoints -=objective.MinusPoints;
	}
	 $('#objectives').append('<li><fieldset data-role="controlgroup" data-type="horizontal"><input type="checkbox" name="'+objective.ID +'" id="'+ objective.ID 
	 +'"><label for="'+objective.ID+'">'+objective.Name+' (<small>+'+objective.PlusPoints+',-'+objective.MinusPoints+'</small>)</label></fieldset></li>');
	 
 
	 // Set value of status of objective
	$('#'+objective.ID).prop('checked', objective.Completed);


	 } // End of for loop
	 
	if(totalPoints<0)
	{
		totalPoints=0;
	}
	
	$('#level').html("<hr><h2>"+PARTICIPANTDETAIL_LABEL_POINTS+":</strong>"+ totalPoints +"</h2>");
	 
	var lblObjectiveSave="&nbsp;";
	$('#objectives').append('<li data-role="list-divider"><strong>'+lblObjectiveSave+'</strong></li>');
	
	
	$('#objectives').trigger( "create" );	
	
	
	setTimeout(function(){
		scroll.refresh();
	});
	
		
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

function deleteEmployee(){
      db.transaction(deleteEmployeeDB, transaction_error);
}
function deleteEmployeeDB(tx)
{
    $('#busy').show();
	var sql = "delete from Participants where uniqueID=?";
	tx.executeSql(sql, [uid], deleteEmployee_success);
}

function deleteEmployee_success(tx, results) {
	$('#busy').hide();	
    window.location="index.html";
}

function RedirectToPage(pageUrl) {
	$('#busy').hide();
	//alert("Employee Deleted");		
    window.location=pageUrl+"?groupId="+groupId+"&locationId="+locationId;
}

// This function will update the performance of the participant 
function SubmitPerformance()
{
	db.transaction(SubmitPerformanceDB, transaction_error,Submit_success);	
}

function Submit_success(tx)
{
		
	 $('#objectives').html("");  // clear the scroller
	 $('#submitbutton').hide();  // hide the submit button
	 
	 
	 // Check if the current level is completed for the participant..
	db.transaction(CheckCurrentLevelStatus, transaction_error);
	 // Get the next Level Objectives..	 
	//db.transaction(GetNextObjectives, transaction_error);
}
function CheckCurrentLevelStatus(tx)
{	
	// Get all the objectives of the Participant where the status is not completed..
	var sqlCheckLevelStatus=    "select per.ID,obj.Name,obj.PlusPoints,obj.MinusPoints,obj.Mandatory,obj.Sequence,per.Completed " +
								"from Participants p  " +
								" JOIN Performance per on p.UniqueID = per.UniqueID " +
								" JOIN Objectives obj on per.ObjectiveId = obj.ID " +
								" where p.UniqueID=:uid " + " and obj.Mandatory=1 and per.Completed=0 "
								" order by obj.Sequence";
				
							
	tx.executeSql(sqlCheckLevelStatus,[uid],UpdateLevelCompletedStatus);		
					
} 
function UpdateLevelCompletedStatus(tx,results)
{	
	var len = results.rows.length;
	IsCurrentLevelCompleted=0;
	if(len==0)
	{
		// In case of no objective pending for the Participant the level is completed..
		IsCurrentLevelCompleted=1;
	}
	// Logic to check whether the Level is completed
	
	// Update IsLevelCompleted column of the Participant		  
	var sqlUpdateLevelCompleteStatus = "update Participants set IsLevelCompleted=:IsCurrentLevelCompleted "
										+ " where UniqueID=:uid";
			
	tx.executeSql(sqlUpdateLevelCompleteStatus,[IsCurrentLevelCompleted,uid],GetNextObjectives);
		
}
function GetNextObjectives(tx)
{
   currentLevel++;	
   var sqlNextLevel;	 
   if(IsCurrentLevelCompleted==1)
   {
	   sqlNextLevel = "select obj.ID,obj.Name,obj.PlusPoints,obj.MinusPoints,obj.Mandatory,obj.Sequence " +
				"from Objectives obj " +	
				" JOIN Levels lev on lev.ID = obj.LevelId " +
				" where lev.LevelNo=" +currentLevel +
				" order by obj.Sequence"; 
				 	
			 tx.executeSql(sqlNextLevel,[],GetNextObjectives_success);
	}
	 else
	 {
		  sqlNextLevel = "select per.ID,obj.Name,obj.PlusPoints,obj.MinusPoints,per.Completed " +
				"from Participants p  " +
				" JOIN Performance per on p.UniqueID = per.UniqueID " +
				" JOIN Objectives obj on per.ObjectiveId = obj.ID " +
				" where p.UniqueID=:uid and per.Completed=0 " +
				" order by obj.Sequence";
			tx.executeSql(sqlNextLevel,[uid],GetNextObjectives_success);
	 }
}
function SubmitPerformanceDB(tx)
{
	
	var hashtable = {};		
	$('#objectives input').each(function() {
   // selected.push($(this).attr('name')+':'+($(this).prop('checked')==true?1:0));
  	  hashtable[$(this).attr('name')]=($(this).prop('checked')==true?1:0);
	});
	
	
for ( key_name in hashtable){
	// Update each performance in database
	//alert(hashtable[key_name]);
	var sql = "update Performance set Completed=:completedstatus "
				+ " where ID=:id";
	tx.executeSql(sql, [hashtable[key_name],key_name], SubmitPerformanceDB_success);
	
	
}

// Update Participant Status of IsUpdate as 1 for uid
   var sqlupdateParticipant = "update Participants set IsUpdate='1' "
				+ " where UniqueID=:uid";
	tx.executeSql(sqlupdateParticipant, [uid], SubmitPerformanceDB_success);
	/*
	
	*/
}


function SubmitPerformanceDB_success(tx)
{
  // Do Nothing here
  
}

function GetNextObjectives_success(tx,results)
{
   var len = results.rows.length;
  //alert(len);
	// Traverse all the Objectives	
	
	 $('#objectives').append('<li data-role="list-divider"><strong>'+PARTICIPANTDETAIL_LABEL_NEXTOBJECTIVES+':</strong> <span class="ui-li-count">'+len+'</span></li>');
	 
	 for (var i=0; i<len; i++) {
	 	var objective = results.rows.item(i);	 
	 	
	 	 $('#objectives').append('<li><fieldset data-role="controlgroup" data-type="horizontal"><input type="checkbox" name="'+objective.ID +'" id="'+ objective.ID 
	 +'" readonly=true><label for="'+objective.ID+'">'+objective.Name+' (<small>+'+objective.PlusPoints+',-'+objective.MinusPoints+'</small>)</label></fieldset></li>');
	 
 	
	 }	
	 
	 $('#objectives').trigger( "create" );	
	
	
	setTimeout(function(){
		scroll.refresh();
	});
	
	
	
}
