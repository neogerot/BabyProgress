/* Perform Synchornization functions here*/
var db;
var myScroll;
var eventDataJSONObject;
var arrImagesToDownload = [];
//var arrImagesToUpload = [];
var eventJson = {};

//eventJson.ID = "10";
//eventJson.Name = "Masema Drive";
eventJson.Participants = [];
eventJson.Locations = [];

var locationId;
var groupId;

//----------------------- Mutex -------------
var mutexDB=0;
var mutexDownloadImages;
var mutexUploadImages;
//----------------------


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
    window.location=pageUrl+"?locationId="+locationId;
}


  /*  File System 
   * 
   */
  
function gotFS(fileSystem) {
    console.log("got filesystem");
    //alert("file system loaded");
    $('#busy').hide();
    // save the file system for later access
   // console.log(fileSystem.root.fullPath);
    window.rootFS = fileSystem.root;
	
	//uploadPhoto(window.rootFS.fullPath + "/photos/" + "testupload18.jpg");
}

    document.addEventListener('deviceready', function() {                
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}, false);

	window.addEventListener('load', function() {
			var buttonBack;	
			var buttonLottery;
			
			buttonBack = document.getElementById('btnBack');
			buttonLottery  = document.getElementById('btnLottery'); 
			// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
			FastClick.attach(buttonBack);		
			FastClick.attach(buttonLottery);		
	
			buttonBack.addEventListener('touchend', function(event) {
				 RedirectToPage('index.html'); 
			}, false);
			
			buttonLottery.addEventListener('touchend', function(event) {
						RedirectToPage('lottery.html');
					}, false);
			
			
		}, false);
  
document.addEventListener("deviceready", onDeviceReady, false);



function getUrlVars() {
	//alert('hi');
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

function onDeviceReady() {	
    db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);    
    
    locationId= getUrlVars()["locationId"];
    groupId= getUrlVars()["groupId"];
    
       
    $('#busy').hide();
    
    // Assign the hindi lables
    $('#btnLottery').html('<br>'+SYNCHRONIZE_BUTTON_LOTTERY);
    $('#btnBack').html('<br>'+SYNCHRONIZE_BUTTON_BACK);
    $('#btnUploadParticipantImages').html('<br>'+SYNCHRONIZE_BUTTON_UPLOADDATA);
    
    
   db.transaction(function(tx)
			     {	     	
			     	tx.executeSql("Select ID,Name,AmountPerParticipant,BaseAmount from Events ",[],GetEventData_success);    	
			     }
			     , transaction_error);
}
function GetEventData_success(tx,results)
{
	  var len = results.rows.length;
	  
	   for (var i=0; i<len; i++) {
	 		var eventData = results.rows.item(i);	
	 		eventJson.ID = eventData.ID;
			eventJson.Name = eventData.Name;
	 	}
}

    
//-------------------------------------------  Synchronize Functions ---------------------------------------

function UploadData()
{
	$('#busy').show();
	db.transaction(UploadParticipantData, transaction_error);
}

function UploadParticipantData(tx)
{       
     var sql = "Select FirstName,LastName,UniqueID,Image,Level,Points,LocationID,GroupID,IsNew,IsUpdate,Category,Influencer,InfluencerID,Payout from Participants";
     var pLen,DTO;
     
     
     tx.executeSql(sql, [], function(tx, results) {
                pLen = results.rows.length;
                eventJson.Participants = [];
                for (var i = 0; i < pLen; i++) {
                    var participant = results.rows.item(i);
                    eventJson.Participants.push(participant);
                    // Push into Images to Upload
                    //arrImagesToUpload.push(participant.Image);

                    tx.executeSql('Select ObjectiveID, Completed from Performance where UniqueID = ?',
                    [participant.UniqueID],
                    function(innerId, index) {
                        return (
                          function(tx, results) {
                              //alert(innerId);
                              var len = results.rows.length;
                              eventJson.Participants[index].Performance = [];
                              for (var j = 0; j < len; j++) {
                                  var performance = results.rows.item(j);
                                  eventJson.Participants[index].Performance.push(performance);
                              }
                              if(index==pLen-1)
                              {
                              	
                              	 tx.executeSql("select ID,WinnerID,WinningAmount from Locations",[],AppendLocations)
                                 //DTO = JSON.stringify(eventJson);
           					     //  UploadtoServer(DTO);
           					    // alert(DTO);
           					     
           					   //  $('#eventinfo').append(DTO);
           					   }
                          }
                       );
                    } (participant.UniqueID, i)
                );
                }
            });
}

