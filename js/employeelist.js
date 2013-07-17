var db;
var dbCreated = false;
var filter='';
var scroll = new iScroll('wrapper', { vScrollbar: false, hScrollbar:false, hScroll: false });

//Add Button Events
  window.addEventListener('load', function() {
				var buttonAdd;	
				var buttonSynchronize;
				var buttonSearch;
				buttonAdd = document.getElementById('btnAdd');
				buttonSynchronize = document.getElementById('btnSynchronize');
				buttonSearch = document.getElementById('btnSearch');
		
				// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
				FastClick.attach(buttonAdd);	
				FastClick.attach(buttonSynchronize);			
		
				buttonAdd.addEventListener('touchend', function(event) {
					RedirectToPage('addemployeenew.html');
				}, false);
				
				buttonSynchronize.addEventListener('touchend', function(event) {
					RedirectToPage('synchronize.html');
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
	
    if (dbCreated)
	{
	   alert('if dbCreated');
       db.transaction(getEmployees, transaction_error);
	}
    else
	{
		//alert('else dbCreated');
    	db.transaction(populateDB, transaction_error, populateDB_success);
	}
}

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

function populateDB_success() {
	//alert('populateDB_success');
	dbCreated = true;	
    db.transaction(getEmployees, transaction_error);
}

function getEmployees(tx) {
	   
	   var sql;
	
	    sql = "select e.ID,e.FirstName, e.LastName, e.UniqueID, e.Image,e.Level, e.Points,e.LocationID,e.GroupID,e.IsNew,e.IsUpdate " + 
				"from Participants e " +
				"where LOWER(e.FirstName) LIKE :filter OR LOWER(e.FirstName) LIKE :filter ";		
				
		tx.executeSql(sql, ["%"+filter+"%"], getEmployees_success);			
		
}

function getEmployees_success(tx, results) {
	$('#busy').hide();
    var len = results.rows.length;
    var photopath="/sdcard";
     $('#employeeList').append('<li data-role="list-divider"><strong>List of Grantees</strong> <span class="ui-li-count">'+len+'</span></li>');
     
    for (var i=0; i<len; i++) {
    	var employee = results.rows.item(i);
		/*
		$('#employeeList').append('<li><a href="employeedetails.html?uid=' + employee.UniqueID + '">' +
				'<img src="'+ photopath + '/photos/' + employee.Image + '" class="list-icon"/>' +
				'<p class="line1">' + employee.FirstName + ' ' + employee.LastName + '</p>' +
				'<p class="line2">Level:' + employee.Level + '</p>' +
				'<span class="bubble">' + employee.Points + '</span></a></li>');
				*/
	 $('#employeeList').append('<li><a href="employeedetails.html?uid='+ employee.UniqueID + '" target="_self">' +
				'<img src="'+ photopath + '/photos/' + employee.Image + '" class="list-icon"/>' +
	 '<h2>'+ employee.FirstName + ' ' + employee.LastName +'</h2><p class="bubble">Level:'+employee.Level+'</p></a></li>');
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




