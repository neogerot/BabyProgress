/* Perform Synchornization functions here*/
var db;
var myScroll;
function loaded() {
	setTimeout(function () { 
                myScroll = new iScroll('wrapper', {
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

function RedirectToPage(pageUrl) {
	$('#busy').hide();
	//alert("Employee Deleted");		
    window.location=pageUrl;
}


  /*  File System 
   * 
   */
  function gotFS(fileSystem) {
    console.log("got filesystem");
    // save the file system for later access
   // console.log(fileSystem.root.fullPath);
    window.rootFS = fileSystem.root;
	//$('#btnSynchronize').attr('onclick',"downloadFile('010001.jpg');");
	$('#btnLoadMetadata').attr('onclick',"LoadMetadata();");
	$('#btnCleanTables').attr('onclick',"CleanTables();");
	
	//alert("got filesystem");	  
	//downloadFile('010001.jpg'); 
}

    document.addEventListener('deviceready', function() {                
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}, false);
  
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {	
    db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);    
    
}
  
  
  var eventDataJSONObject;
 
  
function SynchronizeDevice()
{
	// This function will synchronize the data for the event
	  	
}
function OpenZip()
{
	var zip = new JSZip();
	zip.load("data.zip");
}

//http://107.21.201.107/ziphandler/default.aspx
function downloadFile(imagename){
	  // alert('download start'+imagename);      
	 //  alert(window.rootFS.fullPath);
       window.rootFS.getDirectory("photos", {create: true, exclusive: false}, function(dir) { 
                // Directory for downloaded photos created..
              //  alert("Directory found...downloading..");
                var fileTransfer = new FileTransfer();
                fileTransfer.download(
                                           "http://107.21.201.107/ziphandler/images/"+imagename,
                                           window.rootFS.fullPath + "/photos/" +imagename,
                                           function(theFile) {
                                         //  alert("download complete");
                                           console.log("download complete: " + theFile.toURI());                                          
                                           },
                                           function(error) {
                                           //alert("error in download");
                                          // alert(error.code);
                                           console.log("download error source " + error.source);
                                           console.log("download error target " + error.target);
                                           console.log("upload error code: " + error.code);
                                           }
                                           );
                
                
            }, fail); 
        
       /*
        window.requestFileSystem(
                     LocalFileSystem.PERSISTENT, 0, 
                     function onFileSystemSuccess(fileSystem) {
                     fileSystem.root.getFile(
                                 "dummy.html", {create: true, exclusive: false}, 
                                 function gotFileEntry(fileEntry){
                                 var sPath = fileEntry.fullPath.replace("dummy.html","");
                                 var fileTransfer = new FileTransfer();
                                 fileEntry.remove();
 								// alert('downloading..'+imagename);
                                
                                 fileTransfer.download(
                                           "http://107.21.201.107/ziphandler/images/"+imagename,
                                           sPath + imagename,
                                           function(theFile) {
                                         //  alert('download complete'+imagename);
                                           console.log("download complete: " + theFile.toURI());
                                           showLink(theFile.toURI());
                                           },
                                           function(error) {
                                           console.log("download error source " + error.source);
                                           console.log("download error target " + error.target);
                                           console.log("upload error code: " + error.code);
                                           }
                                           );
                                 }, 
                                 fail);
                     }, 
                     fail);
                */
 
    }  
    
     function uploadPhoto(imageURI) {
            var options = new FileUploadOptions();
            options.fileKey="file";
            options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
            options.mimeType="image/jpeg";

            var params = {};
            params.value1 = "test";
            params.value2 = "param";

            options.params = params;

            var ft = new FileTransfer();
            ft.upload(imageURI, encodeURI("http://some.server.com/upload.php"), win, fail, options);
        }  

function fail(error) {
    console.log(error.code);
}

    
function LoadMetadata()
    {
    	   // alert('Start Loading Metadata..');
    	    $('#busy').show();		
			  var xhr1 = new XMLHttpRequest();
			  //alert('1');
			  xhr1.open('GET', 'metadata/data.txt', true);
			  if (xhr1.overrideMimeType) {
			    xhr1.overrideMimeType('text/plain; charset=x-user-defined');
			  }
			 // alert('2');
			  xhr1.onreadystatechange = function(e) {
			  //  alert(this.readyState+'-'+this.status);
			    if (this.readyState == 4 && this.status == 200) {
			     	  	
			     	  	 	 //****************************** EVENT OBJECT *************************************
		              		  eventDataJSONObject = JSON.parse(this.responseText);
		              		  //alert('JSON object Initialized');   
		              		 
		              		 
		              		  var $eventinfo = $("#eventinfo");
		              		  $eventinfo.html("");  
		              		   
								$(eventDataJSONObject).each(function() {  
									 $eventinfo.append("<div> Event Name: " + this.Name + "<br></div>");	
		              		 		 $eventinfo.append("<div> Id: " + this.Id + "<br></div>");	
		              		 		 $eventinfo.append("<div> Start Date: " + this.StartDate + "<br></div>");	
		              		   		 $eventinfo.append("<div> End Date: " + this.EndDate + "<br></div>");	
		              		   		 
		              		   		 $eventinfo.append("<div> Locations ######################<br></div>");	
		              		   		 
		              		   		  //****************************** Locations OBJECT *************************************
		              		   		  var locationObject = this.Locations;
		              		   		   //------------------------ Traverse Locations : START----------------------------
				              		       $(locationObject).each(function() { 				              		     
				              		     
				              		       	  $eventinfo.append("<div> ID: " + this.ID +"<br></div>");	
				              		  		  $eventinfo.append("<div> Name: " + this.Name +"<br></div>");	
				              		  		  $eventinfo.append("<div> City: " + this.City +"<br></div>");	
				              		  		  $eventinfo.append("<div> State: " + this.State +"<br></div>");					              		  		  
				              		  	  //********************* Save Performance  **************************
				              		 	  SaveLocation(this);	
				              		 	  //******************************************************************* 
				              		 	  
				              		 	  
				              		 	   //****************************** Groups OBJECT *************************************
				              		 	   var groupObject = this.Groups;
				              		 	   var locationId=this.ID ;
				              		 	   //------------------------ Traverse Groups : START----------------------------
				              		       $(groupObject).each(function() { 				              		     
				              		     
				              		       	  $eventinfo.append("<div> ID: " + this.ID +"<br></div>");	
				              		  		  $eventinfo.append("<div> Size: " + this.Size +"<br></div>");	
				              		  		  $eventinfo.append("<div> Name: " + this.Name +"<br></div>");	
				              		  					              		  		  
				              		  		  
				              		  	  //********************* Save Groups  **************************
				              		 	   SaveGroup(this,locationId);	
				              		 	  //******************************************************************* 
				              		       		        
				              		    }); // end of Groups	
				              		    	
				              		    //------------------------ Traverse Groups : END---------------------------- 
				              		 	  				              		 	  
				              		       		        
				              		    }); // end of Locations		
				              		    
				              		    //------------------------ Traverse Locations : END----------------------------   
		              		   		  
		              		   		  //************************************Participants END************************************
		              		   		 
		              		   		 
		              		   		  $eventinfo.append("<div> Participants################" + "<br></div>");					              		  
				              		  
				              //****************************** Participants OBJECT *************************************
				              
				              		  var participantObject = this.Participants;
				              		
				              		//------------------------ Traverse Participant : START----------------------------
				              		   $(participantObject).each(function() {  
				              		    $eventinfo.append("<div> First Name: " + this.FirstName +"<br></div>");	
				              		    $eventinfo.append("<div> Last Name: " + this.LastName +"<br></div>");	
				              		    $eventinfo.append("<div> UniqueID: " + this.UniqueID +"<br></div>");	
				              		  
				              		  var imagelocalPath = window.rootFS.fullPath +"/photos/"+ this.Image;
				              		  var imageName=this.Image;
				              		  
				              		  if(imageName!='')
				              		  {
						              		 // Uncomment before deploying to Device..
						              		  $.get(imagelocalPath)
											    .done(function() { 
											        // exists code 
											        // Do nothing
											    }).fail(function() { 
											        // not exists code
											        // Download									        
											         downloadFile(imageName);
											    });
									    }
													              		  
				              		  
				              		    $eventinfo.append("<div> Image:<img src='"+window.rootFS.fullPath +"/"+ this.Image+"'></img><br></div>");	
				              		    $eventinfo.append("<div> Level: " + this.Level +"<br></div>");	
				              		    $eventinfo.append("<div> Points: " + this.Points +"<br></div>");		
				              		    	              
				              		    //************** Save grantee  ********************************
				              		    var userUniqueId = this.UniqueID;
				              		    SaveGrantee(this);	
				              		   //**************************************************************            
				              		    	              	     
				              		    $eventinfo.append("<div> Performance*********" + "<br></div>");		
				              		    
				              		    
				              		     //****************************** Performance OBJECT *************************************
				              		     var performanceObject = this.Performance;   
				              		     
				              		     //------------------------ Traverse Performance : START----------------------------
				              		       $(performanceObject).each(function() { 				              		     
				              		     
				              		       	  $eventinfo.append("<div> ObjectiveID: " + this.ObjectiveID +"<br></div>");	
				              		  		  $eventinfo.append("<div> Completed: " + this.Completed +"<br></div>");	
				              		  		  
				              		  	  //********************* Save Performance  **************************
				              		 	   SaveGranteePerformance(this,userUniqueId);	
				              		 	  //******************************************************************* 
				              		       		        
				              		    }); // end of performance		
				              		    //------------------------ Traverse Performance : END----------------------------              		    
				              		    
				              		     $eventinfo.append("<div> *********" + "<br></div>");	
				              		   }); // end of participants


				              		   
				              		  //------------------------ Traverse Participant : END----------------------------
				              		  
				              		  
				              		   
				              		   $eventinfo.append("<div> ################" + "<br></div>");	
				              		   
				              		    $eventinfo.append("<div> Game*********" + "<br></div>");	
				              		  
				              		  
				              		   //****************************** Game OBJECT *************************************
				              		    var gameObject = this.Game;
				              		    
				              		    //------------------------ Traverse Game : START----------------------------
				              		    $(gameObject).each(function() {  
				              		    	
				              		    	 	   $eventinfo.append("<div>  Name: " + this.Name +"<br></div>");	
				              		    	 	   $eventinfo.append("<div> Id: " + this.ID +"<br></div>");	
				              		    	 	     
				              		    	 	      //********************* Save Game  **************************
				              		 	   				SaveGame(this);	
				              		 	 			 //************************************************************* 
				              		    	 	     
				              		    	 	      $eventinfo.append("<div> Levels*********" + "<br></div>");
				              		    	 	      
				              		    //****************************** Levels OBJECT *************************************
				              		    	 	      var levelsObject = this.Levels;
				              		    	 	      
				              		    	 	      
				              		    //------------------------ Traverse Levels : START----------------------------
				              		    	 	        $(levelsObject).each(function() {  
				              		    	 	        	 $eventinfo.append("<div>  ID: " + this.ID +"<br></div>");	
				              		    	 	        	  $eventinfo.append("<div>  Name: " + this.Name +"<br></div>");	
				              		    	 	        	  
				              		    	 	        	  var levelId=this.ID;
				              		    	 	        	   //********************* Save Level  **************************
				              		 	   						SaveLevel(this);	
				              		 	 					   //************************************************************* 
				              		    	 	        	  
				              		    	 	        	   $eventinfo.append("<div> Objectives*********" + "<br></div>");
				              		    	 	        	   
				              		    //****************************** Objectives OBJECT *************************************
				              		    	 	        	    var objectivesObject = this.Objectives;
				              		    	 	        	    
				              		   //------------------------ Traverse Objectives : START-----------------------------------
				              		    	 	        	     $(objectivesObject).each(function() { 
				              		    	 	        	     	 $eventinfo.append("<div>  Name: " + this.Name +"<br></div>");	
				              		    	 	        	     	 $eventinfo.append("<div>  ID: " + this.ID +"<br></div>");	
				              		    	 	        	     	
				              		    	 	        	     	 //********************* Save Objective  **************************
				              		 	   									SaveObjective(this,levelId);	
				              		 	 					  		 //****************************************************************
				              		    	 	        	    }); // end of Objectives
				              		    	 	        	    
				              		  //------------------------ Traverse Objectives : END-----------------------------------
				              		    	 	        	 $eventinfo.append("<div> *********" + "<br></div>");	
				              		    	 	        	 }); // end of Levels
				              		    	 	        	 
				              		  //------------------------ Traverse Levels : END----------------------------
				              		    	 	     	 $eventinfo.append("<div> *********" + "<br></div>");	
				              		   
				              		   }); // end of Game
				              		    //------------------------ Traverse Game : END----------------------------
				              		    $eventinfo.append("<div> *********" + "<br></div>");	
				              		   
									}); // end of Event
															
              		  	     		 
                		
	             
		 
			    }
			  };			
			  xhr1.send();
			
    }
 
function MetadataLoadComplete_success() {
	$('#busy').hide();
	//alert('Loading Metadata Completed..');
}
    
    function SaveGrantee(participantObj)
    {
    	//alert(granteeObj.FirstName);
    	var sql ="INSERT INTO Participants (FirstName,LastName,UniqueID,Image,Level,Points,LocationID,GroupID,IsNew,IsUpdate) VALUES ('" + participantObj.FirstName +"','"
		+ participantObj.LastName +"',"+ "'"+participantObj.UniqueID+"','"+ participantObj.Image +"'"+",'"+participantObj.Level+"','0','"+participantObj.LocationID+"','"+
		participantObj.GroupID +"','"+participantObj.IsNew +"','"+participantObj.IsUpdate +"')"; 
	
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, SaveDB_success);
			
    }    
    
    function SaveGranteePerformance(granteePerformanceObj,userUniqueId)
    {
    	//alert(userUniqueId + '#'+ granteePerformanceObj.ObjectiveID + '-' + granteePerformanceObj.Completed );
    	    	
    	var sql ="INSERT INTO Performance (UniqueID,ObjectiveID,Completed) VALUES ('" + userUniqueId +"','"
		+ granteePerformanceObj.ObjectiveID +"',"+ "'"+granteePerformanceObj.Completed +"')"; 
		       
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, SaveDB_success);
	     
		
    }   
    function SaveGame(gameObj)
    {
    	   	    	
    	var sql ="INSERT INTO Game (ID,Name) VALUES ('" + gameObj.ID +"','"
		+ gameObj.Name +"')"; 
		       
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, SaveDB_success);
    }   
    
    function SaveLevel(levelObj)
    {
    	   	    	
    	var sql ="INSERT INTO Levels (ID,Name) VALUES ('" + levelObj.ID +"','"
		+ levelObj.Name +"')"; 
		       
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, SaveDB_success);
    }   
    
    function SaveObjective(objectiveObj,levelId)
    {
    	   	    	
    	var sql ="INSERT INTO Objectives (ID,Name,LevelId) VALUES ('" + objectiveObj.ID 
    	+"','"+ objectiveObj.Name +"','"+ levelId +"')"; 
		       
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, MetadataLoadComplete_success);
    }  
    
    function SaveLocation(locationObj)
    {
    	   	    	
    	var sql ="INSERT INTO Locations (ID,Name,City,State) VALUES ('" + locationObj.ID +"','"
		+ locationObj.Name +"','" + locationObj.City +"','" + locationObj.State +  "')"; 
		       
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, SaveDB_success);
    } 
    
    function SaveGroup(groupObj,locationId)
    {
    	   	    	
    	var sql ="INSERT INTO Groups (ID,Name,Size,LocationId) VALUES ('" + groupObj.ID +"','"
		+ groupObj.Name +"','"+ groupObj.Size +"','"+ locationId +   "')"; 
		
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, SaveDB_success);
    } 
     
    
