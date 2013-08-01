/* Perform Login functions here*/
var db;
var arrImagesToDownload = [];
var eventDataJSONObject;
var loginInfoJSONObject;
var eventId;
var locationId;
var flagDataExist=0;
var UserCollection = {};	
//-----------Mutex-----------
var mutexDB=0;
var mutexImages;
var mutexReset;
var mutexUsers=0;
var loggedInUserName;

//---------------------

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
}

//-----------------------------File System Initialization Ends ----------------------------------------------

//----------------------------Events Initialization Starts---------------------------------------------------------
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {	
    db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);    
    $('#busy').hide();
    $('#message').hide();	
  
    // Assign Hindi Texts  
  
     $('#selectevent').attr('style','visibility:hidden');
   
    
     $('#mainHeading').html(LOGIN_HEADING_MAIN);
    
     $('#btnLogin').html('<br>'+ LOGIN_BUTTON_LOGIN);
     $('#btnBack').html('<br>'+ LOGIN_BUTTON_BACK);
     $('#btnResetOption').html('<br>'+LOGIN_BUTTON_RESETOPTION);
     $('#btnReset').html('<br>'+LOGIN_BUTTON_RESET);
  
     $('#username').attr("placeholder",LOGIN_TEXTBOX_PLACEHOLDER_USERNAME);
     $('#password').attr("placeholder",LOGIN_TEXTBOX_PLACEHOLDER_PASSWORD);
       
     $('#message').html(LOGIN_MESSAGE_ERROR_AUTHENTICATION);
     $('#selecteventlabel').html('<strong>'+LOGIN_LABEL_SELECTLOCATION+'</strong>');
        

    db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('select ID from events',[],CheckData_success);	     	
	     }
	     , EventTable_error); 
	     
	     
}
function EventTable_error(tx, error)
{
	
}
function CheckData_success(tx,results)
{
	  
	
	var len = results.rows.length;
	if(len>0){
		flagDataExist=1;
		eventId=results.rows.item(0).ID;
		
		 db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('select ID,UserName,Password from Users',[],PopulateUserCollection_success);	     	
	     }
	     , EventTable_error); 
	}
	else{
		flagDataExist=0;		
	}
	
	
	 // 
}
function PopulateLocations_success(tx,results)
{
   	var len = results.rows.length;	
	
   for (var i=0; i<len; i++) {
    	var location = results.rows.item(i);
	    $('#eventlist').append('<a href="index.html?locationId='+ location.ID +'" target="_self" style="text-decoration:none;"><li>' +
	 '<h2>'+ location.Name +'</h2></li></a>');
   } 	
	  $('#eventlist').trigger( "create" );	 
	  $('#wrapper').trigger( "create" );	
	  
	
	
}
function PopulateUserCollection_success(tx,results)
{
	var len = results.rows.length;	

   for (var i=0; i<len; i++) {
    	var appUser = results.rows.item(i);
	    UserCollection[appUser.UserName.toLowerCase()]=appUser.Password;
   } 	
   	
       
}

window.addEventListener('load', function() {
			var buttonLogin,buttonSelectEvent,buttonBack;	
			//buttonLogin = document.getElementById('btnLogin');
			
			buttonBack = document.getElementById('btnBack');
			
	
			// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
			//FastClick.attach(buttonLogin);		
			
			FastClick.attach(buttonBack);
	
	/*
			buttonLogin.addEventListener('touchend', function(event) {				
				Authenticate();
			}, false);
			
	*/
			buttonBack.addEventListener('touchend', function(event) {				
				RedirectToPage('login.html');
			}, false);
			
			
			
		}, false);
  

//----------------------------Events Initialization Ends---------------------------------------------------------
  
  
  
  
 // ----------------------------------------------------------------------------------------------
 function RedirectToPage(pageUrl) {
 		
	setTimeout(function(){ 	
    window.location=pageUrl;
}, 100);
 	
   
}  
 function LoginExistingUser_success()
 {
 
 			  $('#busy').hide();	
			  
			  $('#login').attr('style','visibility:hidden');				    		
			 
			  $('#selectevent').attr('style','visibility:visible');	
			  
			  $('#selecteventlabel').attr('style','visibility:visible');	
			  $('#btnBack').show();
			  
			  PopulateLocations();
 }
 