function AppendLocations(tx,results)
{
	 var len = results.rows.length;
     eventJson.Locations = [];
                for (var i = 0; i < len; i++) {
                    var evtLocation = results.rows.item(i);
                    eventJson.Locations.push(evtLocation);
                   }
	
	 DTO = JSON.stringify(eventJson);	 
     UploadtoServer(DTO);
}


function UploadtoServer(participantPerformance)
{
	
	var uploadurl='http://www.masema.org/sync/sync.aspx';
	
	$.ajax({
    type       : "POST",
    url        : uploadurl,
    crossDomain: true,
    beforeSend : function() {$('#busy').show(); $('#busy').html(SYNCHRONIZE_MESSAGE_UPLOADINGDATA);},
    complete   : function() {},
    data       : {username : 'admin', password : 'admin',bypass:'1',type:'upload',upload:participantPerformance},
    dataType   : 'json',
    success    : function(response) {
        //console.error(JSON.stringify(response));
      // alert('Data Uploaded'+ response);
       eventDataJSONObject = response;
       if(eventDataJSONObject==false)
       {
       	// alert('Error while Uploading data');
       	  alert(SYNCHRONIZE_MESSAGE_ERRORUPLOADINGDATA); 
       	  $('#busy').hide(); 
	       	return;
       }
       $('#busy').html(SYNCHRONIZE_MESSAGE_UPLOADINGIMAGES);
       UploadParticipantImages();
      // CleanTables();
      // UploadParticipantImages();
    },
    error      : function() {
        //console.error("error");
        alert(SYNCHRONIZE_MESSAGE_ERRORUPLOADINGDATA);  
        $('#busy').hide();
                        
    }
}); 
}


