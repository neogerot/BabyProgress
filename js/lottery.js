/* Perform Login functions here*/
var count;	
			var timesToRotate;	
			var numberOfParticipants;	
			var myParticipants = [];
			var currentParticipant;
			var speed=50;
			var winneruid;
			var ParticipantCollection = [];	
			
			$('#winner').hide();			
			function Initialize(){
			    count= 1 + Math.floor(Math.random() * numberOfParticipants);
			    timesToRotate=5;			    
			    currentParticipant=0;			   
			   // $('#counter').html("count:"+count+" Times:"+timesToRotate);
			   					
			}
			
			function SelectWinner(){	
				$('#winner').hide();	
				$('#btnStart').hide();
				$('#counter').html();	
				
				Initialize();		
						setTimeout(function(){					 							
				 			rotateImages();	
				 	}, speed);
			}
			
			function rotateImages(){
					var origsrc = $('#rotate_images').attr('src');
			        var src = '';
			        var imagerootPath=window.rootFS+'/photos/';
			        if (origsrc == 'img/person_blank.png') src = ParticipantCollection[currentParticipant].Image;
			       
			        currentParticipant++;
			       
			        if(currentParticipant<numberOfParticipants)
			        {
			        	src = ParticipantCollection[currentParticipant].Image;	
					}
					else
					{
						currentParticipant=0;
						src= ParticipantCollection[currentParticipant].Image;	
					}
						        
			        $('#rotate_images').attr('src',imagerootPath+src);	
			        
			        count--;
			        if(count<=0)
			        {
			        	if(--timesToRotate<=0)
			        	  {
			        	  	ShowWinner();
			        	  }
			        	  else
			        	  {
			        	  	count=numberOfParticipants;
			        	  //	$('#counter').append("count:"+count+" Times:"+timesToRotate +" Current:"+currentParticipant);
			        		setTimeout(function(){				        					        		        		
		 							rotateImages();	
		 						}, speed*timesToRotate);
			        	  }
			        }			      
			        else
			        {
			        	//$('#counter').append("count:"+count+" Times:"+timesToRotate +" Current:"+currentParticipant);
			        	setTimeout(function(){	
			        					        		        		
		 							rotateImages();	
		 						}, speed*timesToRotate);			        	
			        }
			}
			function ShowWinner(){					
					
					$('#counter').append(' <h3>'+ParticipantCollection[currentParticipant].FirstName+ ' '+ParticipantCollection[currentParticipant].LastName
					+ ' ('+ParticipantCollection[currentParticipant].locationname +')</h3>');
				    $('#winner').show();	
			}
			
	
//------------------------------ Initialize System Resources---------------------------------------------------
//------------------------------ File System Initialization Starts---------------------------------------------
 document.addEventListener('deviceready', function() {                
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}, false);

function gotFS(fileSystem) {
    console.log("got filesystem");  
    $('#busy').hide();       
    window.rootFS = fileSystem.root;
    $('#btnStart').show();
}

//-----------------------------File System Initialization Ends ----------------------------------------------

//----------------------------Events Initialization Starts---------------------------------------------------------
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {	
    db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);     
    db.transaction(getEmployee, transaction_error);	    
}

window.addEventListener('load', function() {
			var buttonStart;
			var buttonBack;
			buttonStart = document.getElementById('btnStart');		
			buttonBack = document.getElementById('btnBack');	
				
			// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
			FastClick.attach(buttonStart);		
			FastClick.attach(buttonBack);		
	
			buttonStart.addEventListener('touchend', function(event) {				
				SelectWinner();
			}, false);
			
			buttonBack.addEventListener('touchend', function(event) {				
				RedirectToPage('index.html');
			}, false);
					
			
			
		}, false);
  

//----------------------------Events Initialization Ends---------------------------------------------------------
  
  
  
  
 // ----------------------------------------------------------------------------------------------
 function RedirectToPage(pageUrl) {
	 	
    window.location=pageUrl;
  
}