// This function will authenticate the User from the Server and Get the Events information to choose for the Device..

function Authenticate(){
	
	 // First try to authenticate locally..	 
	
	$('#busy').html(LOGIN_MESSAGE_BUSY_AUTHENTICATION); // Authenticating
	$('#busy').show();	
	loggedInUserName=$('#username').val().toLowerCase();
	
	 if($.md5($('#password').val())==UserCollection[loggedInUserName])
	 {
	 	// If successful show option to selec the location if flagDataExist==1
	 	if(flagDataExist==1)
	  	  {	  	  	
			  // Make an entry into Login Table
				db.transaction(function(tx)
				     {	     	
				     	tx.executeSql("INSERT INTO LoginStatus (Status,UserName) VALUES ('1','"+ loggedInUserName +"')");    	
				     }
				     , transaction_error,LoginExistingUser_success);		
	  	  	return;
	  	  }      		
	 }
	 
		
			  var xhr1 = new XMLHttpRequest();
			 
			 xhr1.open('GET', "http://masema.org/sync/sync.aspx?type=download&id=0&username="+$('#username').val()+"&password="+$('#password').val(), true);
			 // Event Data Download :'http://masema.org/sync/sync.aspx?type=download&id=4&username=testgrantor@masema.com&password=abc123&bypass='
			  if (xhr1.overrideMimeType) {
			    xhr1.overrideMimeType('text/plain; charset=UTF-8');
			  }
			
			  xhr1.onreadystatechange = function(e) {
			
			    if (this.readyState == 4 && this.status == 200) {
			    	
			    	if (this.responseText.toLowerCase().indexOf("authentication failed") >= 0) 
			    	{
			    		 // Authentication Failed 
			    		 $('#busy').hide();	
			    		 $('#message').show();	
			    		
			    	}
			    	else
			    	{			    		
			    		$('#login').hide();
			    		$('#btnBack').show();
			    		 // Check if there are some values in the Event Table if exists then redirect directly to Index page 
			    		 if(flagDataExist==1)
			    		 {
			    		 	 // Make an entry into Login Table
									db.transaction(function(tx)
									     {	     	
									     	tx.executeSql("INSERT INTO LoginStatus (Status,UserName) VALUES ('1','"+ loggedInUserName +"')");    	
									     }
									     , transaction_error,LoginExistingUser_success);		
						  	  	return;
			    		 }
			    		 
			    		 
			    		 // Other wise present a Event Selection page for the User	
			    		 loginInfoJSONObject=JSON.parse(this.responseText);
			    		 
			    		 eventDataJSONObject = loginInfoJSONObject.Event;
			    		 
			    		 
			    		 
			    		 var usersJSONObject = loginInfoJSONObject.Users;
			    		 
			    		 // Traverse all the Users Objects..
			    		 mutexUsers=0;
			    		   $(usersJSONObject).each(function() {  			    		  
			    		 				    		  
			    		 		 mutexUsers++;
			    		 });
			    		  
			    		  $(usersJSONObject).each(function() {  			    		  
			    		 				    		  
			    		 		 SaveUser(this);
			    		 });
			    	 
		  			 }
				}
				else if(this.readyState == 4 && this.status != 200)
				{
					 alert(LOGIN_MESSAGE_ERROR_NETWORK);
				     $('#busy').hide();	
				}
	};			
			  xhr1.send();
			
			
 }
 
 //------------------------------------ Event Data Download Starts-------------------------------------------------------------------

 
 //------------------------------------ Images Download -----------------------------------------------------------------------------
 	function DownloadParticipantImages(){
    	
    	$('#busy').show();		
		mutexImages=arrImagesToDownload.length;
		$('#busy').html(mutexImages);
		
		
	    	$.each(arrImagesToDownload, function(i, val) {
	    				// Download Images...
	    				
	    				var imageName=val;    				
	    				downloadFile(imageName);
	    	 	});  	 	
    	
    	
    }
    
 
	function downloadFile(imagename){
	
       window.rootFS.getDirectory("photos", {create: true, exclusive: false}, function(dir) { 
                // Directory for downloaded photos created..
             
                var fileTransfer = new FileTransfer();
                fileTransfer.download(
                                           "http://www.masema.org/data/images/"+imagename,
                                           window.rootFS.fullPath + "/photos/" +imagename,
                                           function(theFile) {
                                       
                                            $('#busy').html(mutexImages);
                                         	if(--mutexImages==0)
                                         	{                                         		
                                         				 									 
			 									   // make an entry into Login Table
												db.transaction(function(tx)
												     {	     	
												     	tx.executeSql("INSERT INTO LoginStatus (Status,UserName) VALUES ('1','"+ loggedInUserName +"')");    	
												     }
												     , transaction_error,LoginExistingUser_success);	
			 									 return;
			 
                                         	}
                                           console.log("download complete: " + theFile.toURI());                                          
                                           },
                                           function(error) {
                                           	 $('#busy').html(mutexImages);
                                           	if(--mutexImages==0)
                                         	{
                                         		
			 									 $('#selectevent').attr('style','visibility:visible');
			 									 $('#btnBack').show();
			 									   // make an entry into Login Table
												db.transaction(function(tx)
												     {	     	
												     	tx.executeSql("INSERT INTO LoginStatus (Status,UserName) VALUES ('1','"+ loggedInUserName +"')");    	
												     }
												     , transaction_error,LoginExistingUser_success);	
			 									 return;
                                         	}
                                         
                                           console.log("download error source " + error.source);
                                           console.log("download error target " + error.target);
                                           console.log("upload error code: " + error.code);
                                           }
                                           );
                
                
            }, DownloadFilefail);        
      
 
    }  
    
    
