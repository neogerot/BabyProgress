var scroll = new iScroll('employeeAddWrapper', { vScrollbar: false, hScrollbar:false, hScroll: false });
var id = 0;
var db;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	//alert('OnDeviceReady');	
	//console.log("opening database");
	
    //db = window.openDatabase("EmployeeDirectoryDB", "1.0", "PhoneGap Demo", 200000);
	//console.log("database opened");
	
   // db.transaction(isTableExists,"employee", transaction_error);
	
	$('#busy').hide();
}
function isTableExists(tx, tableName, callback) {
alert('table existence check:'+tableName);
              tx.executeSql('SELECT * FROM '+tableName, [], function(tx, resultSet) {
                  if (resultSet.rows.length <= 0) {
                      alert('exists');
					  callback(false);
                  } else {
				    alert('does not exist');
                      callback(true);
                  }
              }, function(err) {
			    alert(err);
                  callback(false);
              })
        };
		
function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

function addEmployee()
{
	//alert('start adding');
	db = window.openDatabase("EmployeeDirectoryDB", "1.0", "PhoneGap Demo", 200000);
	db.transaction(addEmployeeInDB, transaction_error, addEmployeeInDB_success);
	//alert('db call');
}
function transaction_error(tx, error) {
	$('#busy').hide();
	//alert('transaction_error:Insert');
    alert("Database Error: " + error);
}
function addEmployeeInDB_success() {
	//alert('Employee Added Successfully');	
	//console.log("Employee Added");
	$('#busy').hide();
}
function  addEmployeeInDB(tx)
{	
	$('#busy').show();	
	
	var sql ="INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture) VALUES ("+ $('#id').val()+",'"+
	$('#firstName').val() +"','"+$('#lastName').val() +"',"+$('#managerId').val() +",'"+$('#title').val() +"','"+$('#department').val() +"','"+$('#officePhone').val() +"','"+
	$('#cellPhone').val() +"','"+$('#email').val() +"','"+$('#city').val() +"','"+$('#firstName').val()+"_"+$('#lastName').val() +".jpg')"; 
		
	tx.executeSql(sql);
	//alert(sql);
	
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

function capturePhoto() {
    navigator.camera.getPicture(onPhotoURISuccess, fail, { quality: 25, destinationType: Camera.DestinationType.FILE_URI });
}

function onPhotoURISuccess(imageURI) {
    createFileEntry(imageURI);
}

function createFileEntry(imageURI) {
    window.resolveLocalFileSystemURI(imageURI, copyPhoto, fail);    
}

function copyPhoto(fileEntry) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) { 
        fileSys.root.getDirectory("photos", {create: true, exclusive: false}, function(dir) { 
                fileEntry.copyTo(dir, "file.jpg", onCopySuccess, fail); 
            }, fail); 
    }, fail); 
}

function onCopySuccess(entry) {
    console.log(entry.fullPath)
}

function fail(error) {
    console.log(error.code);
}