function getEmployee(tx) {
 
 var  sql = "select e.ID,e.FirstName, e.LastName, e.UniqueID, e.Image,e.Level, e.Points,e.LocationID,e.GroupID,e.IsNew,e.IsUpdate,loc.Name as locationname,g.Name as groupname "
  			  + 	" from Participants e " 
  			  +    " join Locations loc on loc.ID=e.LocationID "
  			  +   " join Groups g on g.LocationId=loc.ID and e.GroupID=g.ID "			
			  +  " order by e.LastName, e.FirstName";
			 
	/*			
	var  sql =   "select e.ID,e.FirstName, e.LastName, e.UniqueID, e.Image,e.Level, e.Points,e.LocationID,e.GroupID,e.IsNew,e.IsUpdate " + 
				"from Participants e " ;
				
		*/		
	tx.executeSql(sql, [], getEmployee_success);
}

function getEmployee_success(tx, results) {
	var len = results.rows.length;
	numberOfParticipants=len;
	//alert(len);
  for (var i=0; i<len; i++) {
    	var participant = results.rows.item(i);
	   ParticipantCollection.push(participant);	  
   }
   
   var lenCol=ParticipantCollection.length;
   //alert(lenCol);
   
}
 
// This function will authenticate the User from the Server and Get the Events information to choose for the Device..
function Authenticate(){
	
	  $('#busy').show();		
			  var xhr1 = new XMLHttpRequest();
			  //alert('1');
			 // xhr1.open('GET', 'metadata/data.txt', true);
			 xhr1.open('GET', 'http://masema.org/sync/sync.aspx?type=download&id=0&username=testgrantor@masema.com&password=abc1234&bypass=', true);
			 // Event Data Download :'http://masema.org/sync/sync.aspx?type=download&id=4&username=testgrantor@masema.com&password=abc123&bypass='
			  if (xhr1.overrideMimeType) {
			    xhr1.overrideMimeType('text/plain; charset=x-user-defined');
			  }
			 // alert('2');
			  xhr1.onreadystatechange = function(e) {
			  // alert(this.readyState+'-'+this.status);
			    if (this.readyState == 4 && this.status == 200) {
			    	//alert(this.responseText);
			    	if (this.responseText.toLowerCase().indexOf("authentication failed") >= 0) 
			    	{
			    		 // Authentication Failed 
			    		 $('#busy').hide();	
			    		 $('#message').show();	
			    		 alert('error');
			    	}
			    	else
			    	{			    		
			    		 $('#busy').hide();	
			    		 $('#login').hide();	
			    		
			    		 // Check if there are some values in the Event Table if exists then redirect directly to Index page 
			    		 // Other wise present a Event Selection page for the User	
			    		 var eventDataJSONObject = JSON.parse(this.responseText);
			    		 $('#selectevent').show();	
			    		
			    		 $(eventDataJSONObject).each(function() {  
			    		  
			    		  $('#eventlist').append('<input type="radio" name="radio-choice" id="'+ this.ID+'" value="'+this.ID +'" />'
			    		  +'<label for="'+ this.ID+'">'+ this.Name+'</label>');
			    		 	
			    		 });
			    		  
			    	  	   $('#eventlist').trigger( "create" );	 		   		  		    		
			    		 
		  			 }
				}
	};			
			  xhr1.send();
			
			
 }
 
 //------------------------------------ Event Data Download Starts-------------------------------------------------------------------
function DownloadEventData(){ 	
	
	$('#busy').html('Database...');
	$('#busy').show();
 	CleanTables();
 
 	
 	
 	// Redirect to Index Page....
 	
 }
 
 //------------------------------------ Images Download -----------------------------------------------------------------------------
 	function DownloadParticipantImages(){
    	//alert(arrImagesToDownload);
    	$('#busy').show();			
		$('#busy').html('Images...');
		mutexImages=arrImagesToDownload.length;
		//alert(mutexImages);
    	$.each(arrImagesToDownload, function(i, val) {
    				// Download Images...
    				//alert(val);
    				var imageName=val;    				
    				downloadFile(imageName);
    	 	});  	 	
    	
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
                                         
                                         	if(--mutexImages==0)
                                         	{
                                         		RedirectToPage('index.html');
                                         	}
                                           console.log("download complete: " + theFile.toURI());                                          
                                           },
                                           function(error) {
                                           	
                                           	if(--mutexImages==0)
                                         	{
                                         		RedirectToPage('index.html');
                                         	}
                                           //alert("error in download");
                                          // alert(error.code);
                                           console.log("download error source " + error.source);
                                           console.log("download error target " + error.target);
                                           console.log("upload error code: " + error.code);
                                           }
                                           );
                
                
            }, fail);        
      
 
    }  
    
    