function SaveDB_success() {
	//alert('SaveGranteeDB_success');	
}

    
function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

function  CleanTables()
    {
    	//alert('Clean Tables');
    	$('#busy').show();
    	/*------------------ delete and recreate all the tables ----------------------------------*/
    	
    	// Delete and Recreate grantee Table 
    	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS Participants');    	
	     }
	     , transaction_error, SaveDB_success);
    	
    	var sqlDeleteParticipants = 
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
		
		db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlDeleteParticipants);    	
	     }
	     , transaction_error, DeleteTable_success);
    	
    	
    	// Delete and Recreate granteeperformance Table 
    	
    	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS Performance');    	
	     }
	     , transaction_error, SaveDB_success);
    	
    	var sqlDeleteGranteePerformance = 
						"CREATE TABLE IF NOT EXISTS Performance ( "+
						"ID INTEGER PRIMARY KEY AUTOINCREMENT, " +							
						"UniqueID VARCHAR(50), " +
						"ObjectiveID  VARCHAR(10), " +						
						"Completed INTEGER)";
		
		
		db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlDeleteGranteePerformance);    	
	     }
	     , transaction_error, DeleteTable_success);    	    		
    	
    	
    	//********************************* Delete and Recreate game Table ******************************
    	
    	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS Game');    	
	     }
	     , transaction_error, SaveDB_success);
    	
    	var sqlDeleteGame = 
						"CREATE TABLE IF NOT EXISTS Game ( "+												
						"ID VARCHAR(10), " +										
						"Name VARCHAR(100))";
		
		
		db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlDeleteGame);    	
	     }
	     , transaction_error, DeleteTable_success);  
	     
	     //**********************************************************************************************
	     
	     //********************************* Delete and Recreate game Table ******************************
    	
    	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS Levels');    	
	     }
	     , transaction_error, SaveDB_success);
    	
    	var sqlDeleteLevels = 
						"CREATE TABLE IF NOT EXISTS Levels ( "+												
						"ID VARCHAR(10), " +										
						"Name VARCHAR(100))";
		
		
		db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlDeleteLevels);    	
	     }
	     , transaction_error, DeleteTable_success);  
	     
	     //**********************************************************************************************
	     
	     //********************************* Delete and Recreate game Table ******************************
    	
    	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS Objectives');    	
	     }
	     , transaction_error, SaveDB_success);
    	
    	var sqlDeleteObjectives = 
						"CREATE TABLE IF NOT EXISTS Objectives ( "+												
						"ID VARCHAR(10), " +		
						"Name VARCHAR(100), " +									
						"LevelId VARCHAR(10))";
		
		
		db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlDeleteObjectives);    	
	     }
	     , transaction_error, DeleteTable_success);  
	     
	     //**********************************************************************************************    
	     
	     
	     
	    //********************************* Delete and Recreate Locations Table ******************************
    	
    	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS Locations');    	
	     }
	     , transaction_error, SaveDB_success);
    	
    	var sqlDeleteLocations = 
						"CREATE TABLE IF NOT EXISTS Locations ( "+												
						"ID VARCHAR(10), " +
						"Name VARCHAR(100), " +		
						"City VARCHAR(100), " +							
						"State VARCHAR(100))";
		
		
		db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlDeleteLocations);    	
	     }
	     , transaction_error, DeleteTable_success);  
	     
	     //**********************************************************************************************    
	     	     
	     	     
	     //********************************* Delete and Recreate Groups Table ******************************
    	
    	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS Groups');    	
	     }
	     , transaction_error, SaveDB_success);
    	
    	var sqlDeleteGroups = 
						"CREATE TABLE IF NOT EXISTS Groups ( "+												
						"ID VARCHAR(10), " +
						"Name VARCHAR(100), " +		
						"Size INTEGER, " +								
						"LocationId VARCHAR(10))";
		
		
		db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlDeleteGroups);    	
	     }
	     , transaction_error, DeleteTableComplete_success);  
	     
	     //**********************************************************************************************  
	       
	        	
    	// Delete EXTRA
    	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS Grantee');    	
	     }
	     , transaction_error, SaveDB_success);
	     
    }
    
    // function to be called at last
    function DeleteTable_success() {
	
}
 function DeleteTableComplete_success() {
	$('#busy').hide();
}


/*
 * 
var myObject = new Object();
myObject.name = "John";
myObject.age = 12;
myObject.pets = ["cat", "dog"];

var myString = JSON.stringify(myObject);
 * 
 */

    
