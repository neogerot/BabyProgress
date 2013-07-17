var id = 0;
var db;
var scroll;
var levelUser;
var insertedUniqueId;

function loaded() {
	//alert('loaded');
	setTimeout(function () { 
        scroll = new iScroll('wrapper', {
		useTransform: false,
		onBeforeScrollStart: function (e) {
			var target = e.target;
			while (target.nodeType != 1) target = target.parentNode;

		
		if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
				e.preventDefault();
		}
	});
        }, 100);         
    
    
 }

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
document.addEventListener('DOMContentLoaded', loaded, false);


window.addEventListener('load', function() {
		var buttonBack;	
		var buttonCapture;	
		buttonBack = document.getElementById('btnBack');
		buttonCapture = document.getElementById('btnCaptureImage');

		// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
		FastClick.attach(buttonBack);		

		buttonBack.addEventListener('touchend', function(event) {
			 RedirectToPage('index.html'); 
		}, false);
		
		buttonCapture.addEventListener('touchend', function(event) {
			 capturePhoto();
		}, false);
		
	}, false);
	
window.addEventListener("orientationchange", function() {
   setTimeout(function(){
		scroll.refresh();
	});	 
}, false);

document.addEventListener("deviceready", onDeviceReady, false);

function gotFS(fileSystem) {
    console.log("got filesystem");
    // save the file system for later access
    //console.log(fileSystem.root.fullPath);
    window.rootFS = fileSystem.root;
	$('#photofilepath').val(window.rootFS.fullPath);
}

document.addEventListener('deviceready', function() {                
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}, false);

function onDeviceReady() {
		
	$('#busy').hide();
	$('#uid').val(guid());
	
	db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);
}


// Get querystring parameter
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

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

// genrate unique Id to associate with the grantee
function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
   
}

// Redirect to the Home Page
function RedirectToPage(pageUrl) {
	$('#busy').hide();	
    window.location=pageUrl;
}

/*********************** Database Operations ****************************/

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}
   	
// Add grantee
function addEmployee()
{
	db.transaction(addEmployeeInDB);	
}

function addEmployeeInDB(tx)
{	
	levelUser=$('#level').val();	
	$('#busy').show();		
	var sql = "INSERT INTO Participants (FirstName,LastName,UniqueID,Image,Level,Points,LocationID,GroupID,IsNew,IsUpdate) VALUES ('" + $('#firstName').val() +"','"
		+ $('#lastName').val() +"',"+ "'"+$('#uid').val()+"','"+ $('#uid').val() +".jpg'" +",'"+$('#level').val() +"','0','"+$('#locationId').val()+"','"+
		$('#groupId').val() +"','1','0')"; 
		
	tx.executeSql(sql,[],addEmployeeInDB_success);
	
	
	//alert('Query Executed');
}

function addEmployeeInDB_success(tx,results) {
	console.log("Employee Added"+results.insertId);
	insertedUniqueId=$('#uid').val();
	
	// Insert the performance of User in the Performance Table 
	// Get all the associated Objectives with the Level
	
	var sqlPerformance="select ID,Name,LevelId from objectives o"
			  +  " where o.LevelId=:levelUser ";
			 
				
	tx.executeSql(sqlPerformance, [levelUser], getObjectives_success);	
	
	//RedirectToPage("index.html");
}

function getObjectives_success(tx, results) {
	
	var len = results.rows.length;
	
	for (var i=0; i<len; i++) {
		var objective = results.rows.item(i);	 
			
		var sqlObjective="INSERT INTO Performance (UniqueID,ObjectiveID,Completed) VALUES ('" + insertedUniqueId +"','"
		+ objective.ID +"',"+ "'0')"; 
		       
		       
		       tx.executeSql(sqlObjective);    
		
	}
	
	$('#busy').hide();	
	RedirectToPage("index.html");
}




/******************************************************************************************/

/*------------------------- Phone Functions ---------------------------------------------*/

function capturePhoto() {
    navigator.camera.getPicture(onPhotoURISuccess, fail, { quality: 25, destinationType: Camera.DestinationType.FILE_URI ,saveToPhotoAlbum: true});
}

function onPhotoURISuccess(imageURI) {
    createFileEntry(imageURI);
	$('#imgCaptured').attr('src',imageURI);
}

function createFileEntry(imageURI) {
    window.resolveLocalFileSystemURI(imageURI, copyPhoto, fail);    
}

function copyPhoto(fileEntry) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) { 
        fileSys.root.getDirectory("photos", {create: true, exclusive: false}, function(dir) { 
                fileEntry.copyTo(dir, $('#uid').val() +".jpg", onCopySuccess, fail); 
            }, fail); 
    }, fail); 
}

function onCopySuccess(entry) {
    console.log(entry.fullPath)
}

function fail(error) {
    console.log(error.code);
}

/*------------------------- --------------------------------------------------------------*/