//----------------------------------------- Database Operations Start -----------------------------------
	function CleanTables()
    {
    	mutexDB=18;
    	//alert('Clean Tables');
    	//$('#busy').show();
    	/*------------------ delete and recreate all the tables ----------------------------------*/
    	
    	// Delete and Recreate Participants Table 
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
						"Category INTEGER, " +
						"Influencer INTEGER, " +
						"InfluencerID INTEGER, " +
						"Payout INTEGER, " +
						"Level INTEGER, " +
						"Points INTEGER, " +
						"LocationID VARCHAR(10), " +						
						"GroupID VARCHAR(10), " +						
						"IsNew INTEGER, " +
						"IsUpdate INTEGER, " +
						"TodayPoints INTEGER, " +
						"IsLevelCompleted INTEGER)";
		
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
						"AmountPerParticipant INTEGER, " +	
						"BaseAmount INTEGER, " +	
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
						"Name VARCHAR(100), "+ 
						"InfluencerRegAmount INTEGER, "+ 
						"InfluencerPerformanceAmount INTEGER, "+ 
						"PregnancyLevelID INTEGER, "+
						"NewMomLevelID INTEGER)";
		
		
		db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlDeleteGame);    	
	     }
	     , transaction_error, SaveDB_success);  
	     
	     //**********************************************************************************************
	     
	     //********************************* Delete and Recreate Levels Table ******************************
    	
    	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS Levels');    	
	     }
	     , transaction_error, SaveDB_success);
    	
    	var sqlDeleteLevels = 
						"CREATE TABLE IF NOT EXISTS Levels ( "+												
						"ID VARCHAR(10), " +	
						"LevelNo INTEGER, " +										
						"Name VARCHAR(100))";
		
		
		db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlDeleteLevels);    	
	     }
	     , transaction_error, SaveDB_success);  
	     
	     //**********************************************************************************************
	     
	     //********************************* Delete and Recreate Objectives Table ******************************
    	
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
						"Mandatory INTEGER, " +	
						"Sequence INTEGER, " +									
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
						"WinnerID VARCHAR(50), " +	
						"WinningAmount INTEGER, " +
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
	       
	    //********************************* Delete and Recreate LoginStatus Table ******************************
    	
    	db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS LoginStatus');    	
	     }
	     , transaction_error, SaveDB_success);
    	
    	var sqlDeleteLoginStatus = 
						"CREATE TABLE IF NOT EXISTS LoginStatus ( "	
						+"UserName INTEGER, "
						+"Status INTEGER)";
		
		
		db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlDeleteLoginStatus);    	
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
    	  	
			 	  	 	 //****************************** EVENT OBJECT *************************************
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
    
    function SaveGrantee(participantObj)
    {
    	//alert(granteeObj.FirstName);
    	var sql ="INSERT INTO Participants (FirstName,LastName,UniqueID,Image,Category,Influencer,InfluencerID,Payout,Level,Points,LocationID,GroupID,IsNew,IsUpdate,TodayPoints,IsLevelCompleted) VALUES ('" 
    	+ participantObj.FirstName  + "','"
		+ participantObj.LastName + "','" + participantObj.UniqueID+"','"+ participantObj.Image +"','"
		+ participantObj.Category + "','" + participantObj.Influencer +"','"
		+ participantObj.InfluencerID +"','"+ participantObj.Payout+"','"
		+ participantObj.Level+"','"+participantObj.Points+"','"+participantObj.LocationID+"','"
		+ participantObj.GroupID +"','"+participantObj.IsNew +"','"+participantObj.IsUpdate +"','0','0')";   
	
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     	     , transaction_error, MetadataLoadComplete_success);
			
    }    
    
    function SaveUser(userObj)
    {
    	//alert(granteeObj.FirstName);LastName
    	var sql ="INSERT INTO Users (ID,FirstName,LastName,UserName,Password) VALUES ('" + userObj.UniqueID +"','"
		+ userObj.FirstName +"',"+ "'"+userObj.LastName+"','"+ userObj.UserName +"','"+userObj.Password +"')"; 
	
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     	     , transaction_error, SaveUser_success);			
    } 
    function SaveUser_success()
    {
    	if(--mutexUsers==0)
    	{
    		CleanTables();
    	}
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
    	   	    	
    	var sql ="INSERT INTO Game (ID,Name,InfluencerRegAmount,InfluencerPerformanceAmount,PregnancyLevelID,NewMomLevelID) VALUES ('" + gameObj.ID 
    	+"','"+ gameObj.Name +"','"+ gameObj.InfluencerRegAmount +"','"+ gameObj.InfluencerPerformanceAmount +"','"+ gameObj.PregnancyLevelID +"','"+gameObj.NewMomLevelID 
    	+"')"; 
		       
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, MetadataLoadComplete_success);
    }   
    
    function SaveLevel(levelObj)
    {
    	   	    	
    	var sql ="INSERT INTO Levels (ID,LevelNo,Name) VALUES ('" + levelObj.ID +"','"+ levelObj.LevelNo + "','" 
		+ levelObj.Name +"')"; 
		       
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, MetadataLoadComplete_success);
    }   
    function SaveObjective(objectiveObj,levelId)
    {
    	   	    	
    	var sql ="INSERT INTO Objectives (ID,Name,PlusPoints,MinusPoints,Mandatory,Sequence,LevelId) VALUES ('" + objectiveObj.ID 
    	+"','"+ objectiveObj.Name +"','"+  objectiveObj.PlusPoints +"','"+  objectiveObj.MinusPoints +"','"+  objectiveObj.Mandatory +"','"+  objectiveObj.Sequence +"','"
    	+levelId +"')"; 
		       
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, MetadataLoadComplete_success);
    }  
    function SaveEvent(eventObj)
    {
    	   	    	
    	var sql ="INSERT INTO Events (ID,Name,AmountPerParticipant,BaseAmount,StartDate,EndDate) VALUES ('" + eventObj.ID 
    	+"','"+ eventObj.Name +"','" + eventObj.AmountPerParticipant +"','"+ eventObj.BaseAmount +"','" +eventObj.StartDate +"','" + eventObj.EndDate +  "')"; 
		       
	     db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sql);	     	
	     }
	     , transaction_error, MetadataLoadComplete_success);
    } 
    function SaveLocation(locationObj)
    {
    	   	    	
    	var sql ="INSERT INTO Locations (ID,Name,WinnerID,WinningAmount,City,State) VALUES ('" + locationObj.ID +"','"
		+ locationObj.Name +"','" + locationObj.WinnerID +"','" + locationObj.WinningAmount +"','" + locationObj.City +"','" + locationObj.State +  "')"; 
		       
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
function DownloadFilefail()
{
	$('#busy').html(mutexImages);
	if(--mutexImages==0)
     {
      					
			 			$('#selectevent').attr('style','visibility:visible');
			 			$('#btnBack').show();
			 			$('#busy').hide();
			 			
			db.transaction(function(tx)
			     {	     	
			     	tx.executeSql("INSERT INTO LoginStatus (Status,UserName) VALUES ('1','"+ loggedInUserName +"')");    	
			     }
			     , transaction_error,LoginExistingUser_success);	
			 									
	   return;
     }
}
function PopulateLocations()
{
    // Populate Locations to select for working
		 db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('select ID,Name,City,State from Locations',[],PopulateLocations_success);	     	
	     }
	     , EventTable_error); 
}
function MetadataLoadComplete_success() {	
	//alert(mutexDB);
	if(--mutexDB==0)
	{
		$('#busy').html('..........');
	   if(arrImagesToDownload.length > 0 )
        {
        	DownloadParticipantImages(); 		
        }
        else
        {
        	  // make an entry into Login Table
			db.transaction(function(tx)
		     {	     	
		     	tx.executeSql("INSERT INTO LoginStatus (Status) VALUES ('1')");    	
		     }
		     , transaction_error,LoginExistingUser_success);	
			 return;
        }
	}
}

