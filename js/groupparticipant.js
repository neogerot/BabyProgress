var db;
var dbCreated = false;
var filter='';
var locationId;
var groupId;
var scroll = new iScroll('wrapper', { vScrollbar: false, hScrollbar:false, hScroll: false });

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
  
  // Assign Hindi Texts
  
	$('#btnAdd').html('<br>'+GROUP_BUTTON_ADD);
	$('#btnBack').html('<br>'+GROUP_BUTTON_BACK);
	$('#btnSearch').html('<br>'+GROUP_BUTTON_SEARCH);
	$('#txtSearch').attr("placeholder",GROUP_TEXTBOX_PLACEHOLDER_SEARCH);
	
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
	
	   var  sql = "select p.ID,p.FirstName, p.LastName, p.UniqueID, p.Image "
  			  + 	" from Participants p " 
  			  +  " where p.groupId=:groupId "
			  +  " order by p.FirstName,p.LastName ";	;	
		
		
		tx.executeSql(sql, [groupId], GetParticipants_success);			
		
}

function GetParticipants_success(tx, results) {
	$('#busy').hide();
	$('#employeeList').html('');
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

function RedirectToPage(pageUrl) {
	$('#busy').hide();
		
    window.location=pageUrl+"?locationId="+locationId+"&groupId="+groupId;
}



