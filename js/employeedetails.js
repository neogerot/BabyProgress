var scroll = new iScroll('wrapper', { vScrollbar: false, hScrollbar:false, hScroll: false });

var uid = getUrlVars()["uid"];
//alert('id:'+id);
var db;

document.addEventListener("deviceready", onDeviceReady, false);

// function gotFS(fileSystem) {
    // console.log("got filesystem");
	// alert("got filesystem");
    // // save the file system for later access
    // console.log(fileSystem.root.fullPath);
    // window.rootFS = fileSystem.root;	
	// alert("assigned filesystem");
// }

// document.addEventListener('deviceready', function() {                
    // window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    // window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
// }, false);

function onDeviceReady() {
	console.log("opening database");
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

function getEmployee(tx) {
	$('#busy').show();
	var sql ="select e.id,e.firstName, e.lastName, e.uniqueID, e.image,e.level, e.points,e.location,e.state,e.localgroup,e.city " + 
				"from grantee e " +
				" where e.uniqueID=:uid "+
				" order by e.lastName, e.firstName";
	tx.executeSql(sql, [uid], getEmployee_success);
}

function getEmployee_success(tx, results) {
	//alert('employee details retreived');
	$('#busy').hide();
	var employee = results.rows.item(0);
	
	var photopath="/sdcard";
	$('#employeePic').attr('src', photopath + '/photos/' + employee.image);
	$('#fullName').text(employee.firstName + ' ' + employee.lastName);
	$('#location').text(employee.location);
	$('#city').text(employee.city);
	$('#state').text(employee.state);
		
	$('#actionList').append('<li>Objectives</li>');
				
	$('#actionList').append('<li><a href="#"><p class="line1">Level</p>' +
				'<p class="line2">' + employee.level + '</p><img src="img/level.png" class="action-icon"/></a></li>');
	
	
	$('#actionList').append('<li><a href="#"><p class="line1">Points</p>' +
				'<p class="line2">' + employee.points + '</p><img src="img/points.png" class="action-icon"/></a></li>');

	$('#actionList').append('<li><a href="tel:' + employee.localgroup + '"><p class="line1">Group</p>' +
				'<p class="line2">' + employee.localgroup + '</p><img src="img/phone.png" class="action-icon"/></a></li>');
	
	$('#actionList').append('<li><a href="#" onClick="deleteEmployee()"><p class="line1">Delete Record</p>' +
				'<p class="line2"></p><img src="img/delete.jpg" class="action-icon"/></a></li>');	

	
	setTimeout(function(){
		scroll.refresh();
	});
	//db = null;
	
	db.transaction(loadObjectives, transaction_error);
}

// load Objectives of the grantee
function loadObjectives(){
	
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
	var sql = "delete from grantee where uniqueID=?";
	tx.executeSql(sql, [uid], deleteEmployee_success);
}

function deleteEmployee_success(tx, results) {
	$('#busy').hide();	
    window.location="index.html";
}

function RedirectToPage(pageUrl) {
	$('#busy').hide();
	//alert("Employee Deleted");		
    window.location=pageUrl;
}
/*<select name="toggleswitch1" id="toggleswitch1" data-theme="b" data-role="slider" class="ui-slider-switch">
      <option value="off">Off</option>
      <option value="on">On</option>
    </select>
    */
