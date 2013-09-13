var db;
var dbCreated = false;
var filter='';
var locationId;
var groupId;
var locationName;
var groupName;


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
				var buttonAdd;	
				var buttonBack;	
				var buttonSearch;
				
				buttonAdd = document.getElementById('btnAdd');
				buttonBack = document.getElementById('btnBack');
				buttonSearch = document.getElementById('btnSearch');
				
		
				// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
				FastClick.attach(buttonAdd);	
				FastClick.attach(buttonBack);	
				FastClick.attach(buttonSearch);	
				
		
				buttonAdd.addEventListener('touchend', function(event) {
					RedirectToPage("addemployeenew.html");
				}, false);
				
				buttonBack.addEventListener('touchend', function(event) {
				 RedirectToPage("index.html"); 
			}, false);
			
			buttonSearch.addEventListener('touchend', function(event) {
						Search();
					}, false);
					
				
			
				
			}, false);
		




document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {	
    db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);

    locationId= getUrlVars()["locationId"];
    groupId= getUrlVars()["groupId"];
  
  // Assign Hindi Texts
  
	$('#btnAdd').html('<br>'+GROUP_BUTTON_ADD);
	$('#btnBack').html('<br>'+GROUP_BUTTON_BACK);
	$('#btnSearch').html('<br>'+GROUP_BUTTON_SEARCH);
	$('#txtSearch').attr("placeholder",GROUP_TEXTBOX_PLACEHOLDER_SEARCH);
	
	
   var  sql = "select loc.Name as locationName,g.Name as groupName "
  			  + 	" from Locations loc " 
  			  +		" join groups g on loc.ID=g.locationID "
  			  +  " where loc.ID=:locationId and g.ID=:groupId";
			  
   db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql, [locationId,groupId], GetLocationName_success);	     	
	     }
	     , EventTable_error); 
	
}

function GetLocationName_success(tx,results)
{
	  var len = results.rows.length;
	  if(len>0)
	  {
	  	var location=results.rows.item(0);
	  	locationName=location.locationName;
	  	groupName=location.groupName;	     	
	  }
	  
	 db.transaction(GetParticipants, transaction_error);    
}

function Search()
{
	 filter= $('#txtSearch').val().toLowerCase();
	 
	 db.transaction(SearchParticipant, transaction_error);	
}
function SearchParticipant(tx)
{
	 var  sql = "select p.ID,p.FirstName, p.LastName, p.UniqueID, p.Image,p.LocationID "
  			  + 	" from Participants p " 
  			  +  " where p.GroupID="+ groupId 
  			  + " and (LOWER(p.firstName) LIKE :filter OR LOWER(p.lastName) LIKE :filter) and p.Influencer=0"
			  +  " order by p.FirstName,p.LastName ";
		
		
		tx.executeSql(sql, ["%"+filter+"%"], GetParticipants_success);		
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


function GetParticipants(tx) {	 
	
	   var  sql = "select p.ID,p.FirstName, p.LastName, p.UniqueID,p.ParentUniqueID, p.Image,p.Category "
  			  + 	" from Participants p " 
  			  +  " where p.groupId=:groupId and (p.ParentUniqueID=0 or p.ParentUniqueID is null )"
			  +  " order by p.FirstName,p.LastName ";	;	
		
		
		tx.executeSql(sql, [groupId], GetParticipants_success);		
		
		
}

function GetParticipants_success(tx, results) {
	$('#busy').hide();
	$('#employeeList').html('');
    var len = results.rows.length;
   
    var photopath="/sdcard";
     $('#employeeList').append('<li data-role="list-divider">'+'<strong>'+GROUP_LABEL_GROUPLOCATIONNAME +': </strong>' + groupName + '(' +locationName+ ')</li>');
     
    for (var i=0; i<len; i++) {
    	var participant = results.rows.item(i);
    	var urlToRedirect="employeedetails.html?uid=";
		if(participant.Category==3)
		{
			//alert(participant.UniqueID+ 'It is null');
			urlToRedirect="selectprofile.html?uid=";
		}
		
	 $('#employeeList').append('<a href='+urlToRedirect+ participant.UniqueID +'&locationId='+locationId+'&groupId='+groupId+' target="_self" style="text-decoration:none;"><li>' +
	 '<h2>'+ participant.FirstName + ' ' + participant.LastName+ '</h2></li></a>');
    }
    
	
}

function RedirectToPage(pageUrl) {
	$('#busy').hide();
		
    window.location=pageUrl+"?locationId="+locationId+"&groupId="+groupId;
}



