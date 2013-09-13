

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
window.addEventListener('load', function() {
		
		var testB,buttonSubmit;	
		testB = document.getElementById('btnBack');
		buttonSubmit=	document.getElementById('btnPregnantSubmit'); 
		buttonResetPerformance=document.getElementById('btnNewMomSubmit'); 
		// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
		//FastClick.attach(testB);		

		testB.addEventListener('touchend', function(event) {
			 RedirectToPage('groupparticipants.html'); 
		}, false);
		/*
		buttonSubmit.addEventListener('touchend', function(event) {
			SelectPregnant();
		}, false);
		
		buttonResetPerformance.addEventListener('touchend', function(event) {
			SelectNewMom();
		}, false);
		
		*/
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
	
	//alert(uid);
	
	console.log("opening database");
	
	$('#btnBack').html('<br>'+PARTICIPANTDETAIL_BUTTON_BACK);
	
	$('#btnPregnantSubmit').html('<hr width="0">'+SELECTPARTICIPANTPROFILE_BUTTON_PREGNANT);
	$('#btnNewMomSubmit').html('<hr width="0">'+SELECTPARTICIPANTPROFILE_BUTTON_NEWMOM +'<hr width="0">');
	
	
	locationId= getUrlVars()["locationId"];
    groupId= getUrlVars()["groupId"];
  
   //alert(locationId);
  // alert(groupId);
   
    db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);
	console.log("database opened");
    db.transaction(GetParticipantProfiles, transaction_error);
    
}

function fail()
{
   
}

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

function SelectPregnant()
{
	// Select the Pregnant Profile
	//alert('Pregnant Profile Selected');
}
// This function will update the performance of the participant 
function SelectNewMom()
{
	//alert('NewMom Profile Selected');
}

function GetParticipantProfiles(tx) {
	$('#busy').show();	
		
   var  sql = "select e.UniqueID, e.Category "
  			  + 	" from Participants e "    
			  +  " where e.UniqueID=? or e.ParentUniqueID=?"
			  + " order by e.Category";
				
	tx.executeSql(sql, [uid,uid], GetParticipantProfiles_success);
}

function GetParticipantProfiles_success(tx, results) {
	//alert('employee details retreived');
	$('#busy').hide();
	var len = results.rows.length;
	if(len>0)
	{
		var urlToRedirect="employeedetails.html?uid=";
		var profileNewMom = results.rows.item(0);
		var profilePregnant= results.rows.item(1);
		$('#btnPregnantSubmit').attr('href',urlToRedirect+ profilePregnant.UniqueID +'&locationId='+locationId+'&groupId='+groupId); 
		$('#btnNewMomSubmit').attr('href',urlToRedirect+ profileNewMom.UniqueID +'&locationId='+locationId+'&groupId='+groupId); 		
	}
	
}

function RedirectToPage(pageUrl) {
	$('#busy').hide();
		
    window.location=pageUrl+"?locationId="+locationId+"&groupId="+groupId;
}
