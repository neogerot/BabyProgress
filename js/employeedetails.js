var scroll = new iScroll('wrapper', { vScrollbar: false, hScrollbar:false, hScroll: false });

var uid = getUrlVars()["uid"];

//alert('id:'+id);
var db;

document.addEventListener("deviceready", onDeviceReady, false);

window.addEventListener('load', function() {
		var testB;	
		testB = document.getElementById('btnBack');

		// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
		FastClick.attach(testB);		

		testB.addEventListener('touchend', function(event) {
			 RedirectToPage('index.html'); 
		}, false);
		
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
	
	/*
	var  sql = "select e.ID,e.FirstName, e.LastName, e.UniqueID, e.Image,e.Level, e.Points,e.LocationID,e.GroupID,e.IsNew,e.IsUpdate " + 
				"from Participants e " +
				" where e.UniqueID=:uid "+
				" order by e.LastName, e.FirstName";
		*/		
   var  sql = "select e.ID,e.FirstName, e.LastName, e.UniqueID, e.Image,e.Level, e.Points,e.LocationID,e.GroupID,e.IsNew,e.IsUpdate,loc.Name as locationname,g.Name as groupname "
  			  + 	" from Participants e " 
  			  +    " join Locations loc on loc.ID=e.LocationID "
  			  +   " join Groups g on g.LocationId=loc.ID "
			  +  " where e.UniqueID=:uid "
			  + " order by e.LastName, e.FirstName";
				
	tx.executeSql(sql, [uid], getEmployee_success);
}

function getEmployee_success(tx, results) {
	//alert('employee details retreived');
	$('#busy').hide();
	
	var employee = results.rows.item(0);
	
	var photopath="/sdcard";
	var imagelocalPath = window.rootFS.fullPath +"/photos/"+ employee.Image;
	//alert(imagelocalPath);
	
	
	 // Uncomment before deploying to Device..
	$.get(imagelocalPath)
	    .done(function() { 
	        // exists code 
	    photopath=imagelocalPath; 
	   
	    }).fail(function() { 
	        // not exists code
	        photopath ="img/person_blank.png";
	    });

	$('#employeePic').attr('src', photopath);
	$('#fullName').text(employee.FirstName + ' ' + employee.LastName);
	$('#level').html("<strong>Level:</strong>"+employee.Level + ",<strong>Points:</strong>"+ employee.Points);
	$('#location').html("<strong>Location:</strong>"+ employee.locationname + ",<strong>Group:</strong>"+ employee.groupname );
	//$('#group').text("Group:"+ employee.GroupID);
	//$('#city').text(employee.city);
	//$('#state').text(employee.state);
		
			
	
	//db = null;
	
	db.transaction(getObjectives, transaction_error);
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

// load Objectives of the Participant
function getObjectives(tx) {
	$('#busy').show();
	var  sql = "select obj.ID,obj.Name,obj.PlusPoints,obj.MinusPoints,per.Completed " +
				"from Participants p  " +
				" JOIN Performance per on p.UniqueID = per.UniqueID " +
				" JOIN Objectives obj on per.ObjectiveId = obj.ID " +
				" where p.UniqueID=:uid " +
				" order by obj.ID";
				
	tx.executeSql(sql, [uid], getObjectives_success);	
}

function getObjectives_success(tx, results) {
	//alert('employee details retreived');
	$('#busy').hide();
	//alert('getObjectives_success');
	var len = results.rows.length;
	// Traverse all the Objectives	
	
	 $('#objectives').append('<li data-role="list-divider"><strong>Objectives</strong> <span class="ui-li-count">'+len+'</span></li>');
	 
	 for (var i=0; i<len; i++) {
	 	var objective = results.rows.item(i);	 	
	 	
	 	
	 $('#objectives').append('<li><h2>'+objective.Name+'</h2><p>(+'+objective.PlusPoints+',-'+objective.MinusPoints+')</p><p class="ui-li-aside"><select name="checkbox-'+objective.ID +'" id="checkbox-'+ objective.ID 
	 +'" data-role="slider" class="left"><option value="off">Off</option><option value="on">On</option></select></p></li>');
	 
 
	 // Set value of status of objective
	$('#checkbox-'+objective.ID).val(objective.Completed==1?'on':'off');
	
	// Assign the on change function
	/*
	$('#checkbox-'+objective.ID).on('click',function(){
		  alert($('#checkbox-'+objective.ID).attr('id')+": "+ $('#checkbox-'+objective.ID).val()); 
		});
		*/
	 } // End of for loop
	 
	$('#objectives').trigger( "create" );	
	
	setTimeout(function(){
		scroll.refresh();
	});
	
		
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
	var sql = "delete from Participants where uniqueID=?";
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
