

var uid = getUrlVars()["uid"];
var groupId,locationId;

var db;
var IsCurrentLevelCompleted=0;
var currentLevel;
var InitialLevelId;
var ServerPoints;
var totalPoints;

//----------------------Mutex------------------------------------------------------------------------------------

document.addEventListener("deviceready", onDeviceReady, false);

window.addEventListener('load', function() {
		var testB,buttonSubmit,buttonSkip;	
		testB = document.getElementById('btnBack');
		buttonSubmit=	document.getElementById('btnSubmit'); 
		buttonResetPerformance=document.getElementById('btnResetPerformance'); 
		buttonSkip=document.getElementById('btnSkip'); 
		
		// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
		//FastClick.attach(testB);		

		testB.addEventListener('touchend', function(event) {
			 RedirectToPage('groupparticipants.html'); 
		}, false);
		
		buttonSubmit.addEventListener('touchend', function(event) {
			SubmitPerformance();
		}, false);
		
		buttonResetPerformance.addEventListener('touchend', function(event) {
			ResetPerformance();
		}, false);
		
		buttonSkip.addEventListener('touchend', function(event) {
			SkipLevel();
		}, false);
		
		
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
	$('#btnSkip').html('<hr width="0">'+PARTICIPANT_BUTTON_SKIPLEVEL);
	$('#btnResetPerformance').html('<hr width="0">'+PARTICIPANTDETAIL_BUTTON_RESETPERFORMANCE +'<hr width="0">');
	$('#lblPayout').html('<br><h2>'+PARTICIPANTDETAIL_LABEL_PAYOUT+'</h2>');
	
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

function SkipLevel()
{
  // Mark the IsSkip field of the performance of the participant as 1 for this level
  // And insert the next level objectives 	 
  //alert(currentLevel);
   $('#objectives').html("");  // clear the objectives
   db.transaction(SkipCurrentLevel, transaction_error,MoveToNextObjectives);
}

function MoveToNextObjectives()
{
	  db.transaction(GetNextObjectives, transaction_error);
}

function SkipCurrentLevel(tx)
{
	var sqlSkipCurrentLevel = "Select per.ID from Performance per "
    +" JOIN Participants p ON p.UniqueID=per.UniqueID " 
    +" JOIN Levels lev ON lev.ID=p.Level "
    +" JOIN Objectives obj ON obj.LevelId=lev.ID and obj.ID=per.ObjectiveID "
    +" WHERE p.UniqueID='" + uid +"' and lev.LevelNo="+currentLevel ;
	
	tx.executeSql(sqlSkipCurrentLevel,[],SkipCurrentLevel_success);
}

function SkipCurrentLevel_success(tx,results)
{
	 IsCurrentLevelCompleted=1;
	 var len = results.rows.length;
	  for (var i=0; i<len; i++) {
	  		var performance = results.rows.item(i);	
	  		var sqlUpdatePerformanceSkipStatus = "update Performance  set IsSkip=1 "
										+ " where ID=" + performance.ID;
			tx.executeSql(sqlUpdatePerformanceSkipStatus, [], SubmitPerformanceDB_success);	
	  }
}


function ResetPerformance()
{
	// Reset the performance of the participant to the initial one
	
    $('#objectives').html("");  // clear the objectives
	db.transaction(ResetObjectivesState, transaction_error);
	   
}
function ResetObjectivesState(tx)
{
	var sqlUpdateObjectivesState= "update Participants set Level=InitialLevel "
										+ " where UniqueID=:uid";
			
	tx.executeSql(sqlUpdateObjectivesState,[uid],DeleteParticipantObjectives);
}

function DeleteParticipantObjectives(tx)
{
	var sqlDeleteObjectives= "delete from Performance "+		
							 " where UniqueID=:uid";
	tx.executeSql(sqlDeleteObjectives,[uid],GetInitialLevel);
}

function GetInitialLevel(tx,results)
{
	var sqlGetInitialLevel = "select lev.LevelNo " +
				"from Levels lev " +				
				" where lev.ID="+InitialLevelId;				
	
	tx.executeSql(sqlGetInitialLevel,[],SetInitialLevel);
}
function SetInitialLevel(tx,results)
{
	var participantInitialLevel=results.rows.item(0);	
	currentLevel=participantInitialLevel.LevelNo;
	alert(PARTICIPANTDETAIL_MESSAGE_RESETPERFORMANCE);
	db.transaction(SelectNextObjectives, transaction_error);
}

function getEmployee(tx) {
	$('#busy').show();	
		
   var  sql = "select e.ID,e.FirstName, e.LastName, e.UniqueID, e.Image,e.Level,e.InitialLevel,e.Points,e.LocationID,e.GroupID,e.Payout,e.IsNew,e.IsUpdate,lev.Name as levelname,lev.LevelNo,loc.Name as locationname,g.Name as groupname "
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
	$('#location').html('<hr><h3>'+ participant.groupname +'</h3>' );
	//$('#btnEditDetails').attr('href',"addemployeenew.html?uid="+ employee.UniqueID); 	
	//alert("addemployeenew.html?uid="+ employee.UniqueID);
	IsCurrentLevelCompleted=0;
	currentLevel=participant.LevelNo;
	InitialLevelId=participant.InitialLevel;
	ServerPoints=participant.Points;
	$('#payout').val(participant.Payout);
	db.transaction(getObjectives, transaction_error);
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

// load Objectives of the Participant
function getObjectives(tx) {
	$('#busy').show();
	var  sql = "select per.ID,obj.Name,obj.PlusPoints,obj.MinusPoints,obj.Mandatory,obj.Sequence,p.Points,per.Completed " +
				"from Participants p  " +
				" JOIN Performance per on p.UniqueID = per.UniqueID " +
				" JOIN Objectives obj on per.ObjectiveId = obj.ID " +
				" JOIN Levels lev on lev.ID = obj.LevelId " +
				" where p.UniqueID=:uid and lev.LevelNo=:currentLevel " +
				" order by obj.Sequence";
				
	tx.executeSql(sql, [uid,currentLevel], getObjectives_success);	
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
	 	if(i==0)
	 	{
	 	   totalPoints=objective.Points;
	 	}
	 	
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
	
	//$('#level').html("<hr><h2>"+PARTICIPANTDETAIL_LABEL_POINTS+":</strong>"+ totalPoints +"</h2>");
	 
		
	$('#objectives').trigger( "create" );	
	
	
	// Get Total Points to display after the successful update of objectives..
	 
	 var sqlTotalPoints = "Select (SUM(CASE Completed WHEN 1 THEN PlusPoints ELSE -MinusPoints END)+ Max(p.Points)) as Total from Participants p "
	   						 +" JOIN Performance per on p.UniqueID = per.UniqueID "
	  						  + "JOIN Objectives obj on per.ObjectiveId = obj.ID "
	   							 +" where p.UniqueID=:uid";
	 tx.executeSql(sqlTotalPoints, [uid], UpdateScore);			
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

// This method will be called after updating all the current Objectives
// It will check if the current level is completed for the participant
// And in case level is completed do further actions of level changing locally 
function Submit_success(tx)
{
		
	 $('#objectives').html("");  // clear the objectives
	 // $('#submitbutton').hide();  // hide the submit button
	 	 
	 // Check if the current level is completed for the participant..
	  db.transaction(CheckCurrentLevelStatus, transaction_error);
	 // Get the next Level Objectives..	 
	
}

function CheckCurrentLevelStatus(tx)
{	
	// Get all the objectives of the Participant where the status is not completed..
	var sqlCheckLevelStatus=    "select per.ID,obj.Name,obj.PlusPoints,obj.MinusPoints,obj.Mandatory,obj.Sequence,per.Completed " +
								"from Participants p  " +
								" JOIN Performance per on p.UniqueID = per.UniqueID " +
								" JOIN Objectives obj on per.ObjectiveId = obj.ID " +
								" JOIN Levels lev on lev.ID = obj.LevelId " +
								" where p.UniqueID=:uid " + " and obj.Mandatory=1 and per.Completed=0 and lev.LevelNo=:currentLevel " +
								" order by obj.Sequence";
				
							
	tx.executeSql(sqlCheckLevelStatus,[uid,currentLevel],UpdateLevelCompletedStatus);		
					
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
	var payout=$('#payout').val();
	// Update Payout column of the Participant		  
	var sqlUpdateLevelCompleteStatus = "update Participants set Payout=:payout "
										+ " where UniqueID=:uid";
			
	tx.executeSql(sqlUpdateLevelCompleteStatus,[payout,uid],GetNextObjectives);
		
}

function GetNextObjectives(tx)
{
   
   var sqlNextLevel;	 
   if(IsCurrentLevelCompleted==1)
   {
   	   // Now Insert the new Level Performance for this Participant and then populate the same
   	   currentLevel++;	
   	   // Insert the performance of User in the Performance Table 
   	  
   	   sqlNextLevel = "select lev.ID " +
				"from Levels lev " +				
				" where lev.LevelNo=:currentlevel ";				
				 	
	   tx.executeSql(sqlNextLevel,[currentLevel],UpdateParticipantLevel);
   }
  else
   {
		  sqlNextLevel = "select per.ID,obj.Name,obj.PlusPoints,obj.MinusPoints,per.Completed " +
				"from Participants p  " +
				" JOIN Performance per on p.UniqueID = per.UniqueID " +
				" JOIN Objectives obj on per.ObjectiveId = obj.ID " +
				" JOIN Levels lev on lev.ID = obj.LevelId " +
				" where p.UniqueID=:uid and per.Completed=0 and lev.LevelNo=:currentlevel" +
				" order by obj.Sequence";
			tx.executeSql(sqlNextLevel,[uid,currentLevel],GetNextObjectives_success);
   }
}

// This function will update the Level in the Participant Table
function UpdateParticipantLevel(tx,results)
{
	var len = results.rows.length;
	if(len>0)
	{
			var nextLevel = results.rows.item(0);
			tx.executeSql("update Participants set Level="+nextLevel.ID+ " where UniqueID=:uid",[uid],SelectNextObjectives);    			   
	}			
}

// This function will select the next objectives in the Performance table
function SelectNextObjectives(tx)
{
   var sqlNextLevel = "select obj.ID,obj.Name,obj.PlusPoints,obj.MinusPoints,obj.Mandatory,obj.Sequence " +
				"from Objectives obj " +	
				" JOIN Levels lev on lev.ID = obj.LevelId " +
				" where lev.LevelNo=" +currentLevel +
				" order by obj.Sequence"; 
				 	
   tx.executeSql(sqlNextLevel,[],InsertNextObjectives);
}

// This function will insert the next objectives in the Performance table
function InsertNextObjectives(tx,results)
{
	var len = results.rows.length;
		
	for (var i=0; i<len; i++) {
		var objective = results.rows.item(i);	 
			
		var sqlObjective="INSERT INTO Performance (UniqueID,ObjectiveID,Completed,IsSkip) VALUES ('" + uid +"','"
		+ objective.ID +"',"+ "'0','0')"; 	
			       
		tx.executeSql(sqlObjective);		
	}
	
	db.transaction(getEmployee, transaction_error);		      
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
	
	
	
	 // Get Total Points to display after the successful update of objectives..
	 
	 var sqlTotalPoints = "Select (SUM(CASE Completed WHEN 1 THEN PlusPoints ELSE -MinusPoints END)+ Max(p.Points)) as Total from Participants p "
	   						 +" JOIN Performance per on p.UniqueID = per.UniqueID "
	  						  + "JOIN Objectives obj on per.ObjectiveId = obj.ID "
	   							 +" where p.UniqueID=:uid"
	   							 +" and per.IsSkip<>1";
	 tx.executeSql(sqlTotalPoints, [uid], UpdateScore);	 
  
	
}
function UpdateScore(tx,results)
{
	 var len = results.rows.length;
	 if(len>0)
	 {	 	
		var performance=results.rows.item(0);
		totalPoints = performance.Total-$('#payout').val();
		totalPoints=totalPoints>0?totalPoints:0
		$('#level').html("<hr><h2>"+PARTICIPANTDETAIL_LABEL_POINTS_PREVIOUS+ ":" + ServerPoints + "<hr>"+ PARTICIPANTDETAIL_LABEL_POINTS+":"+ totalPoints + "</h2>");
	}
}
