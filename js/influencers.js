var db;
var dbCreated = false;
var filter='';
var locationId;
var groupId;
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
				var buttonAdd;	
				var buttonBack;	
				var buttonSearch;
				
				buttonAdd = document.getElementById('btnAdd');
				buttonBack = document.getElementById('btnBack');
				
				
		
				// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
				FastClick.attach(buttonAdd);	
				FastClick.attach(buttonBack);	
					
				
		
				buttonAdd.addEventListener('touchend', function(event) {
					RedirectToPage("addemployeenew.html");
				}, false);
				
				buttonBack.addEventListener('touchend', function(event) {
				 RedirectToPage("index.html"); 
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
    groupId= getUrlVars()["groupId"];
   // alert(groupId +' '+locationId);
    //$('#MainHeading').html('&#2346;&#2381;&#2352;&#2340;&#2367;&#2349;&#2366;&#2327;&#2367;&#2351;&#2379;&#2306;');	
	$('#btnAdd').html('<br>&#2346;&#2381;&#2352;&#2349;&#2366;&#2357;&#2358;&#2366;&#2354;&#2368; &#2332;&#2379;&#2396;&#2375; ');
	$('#btnBack').html('<br>&#2357;&#2366;&#2346;&#2360;');
		
	 db.transaction(GetParticipants, transaction_error);   
  
}

function Search()
{
	 filter= $('#txtSearch').val();
	 
	 db.transaction(SearchParticipant, transaction_error);	
}
function SearchParticipant(tx)
{
	 var  sql = "select p.ID,p.FirstName, p.LastName, p.UniqueID, p.Image,p.LocationID "
  			  + 	" from Participants p " 
  			  +  " where p.GroupID=:groupId "
			  +  " order by p.FirstName,p.LastName ";	;	
		
		
		tx.executeSql(sql, [groupId], GetParticipants_success);		
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

//alert($.md5('abc123'));
function GetParticipants(tx) {	 
	
	   var  sql = "select p.ID,p.FirstName, p.LastName, p.UniqueID, p.Image "
  			  + 	" from Participants p " 
  			  +  " where p.groupId=:groupId "
			  +  " order by p.FirstName,p.LastName ";	;	
		
		
		tx.executeSql(sql, [groupId], GetParticipants_success);			
		
}

function GetParticipants_success(tx, results) {
	$('#busy').hide();
    var len = results.rows.length;
   
    var photopath="/sdcard";
     $('#employeeList').append('<li data-role="list-divider"></li>');
     
    for (var i=0; i<len; i++) {
    	var participant = results.rows.item(i);
		
	 $('#employeeList').append('<li><a href="employeedetails.html?uid='+ participant.UniqueID +'&locationId='+locationId+'&groupId='+groupId+'" target="_self">' +
	 '<h2>'+ participant.FirstName + ' ' + participant.LastName+ '</h2>');
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
    window.location=pageUrl+"?locationId="+locationId+"&groupId="+groupId;
}



