var db;
var dbCreated = false;

var scroll = new iScroll('wrapper', { vScrollbar: false, hScrollbar:false, hScroll: false });


$(document).ready(function() {
	    
    var touch = function(e) {
        if (! $(this).hasClass('ButtonPressed')) {
        	// function to call on button click..
        	window.location="addemployeenew.html";
            $(this).toggleClass('Button ButtonPressed');
        }
    };
    
    var untouch = function(e) {
        if ($(this).hasClass('ButtonPressed')) {
        	//alert('unpress');
            $(this).toggleClass('Button ButtonPressed');
        }
    };

    $('#header .Button').each(function() {
        $(this).mousedown(touch).mouseleave(untouch).mouseup(untouch);
        $(this).bind('touchstart', touch).bind('touchend', untouch);
    });
   
});



document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {	
    db = window.openDatabase("EmployeeDirectoryDB", "1.0", "PhoneGap Demo", 200000);
	//alert('onDeviceReady');
    if (dbCreated)
	{
	    //alert('if dbCreated');
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
	var sql = "select e.id,e.uid, e.firstName, e.lastName, e.title, e.picture, count(r.id) reportCount " + 
				"from employee e left join employee r on r.managerId = e.id " +
				"group by e.id order by e.lastName, e.firstName";
	tx.executeSql(sql, [], getEmployees_success);
}

function getEmployees_success(tx, results) {
	$('#busy').hide();
    var len = results.rows.length;
    for (var i=0; i<len; i++) {
    	var employee = results.rows.item(i);
		$('#employeeList').append('<li><a href="employeedetails.html?uid=' + employee.uid + '">' +
				'<img src="pics/' + employee.picture + '" class="list-icon"/>' +
				'<p class="line1">' + employee.firstName + ' ' + employee.lastName + '</p>' +
				'<p class="line2">' + employee.title + '</p>' +
				'<span class="bubble">' + employee.reportCount + '</span></a></li>');
    }
	setTimeout(function(){
		scroll.refresh();
	},100);
	db = null;
}

function populateDB(tx) {
 
 // alert('populateDB');
	$('#busy').show();
	//tx.executeSql('DROP TABLE IF EXISTS employee');
	var sql = 
		"CREATE TABLE IF NOT EXISTS employee ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"uid VARCHAR(50), " +
		"firstName VARCHAR(50), " +
		"lastName VARCHAR(50), " +
		"title VARCHAR(50), " +
		"department VARCHAR(50), " + 
		"managerId INTEGER, " +
		"city VARCHAR(50), " +
		"officePhone VARCHAR(30), " + 
		"cellPhone VARCHAR(30), " +
		"email VARCHAR(30), " +
		"picture VARCHAR(200))";
    tx.executeSql(sql);

	/*
	tx.executeSql("INSERT INTO employee (id,uid,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (13,'bcc9bb8b-6956-ac35-373d-eba0fd342bf3','Vikas','Sharma',4,'Software Architect','Engineering','617-000-0012','781-000-0012','vikas@fakemail.com','Delhi, India','vikas_sharma.jpg')");
    tx.executeSql("INSERT INTO employee (id,uid,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (12,'a01718f3-178f-43ec-9dc5-a45d2f784e9d','Steven','Wells',4,'Software Architect','Engineering','617-000-0012','781-000-0012','swells@fakemail.com','Boston, MA','steven_wells.jpg')");
  
    
    tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (11,'Amy','Jones',5,'Sales Representative','Sales','617-000-0011','781-000-0011','ajones@fakemail.com','Boston, MA','amy_jones.jpg')");
    tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (10,'Kathleen','Byrne',5,'Sales Representative','Sales','617-000-0010','781-000-0010','kbyrne@fakemail.com','Boston, MA','kathleen_byrne.jpg')");
    tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (9,'Gary','Donovan',2,'Marketing','Marketing','617-000-0009','781-000-0009','gdonovan@fakemail.com','Boston, MA','gary_donovan.jpg')");
    tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (8,'Lisa','Wong',2,'Marketing Manager','Marketing','617-000-0008','781-000-0008','lwong@fakemail.com','Boston, MA','lisa_wong.jpg')");
    tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (7,'Paula','Gates',4,'Software Architect','Engineering','617-000-0007','781-000-0007','pgates@fakemail.com','Boston, MA','paula_gates.jpg')");
    tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (5,'Ray','Moore',1,'VP of Sales','Sales','617-000-0005','781-000-0005','rmoore@fakemail.com','Boston, MA','ray_moore.jpg')");
    tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (6,'Paul','Jones',4,'QA Manager','Engineering','617-000-0006','781-000-0006','pjones@fakemail.com','Boston, MA','paul_jones.jpg')");
    tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (3,'Eugene','Lee',1,'CFO','Accounting','617-000-0003','781-000-0003','elee@fakemail.com','Boston, MA','eugene_lee.jpg')");
    tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (4,'John','Williams',1,'VP of Engineering','Engineering','617-000-0004','781-000-0004','jwilliams@fakemail.com','Boston, MA','john_williams.jpg')");
    tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (2,'Julie','Taylor',1,'VP of Marketing','Marketing','617-000-0002','781-000-0002','jtaylor@fakemail.com','Boston, MA','julie_taylor.jpg')");
    tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES (1,'James','King',0,'President and CEO','Corporate','617-000-0001','781-000-0001','jking@fakemail.com','Boston, MA','james_king.jpg')");
   */
}
