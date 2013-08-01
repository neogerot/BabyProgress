var db;
var dbCreated = false;
var filter='';
var locationId;
var locationName;


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


//Add Button Events
window.addEventListener('load', function() {
				
				var buttonSynchronize;
				var buttonLogout ;
				
				buttonSynchronize = document.getElementById('btnSynchronize');
				buttonLogout  = document.getElementById('btnLogout'); 
				
		
				// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
				
				FastClick.attach(buttonSynchronize);
				FastClick.attach(buttonLogout);	
								
				buttonSynchronize.addEventListener('touchend', function(event) {
					RedirectToPage('synchronize.html');
				}, false);
  				
  				buttonLogout.addEventListener('touchend', function(event) {
						Logout();
					}, false);
				
				
			}, false);
			




document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {	
    db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);

    locationId= getUrlVars()["locationId"];  
    
	// Asign Hindi Texts
	$('#btnSynchronize').html('<br>'+INDEX_BUTTON_OPTION);
	$('#btnLogout').html('<br>'+INDEX_BUTTON_LOGOUT);
	$('#lblLocationName').html('<strong>'+INDEX_LABEL_LOCATIONNAME +':</strong>');
	
	
	
	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('select ID from events',[],CheckLoginStatus);	     	
	     }
	     , EventTable_error);      
  
}

function EventTable_error(tx, error)
{
	RedirectToPage('login.html');
}

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

function Logout()
{
	// Clear the value in the table that indicates the logged in status..and then redirect to the login page	
	db.transaction(function(tx)
			     {	     	
			     	tx.executeSql('delete from LoginStatus',[],Logout_success);	     	
			     }
			     , EventTable_error); 
	
}

function Logout_success()
{
	RedirectToPage('login.html');
}

function CheckLoginStatus(tx, results){
	 var len = results.rows.length;
	 
	    if(len==0)
	    {
	    	RedirectToPage('login.html');
	    }	
	    else
	    {
			db.transaction(function(tx)
			     {	     	
			     	tx.executeSql('select Status from LoginStatus',[],GetParticipantList);	     	
			     }
			     , EventTable_error); 
	    }
	    
}
function GetParticipantList(tx, results){
	 var len = results.rows.length;
	 
	    if(len>0)
	    {
	    	var loginStatus=results.rows.item(0);
	    	//alert(loginStatus.Status);
	    	if(loginStatus.Status==1)
	    	{
	    		 db.transaction(getEmployees, transaction_error);	
	    	}
	    	else
	    	{
	    		RedirectToPage('login.html');
	    	}
	    }	
	    else
	    {
			RedirectToPage('login.html');
	    }
}


function getEmployees(tx) {	 
	
	 /*
	   var  sql = "select e.ID,e.FirstName, e.LastName, e.UniqueID, e.Image,e.Level, e.Points,e.LocationID,e.GroupID,e.IsNew,e.IsUpdate,lev.Name as levelname,loc.Name as locationname,g.Name as groupname "
  			  + 	" from Participants e " 
  			  +    " join Locations loc on loc.ID=e.LocationID "
  			  +   " join Groups g on g.LocationId=loc.ID and e.GroupID=g.ID "
  			  +   " join Levels lev on e.level=lev.ID "
			  +  " where LOWER(e.FirstName) LIKE :filter OR LOWER(e.FirstName) LIKE :filter "
			  +  " order by e.FirstName,e.LastName ";	
				
	*/
	   var  sql = "select ID,Name,Size,LocationId "
  			  + 	" from Groups g " 
  			  +  " where g.LocationId=:locationId "
			  +  " order by g.ID ";	
		
		
		tx.executeSql(sql, [locationId], getEmployees_success);			
		
}

function getEmployees_success(tx, results) {
	$('#busy').hide();
    var len = results.rows.length;
   
    var photopath="/sdcard";
     
     
    for (var i=0; i<len; i++) {
    	var group = results.rows.item(i);
		
	 $('#employeeList').append('<a href="groupparticipants.html?groupId='+ group.ID + '&locationId='+locationId +'"  target="_self" style="text-decoration:none;"><li>' +
	 '<h2>'+ group.Name +'</h2></li></a>');
    }
    
   
    $('#employeeList').append('<a href="influencers.html?locationId='+locationId +'"  target="_self" style="text-decoration:none;"><li>' +
	 '<h2>'+INDEX_LABEL_INFLUENCER+'</h2></li></a>');
    
	
	  var  sql = "select ID,Name "
  			  + 	" from Locations loc " 
  			  +  " where loc.ID=:locationId ";
			  
	tx.executeSql(sql, [locationId], GetLocationName_success);		
}
function GetLocationName_success(tx,results)
{
	  var len = results.rows.length;
	  if(len>0)
	  {
	  	var location=results.rows.item(0);
	  	locationName=location.Name;
	  	$('#lblLocationName').append(locationName);
	  }
	  
}

function RedirectToPage(pageUrl) {
	$('#busy').hide();		
    window.location=pageUrl+"?locationId="+locationId;
}



