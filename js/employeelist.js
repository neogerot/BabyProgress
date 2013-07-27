var db;
var dbCreated = false;
var filter='';
var locationId;
var scroll = new iScroll('wrapper', { vScrollbar: false, hScrollbar:false, hScroll: false });

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


//Add Button Events
  window.addEventListener('load', function() {
				
				var buttonSynchronize;
				var buttonSearch;
				
				var buttonLogout ;
				
				buttonSynchronize = document.getElementById('btnSynchronize');
				buttonSearch = document.getElementById('btnSearch');
				
				buttonLogout  = document.getElementById('btnLogout'); 
				
		
				// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
				
				FastClick.attach(buttonSynchronize);	
								
				buttonSynchronize.addEventListener('touchend', function(event) {
					RedirectToPage('synchronize.html');
				}, false);
  				
  							
				buttonSearch.addEventListener('touchend', function(event) {
						Search();
					}, false);
					
				
					
				buttonLogout.addEventListener('touchend', function(event) {
						Logout();
					}, false);
				
				
			}, false);
			
window.addEventListener("orientationchange", function() {
   setTimeout(function(){
		scroll.refresh();
	});	 
}, false);



document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {	
    db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);

    locationId= getUrlVars()["locationId"];
    //$('#MainHeading').html('&#2346;&#2381;&#2352;&#2340;&#2367;&#2349;&#2366;&#2327;&#2367;&#2351;&#2379;&#2306;');	
	
	
	$('#btnSynchronize').html('<br>&#2357;&#2367;&#2325;&#2354;&#2381;&#2346;');
	$('#btnLogout').html('<br>&#2348;&#2306;&#2342; &#2325;&#2352;&#2375;&#2306;');
	$('#btnSearch').html('<br>&#2393;&#2379;&#2332;&#2375;');
	
	
	
	//alert('Index');
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

//alert($.md5('abc123'));
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
     $('#employeeList').append('<li data-role="list-divider"></li>');
     
    for (var i=0; i<len; i++) {
    	var group = results.rows.item(i);
		
	 $('#employeeList').append('<li><a href="groupparticipants.html?groupId='+ group.ID + '&locationId='+locationId +'"  target="_self">' +
	 '<h2>'+ group.Name +'</h2>');
    }
    
	setTimeout(function(){
		scroll.refresh();
	},100);
	//	db = null;
}

function populateDB(tx) {
 
 // alert('populateDB');
	$('#busy').show();
   // tx.executeSql('DROP TABLE IF EXISTS Participants');
	var sql = 
					"CREATE TABLE IF NOT EXISTS Participants ( "+
						"ID INTEGER PRIMARY KEY AUTOINCREMENT, " +		
						"FirstName VARCHAR(50), " +
						"LastName VARCHAR(50), " +
						"UniqueID VARCHAR(50), " +
						"Image VARCHAR(100), " + 
						"Level INTEGER, " +
						"Points INTEGER, " +
						"LocationID VARCHAR(10), " +						
						"GroupID VARCHAR(10), " +						
						"IsNew INTEGER, " +
						"IsUpdate INTEGER)";
		

	 tx.executeSql(sql);
	 
	/*
	tx.executeSql("INSERT INTO grantee (firstName,lastName,uniqueID,image,level,points,location,state,localgroup,city) VALUES ('Vikas','Sharma','bcc9bb8b-6956-ac35-373d-eba0fd342bf3','vikas_sharma.jpg',1,100,'Chandni Chowk','Delhi','SD','Delhi')");
    tx.executeSql("INSERT INTO grantee (firstName,lastName,uniqueID,image,level,points,location,state,localgroup,city) VALUES ('Steven','Wells','a01718f3-178f-43ec-9dc5-a45d2f784e9d','steven_wells.jpg',3,250,'Mount Lukens','L.A','SD','California')");
    */
}
function RedirectToPage(pageUrl) {
	$('#busy').hide();
	//alert("Employee Deleted");		
    window.location=pageUrl;
}

function Search()
{
	 filter= $('#txtSearch').val();
	// alert(filter);
	 $('#employeeList').text('');
	 db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);
	 db.transaction(getEmployees, transaction_error);
	
}

function convertToEntities(inputStr) {
  var tstr = inputStr;
  var bstr = '';
  for(i=0; i<tstr.length; i++)
  {
    if(tstr.charCodeAt(i)>127)
    {
      bstr += '&#' + tstr.charCodeAt(i) + ';';
    }
    else
    {
      bstr += tstr.charAt(i);
    }
  }
   return bstr;
}


