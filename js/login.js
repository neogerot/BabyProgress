/* Perform Login functions here*/
var db;

//------------------------------ Initialize System Resources---------------------------------------------------
window.addEventListener('load', function() {
			var buttonLogin,buttonSelectEvent;	
			buttonLogin = document.getElementById('btnLogin');
			buttonSelectEvent = document.getElementById('btnSelectEvent');
			
	
			// Android 2.2 needs FastClick to be instantiated before the other listeners so that the stopImmediatePropagation hack can work.
			FastClick.attach(buttonLogin);		
			FastClick.attach(buttonSelectEvent);
	
			buttonLogin.addEventListener('touchend', function(event) {				
				Authenticate();
			}, false);
			
			buttonSelectEvent.addEventListener('touchend', function(event) {				
				DownloadEventData();
			}, false);
			
			
		}, false);
  
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {	
    db = window.openDatabase("GranteeDirectoryDB", "1.0", "PhoneGap Demo", 200000);    
    $('#busy').hide();
    $('#message').hide();	
    $('#selectevent').hide();	 
}
  
 // ----------------------------------------------------------------------------------------------
 function RedirectToPage(pageUrl) {
	$('#busy').hide();
	//alert("Employee Deleted");		
    window.location=pageUrl;
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
 function DownloadEventData(){ 	
 	
 	// Redirect to Index Page..
 	RedirectToPage('index.html');
 }

