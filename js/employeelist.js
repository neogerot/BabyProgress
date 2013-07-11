var db;
var dbCreated = false;
var filter='';
var scroll = new iScroll('wrapper', { vScrollbar: false, hScrollbar:false, hScroll: false });

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
	
	    sql = "select e.id,e.firstName, e.lastName, e.uniqueID, e.image,e.level, e.points,e.location,e.state,e.localgroup,e.city " + 
				"from grantee e " +
				"where LOWER(e.firstName) LIKE :filter OR LOWER(e.lastName) LIKE :filter ";		
		tx.executeSql(sql, ["%"+filter+"%"], getEmployees_success);			
		
}

function getEmployees_success(tx, results) {
	$('#busy').hide();
    var len = results.rows.length;
    var photopath="/sdcard";
    for (var i=0; i<len; i++) {
    	var employee = results.rows.item(i);
		$('#employeeList').append('<li><a href="employeedetails.html?uid=' + employee.uniqueID + '">' +
				'<img src="'+ photopath + '/photos/' + employee.image + '" class="list-icon"/>' +
				'<p class="line1">' + employee.firstName + ' ' + employee.lastName + '</p>' +
				'<p class="line2">Level:' + employee.level + '</p>' +
				'<span class="bubble">' + employee.points + '</span></a></li>');
    }
	setTimeout(function(){
		scroll.refresh();
	},100);
	//	db = null;
}

function populateDB(tx) {
 
 // alert('populateDB');
	$('#busy').show();
   // tx.executeSql('DROP TABLE IF EXISTS grantee');
	var sql = 
		"CREATE TABLE IF NOT EXISTS grantee ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +		
		"firstName VARCHAR(50), " +
		"lastName VARCHAR(50), " +
		"uniqueID VARCHAR(50), " +
		"image VARCHAR(100), " + 
		"level INTEGER, " +
		"points INTEGER, " +
		"location VARCHAR(100), " +
		"state VARCHAR(100), " +
		"localgroup VARCHAR(100), " +
		"city VARCHAR(100))";
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




