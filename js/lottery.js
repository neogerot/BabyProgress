/* Perform Login functions here*/
var count;	
			var timesToRotate;	
			var numberOfParticipants;	
			var myParticipants = [];
			var currentParticipant;
			var speed=300;
			var winneruid;
			var ParticipantCollection = [];	
			var locationId;
			
			$('#winner').hide();	
			
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
		
			function Initialize(){
			    count= 1 + Math.floor(Math.random() * numberOfParticipants);
			    timesToRotate=10;			    
			    currentParticipant=0;	
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
			        var imagerootPath=window.rootFS.fullPath+'/photos/';
			       // var imagerootPath='images/';
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
				// Save the Winner of the location in the database
				  var sqlSaveWinner = "Update Locations set WinnerID='"+  ParticipantCollection[currentParticipant].UniqueID +"'"
							 + " where ID="+ locationId;
				  db.transaction(function(tx)
				     {	     	
				     	tx.executeSql(sqlSaveWinner);    	
				     }
				     , transaction_error, SaveWinner_success);  		    
			}
			
			function SaveWinner_success()
			{
				$('#counter').append(' <h3>'+LOTTERY_MESSAGE_WINNER+ " : " + ParticipantCollection[currentParticipant].FirstName+ ' '+ParticipantCollection[currentParticipant].LastName
				   			+ ' ('+ParticipantCollection[currentParticipant].locationname +')' 
				   			+ '<br> '+ParticipantCollection[currentParticipant].WinningAmount+'</h3>');
			  
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
    locationId= getUrlVars()["locationId"];
    
     $('#btnBack').html('<br>'+ LOTTERY_BUTTON_BACK);
    
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
	 	
    window.location=pageUrl+"?locationId="+locationId;
  
}

function getEmployee(tx) {
 
 var  sql = "select e.ID,e.FirstName, e.LastName, e.UniqueID, e.Image,e.Level, e.Points,e.LocationID,e.GroupID,e.IsNew,e.IsUpdate,e.IsLevelCompleted,loc.WinningAmount,loc.Name as locationname "
  			  + 	" from Participants e " 
  			  +    " join Locations loc on loc.ID=e.LocationID "
  			  +   " where e.LocationID=" + locationId +" and IsLevelCompleted=1 "	
			  +  " order by e.LastName, e.FirstName";
			 			
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
 

 
    
    
//---------------------------------- Callback Functions-----------------------------------------------    
function fail(error) {
    console.log(error.code);
}

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

 
 

 //--------------------------------------------------------------------------------------------------