//----------------------------------------- Database Operations Start -----------------------------------
	function CleanTables()
    {
    	mutexDB=16;
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
	     
	     //**************************************************************************************************   
	     
	     
	     
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

function MetadataLoadComplete_success() {	
	//alert(mutexDB);
	if(--mutexDB==0)
	{
		$('#busy').html(SYNCHRONIZE_MESSAGE_DOWNLOADINGIMAGES);
		
		if(arrImagesToDownload.length>0)
		{
			DownloadParticipantImages();	
		}
		else
		{
			$('#busy').html(SYNCHRONIZE_MESSAGE_UPLOADSUCCESSFUL);
            $('#busy').hide();
		}
	}
}

function SaveDB_success() {
	
	if(--mutexDB==0)
	{
		$('#busy').html(SYNCHRONIZE_MESSAGE_DOWNLOADINGDATA);
		LoadMetadata();		
	}
}

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

function DeleteTableComplete_success() {	
	
}
 // function to be called at last
 

//------------------------------------ Download Images-------------------
    
 function DownloadParticipantImages(){
    	
		mutexDownloadImages=arrImagesToDownload.length;
		$('#busy').html(mutexDownloadImages);
    	$.each(arrImagesToDownload, function(i, val) {
    				// Download Images...
    				//alert(val);
    				var imageName=val;    				
    				downloadFile(imageName);
    	 	});  	 	
    	
    }

 function downloadFile(imagename){
	  // alert('download start'+imagename);      
	 //  alert(window.rootFS.fullPath);
       window.rootFS.getDirectory("photos", {create: true, exclusive: false}, function(dir) { 
                // Directory for downloaded photos created..
              //  alert("Directory found...downloading..");
                var fileTransfer = new FileTransfer();
                fileTransfer.download(
                                           "http://www.masema.org/data/images/"+imagename,
                                           window.rootFS.fullPath + "/photos/" +imagename,
                                           function(theFile) {
                                         //  alert("download complete");
                                          $('#busy').html(mutexDownloadImages);
                                         	if(--mutexDownloadImages==0)
                                         	{                                         		
                                         		$('#busy').html(SYNCHRONIZE_MESSAGE_UPLOADSUCCESSFUL);
                                         		$('#busy').hide();
                                         		
                                         	}
                                           console.log("download complete: " + theFile.toURI());                                          
                                           },
                                           function(error) {
                                           	$('#busy').html(mutexDownloadImages);
                                           	if(--mutexDownloadImages==0)
                                         	{
                                         		$('#busy').html(SYNCHRONIZE_MESSAGE_UPLOADSUCCESSFUL);
                                         		$('#busy').hide();
                                         		
                                         	}
                                           //alert("error in download");
                                          // alert(error.code);
                                           console.log("download error source " + error.source);
                                           console.log("download error target " + error.target);
                                           console.log("upload error code: " + error.code);
                                           }
                                           );
                
                
            }, DownloadFilefail);        
      
 
    }
    
 function DownloadFilefail()
 {
 	$('#busy').html(mutexDownloadImages);
	if(--mutexDownloadImages==0)
     {
     	$('#busy').html(SYNCHRONIZE_MESSAGE_UPLOADSUCCESSFUL);
       $('#busy').hide();       
     }
 }  
  
    
//------------------------------- Upload Images --------------------------
 function  UploadParticipantImages()
 {
 	window.rootFS.getDirectory("photos", {create: false, exclusive: false}, getDirSuccess, failUploadDirectory);
 
 }  
 
 function failUploadDirectory(){
 	 $('#busy').html('..');
 	 //alert('hi');
     DeleteImages();
 }
 
 
  
 function getDirSuccess(dirEntry) {
   // alert('dirEntry');
   // Get a directory reader
    var directoryReader = dirEntry.createReader();

    // Get a list of all the entries in the directory
    directoryReader.readEntries(readerSuccess,fail);
    
  }
  
 function readerSuccess(entries) {
  //  alert('entries')
    var i;
    mutexUploadImages=entries.length;
    $('#busy').html(mutexUploadImages);
    for (i=0; i<entries.length; i++) {
        if (entries[i].name.indexOf(".jpg") != -1) {
          // alert(window.rootFS.fullPath + "/photos/" + entries[i].name);
            uploadPhoto(window.rootFS.fullPath + "/photos/" + entries[i].name);
        }
    }
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
			//alert(imageURI);
			
            var ft = new FileTransfer();
            ft.upload(imageURI, encodeURI("http://masema.org/sync/uploadimage.aspx"), UploadFileSuccess, UploadFilefail, options);
        }  
        
 function UploadFileSuccess(r) {
           // alert("upload done:"+r.response+r.responseCode+r.bytesSent);
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
           $('#busy').html(mutexUploadImages);
           if(--mutexUploadImages==0)
           {
           	 $('#busy').html(SYNCHRONIZE_MESSAGE_DELETINGLOCALDATA);
           	 DeleteImages();
           }
      }
      
 function UploadFilefail()
 {
 	$('#busy').html(mutexUploadImages);
	if(--mutexUploadImages==0)
     {
       $('#busy').html(SYNCHRONIZE_MESSAGE_DELETINGLOCALDATA);
       DeleteImages();
     }
 } 
 
//------------------------------------ Delete Images------------------------------------
 function DeleteImages()
 {
 	window.rootFS.getDirectory("photos", {create: false, exclusive: false}, getDirForDeleteSuccess, failDeleteDirectory);
 }
 
 function failDeleteDirectory(){
    //	alert('Error in Delete Directory');
 	 $('#busy').html(SYNCHRONIZE_MESSAGE_DELETINGLOCALDATA);
     CleanTables();
 }
 
 function getDirForDeleteSuccess(dirEntry) {
    //alert('hiii');
   // Get a directory reader
    var directoryReader = dirEntry.createReader();

    // Get a list of all the entries in the directory
    directoryReader.readEntries(readerForDeleteSuccess,fail);
    
  }
  
  function readerForDeleteSuccess(entries) {
  //  alert('entries')
    var i;
    mutexUploadImages=entries.length;
    $('#busy').html(mutexUploadImages);
    for (i=0; i<entries.length; i++) {
        if (entries[i].name.indexOf(".jpg") != -1) {
            entries[i].remove(DeleteSuccess, Deletefail);
        }
    }
}

  function DeleteSuccess(){
  	 $('#busy').html(mutexUploadImages);
	if(--mutexUploadImages==0)
           {
           	 $('#busy').html(SYNCHRONIZE_MESSAGE_DELETINGLOCALDATA);
           	 CleanTables();
           }
	
}
  
  function Deletefail(){
  	 $('#busy').html(mutexUploadImages);
	if(--mutexUploadImages==0)
           {
           	 $('#busy').html(SYNCHRONIZE_MESSAGE_DELETINGLOCALDATA);
           	 CleanTables();
           }
}
   
//------------------------------------------------------------------------------------   