//----------------------------------------- Database Operations Start -----------------------------------
	function  CleanTables()
    {
    	mutexDB=16;
    	//alert('Clean Tables');
    	//$('#busy').show();
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
	     , transaction_error, SaveDB_success);
    	
    	
    	
    	// Delete and Recreate Event Table 
    	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS Events');    	
	     }
	     , transaction_error, SaveDB_success);
    	
    	var sqlDeleteEvents = 
						"CREATE TABLE IF NOT EXISTS Events ( "+
						"ID INTEGER PRIMARY KEY, " +		
						"Name VARCHAR(50), " +
						"StartDate VARCHAR(50), " +											
						"EndDate VARCHAR(50))";
		
		db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlDeleteEvents);    	
	     }
	     , transaction_error, SaveDB_success);
    	
    	
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
	     , transaction_error, SaveDB_success);    	    		
    	
    	
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
	     , transaction_error, SaveDB_success);  
	     
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
	     , transaction_error, SaveDB_success);  
	     
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
						"PlusPoints INTEGER, " +		
						"MinusPoints INTEGER, " +									
						"LevelId VARCHAR(10))";
		
		
		db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlDeleteObjectives);    	
	     }
	     , transaction_error, SaveDB_success);  
	     
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
	     , transaction_error, SaveDB_success);  
	     
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
	     , transaction_error, SaveDB_success);  
	     
	     //**********************************************************************************************  
	       
	        	
    	
	     
    }
    
    function InitializeMutex()
    {
         mutexDB=0;
          //****************************** EVENT OBJECT *************************************
		             		 
								$(eventDataJSONObject).each(function() {  							
		              		   		 		              		   		 
		              		   		++mutexDB;		              		   		 
		              		   		
		              		   		  var locationObject = this.Locations;
		              		   		  
				              		       $(locationObject).each(function() { 				              		     
				              		     
				              		 	  ++mutexDB;	
				              		 	  
				              		 	   //****************************** Groups OBJECT *************************************
				              		 	   var groupObject = this.Groups;
				              		 	   var locationId=this.ID ;
				              		 	   //------------------------ Traverse Groups : START----------------------------
				              		       $(groupObject).each(function() { 				              		     
				              		     
				              		 	    ++mutexDB;	
				              		 	 
				              		       		        
				              		    }); 			              		 	  
				              		       		        
				              		    }); 
		              		   		 	              		   		 
		              		   
				              
				              		  var participantObject = this.Participants;
				              		
				              	
				              		   $(participantObject).each(function() {  
				              		   
				              		      ++mutexDB;	
				              		 
				              		     var performanceObject = this.Performance;   
				              		     
				              		    
				              		       $(performanceObject).each(function() { 	
				              		       
				              		 	    ++mutexDB;					              		 	  
				              		       		        
				              		    }); // end of performance		
				              		   
				              		   }); // end of participants


				              		    var gameObject = this.Game;
				              		    
				              		   
				              		    $(gameObject).each(function() {  
				              		    	
				              		    	 	  
				              		 	   				  ++mutexDB;	
				              		 	 			
				              		    	 	      var levelsObject = this.Levels;
				              		    	 	      
				              		    
				              		    	 	        $(levelsObject).each(function() {  
				              		    	 	        	
				              		 	   						  ++mutexDB;	
				              		 	 					   
				              		    	 	        	    var objectivesObject = this.Objectives;
				              		    	 	        	    
				              		  
				              		    	 	        	     $(objectivesObject).each(function() { 
				              		    	 	        	     
				              		 	   									  ++mutexDB;	
				              		 	 					  		
				              		    	 	        	    }); // end of Objectives
				              		    	 	        	    
				              		 
				              		    	 	        	 }); // end of Levels
				              		    	 	        	 
				              		  
				              		   
				              		   }); // end of Game
				              		    
				              		   
									}); // end of Event
		//alert(mutexDB);
    }
   
	function LoadMetadata()
    {
    	$("#eventinfo").hide();
    	   // alert('Start Loading Metadata..');
    	  //  $('#busy').show();		
			  var xhr1 = new XMLHttpRequest();
			  //alert('1');
			 // xhr1.open('GET', 'metadata/data.txt', true);
			 xhr1.open('GET', 'http://masema.org/sync/sync.aspx?type=download&id=4&username=testgrantor@masema.com&password=abc123&bypass=', true);
			 // Event Data Download :'http://masema.org/sync/sync.aspx?type=download&id=4&username=testgrantor@masema.com&password=abc123&bypass='
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
		              		 
		              		  InitializeMutex();
		              		 
		              		  var $eventinfo = $("#eventinfo");
		              		  $eventinfo.html("");  
		              		   
								$(eventDataJSONObject).each(function() {  							
		              		   		 		              		   		 
		              		   		 SaveEvent(this);	
		              		   		 
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
				              		  
				              		 // var imagelocalPath = window.rootFS.fullPath +"/photos/"+ this.Image;
				              		//  var imagelocalPath = "/photos/"+ this.Image;
				              		 // var imageName=this.Image;
				              		  
				              		  // Add into the image collection to download..
				              		  				              		  
				              		    arrImagesToDownload.push(this.Image);
				              		  
				              		 	              		  
				              		  
				              		    $eventinfo.append("<div> Image:<img src='#'" + this.Image+"'></img><br></div>");	
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
    
    function SaveGrantee(participantObj)
    {
    	//alert(granteeObj.FirstName);
    	var sql ="INSERT INTO Participants (FirstName,LastName,UniqueID,Image,Level,Points,LocationID,GroupID,IsNew,IsUpdate) VALUES ('" + participantObj.FirstName +"','"
		+ participantObj.LastName +"',"+ "'"+participantObj.UniqueID+"','"+ participantObj.Image +"'"+",'"+participantObj.Level+"','"+participantObj.Points+"','"+participantObj.LocationID+"','"+
		participantObj.GroupID +"','"+participantObj.IsNew +"','"+participantObj.IsUpdate +"')"; 
	
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     	     , transaction_error, MetadataLoadComplete_success);
			
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
	     , transaction_error, MetadataLoadComplete_success);
	     
		
    }   
    function SaveGame(gameObj)
    {
    	   	    	
    	var sql ="INSERT INTO Game (ID,Name) VALUES ('" + gameObj.ID +"','"
		+ gameObj.Name +"')"; 
		       
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, MetadataLoadComplete_success);
    }   
    function SaveLevel(levelObj)
    {
    	   	    	
    	var sql ="INSERT INTO Levels (ID,Name) VALUES ('" + levelObj.ID +"','"
		+ levelObj.Name +"')"; 
		       
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, MetadataLoadComplete_success);
    }   
    function SaveObjective(objectiveObj,levelId)
    {
    	   	    	
    	var sql ="INSERT INTO Objectives (ID,Name,PlusPoints,MinusPoints,LevelId) VALUES ('" + objectiveObj.ID 
    	+"','"+ objectiveObj.Name +"','"+  objectiveObj.PlusPoints +"','"+  objectiveObj.MinusPoints +"','"+levelId +"')"; 
		       
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, MetadataLoadComplete_success);
    }  
    function SaveEvent(eventObj)
    {
    	   	    	
    	var sql ="INSERT INTO Events (ID,Name,StartDate,EndDate) VALUES ('" + eventObj.ID +"','"
		+ eventObj.Name +"','" + eventObj.StartDate +"','" + eventObj.EndDate +  "')"; 
		       
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
	     , transaction_error, MetadataLoadComplete_success);
    } 
    function SaveGroup(groupObj,locationId)
    {
    	   	    	
    	var sql ="INSERT INTO Groups (ID,Name,Size,LocationId) VALUES ('" + groupObj.ID +"','"
		+ groupObj.Name +"','"+ groupObj.Size +"','"+ locationId +   "')"; 
		
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, MetadataLoadComplete_success);
    } 
     

 
    
    
//---------------------------------- Callback Functions-----------------------------------------------    
function fail(error) {
    console.log(error.code);
}
function MetadataLoadComplete_success() {	
	//alert(mutexDB);
	if(--mutexDB==0)
	{
		setTimeout(function(){
 			$('#busy').html('Event...');
  			DownloadParticipantImages();
		}, 10000);
	}
}

function SaveDB_success() {
	
	if(--mutexDB==0)
	{
		setTimeout(function(){
 			$('#busy').html('Event...');
  			LoadMetadata();
		}, 10000);
	}
}

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}
function DeleteTableComplete_success() {
	//$('#busy').html('Database Created');
	alert('deletetable');
}
 // function to be called at last
 
 

 //--------------------------------------------------------------------------------------------------