function SaveDB_success() {
	
	if(--mutexDB==0)
	{
		$('#busy').html(LOGIN_MESSAGE_BUSY_DOWNLOADING); // Downloading
  		LoadMetadata();		
	}
}

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

 // function to be called at last
 
 //----- Reset Functionality
 function ShowResetOption(){
 	 $('#busy').hide();	
	 $('#login').hide();
 	 $('#resetdevice').show();
 	 $('#btnBack').show();
 }
 
function ResetDevice(){
	mutexReset=3;
	$('#busy').show();
	$('#busy').html(LOGIN_MESSAGE_BUSY_DELETEDATA);		// Deleting Data
	
    	// Delete Event Table 
    db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS Events');    	
	     }
	     , transaction_error,ResetDevice_success);
	    
	     // Delete and Recreate grantee Table 
   db.transaction(function(tx)
	     {	     	
	     	tx.executeSql('DROP TABLE IF EXISTS Users');    	
	     }
	     , transaction_error, ResetDevice_success);
    	
    	
    var sqlCreateUsers = 
						"CREATE TABLE IF NOT EXISTS Users ( "+
						"ID INTEGER PRIMARY KEY , " +		
						"FirstName VARCHAR(50), " +
						"LastName VARCHAR(50), " +
						"UserName VARCHAR(50), " +
						"Password VARCHAR(100))";
		
	setTimeout(function(){ 	
   		 db.transaction(function(tx)
	     {	     	
	     	tx.executeSql(sqlCreateUsers);    	
	     }
	     , transaction_error, ResetDevice_success);
		}, 5000);
		
	
	
 }
 function ResetDevice_success()
 {
 	if(--mutexReset==0)
 	{	
   		$('#busy').html(LOGIN_MESSAGE_BUSY_DELETEDATACONFIRM); // Reset Complete			
 		 		
 		setTimeout(function(){ 	
   			RedirectToPage('login.html'); 
		}, 5000);
    		
    }
 }
 
 
function convertToEntities(inputStr) {
  var tstr = inputStr;
  var bstr = '';
  for(i=0; i<tstr.length; i++)
  {
    if(tstr.charCodeAt(i)>127)
    {
      bstr += '&#' + tstr.charCodeAt(i) + ';';
    }
    else
    {
      bstr += tstr.charAt(i);
    }
  }
 }
 //--------------------------------------------------------------------------------------------------

