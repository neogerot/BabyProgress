/* Perform Synchornization functions here*/
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

  /*  File System 
   * 
   */
  function gotFS(fileSystem) {
    console.log("got filesystem");
    // save the file system for later access
   // console.log(fileSystem.root.fullPath);
    window.rootFS = fileSystem.root;
	$('#btnSynchronize').attr('onclick',"downloadFile();");
}

  document.addEventListener('deviceready', function() {                
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}, false);
  
  
  var eventDataJSONObject;
 
   $(function () {
    if (!window.FileReader || !window.ArrayBuffer) {
      alert("You will need a recent browser to use this demo :(");
      return;
    }


    var $result = $("#result");
    $("#file").on("change", function(evt) {
      // remove content
      $result.html("");

      // see http://www.html5rocks.com/en/tutorials/file/dndfiles/

      var files = evt.target.files;
     // alert(files);
      for (var i = 0, f; f = files[i]; i++) {

        if (f.type != "application/zip") {
          $result.append("<div class='warning'>" + f.name + " isn't a 'application/zip', opening it as a zip file may not work :-)</div>");
        }
        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            var $title = $("<h3>", {
              text : theFile.name
            });
            $result.append($title);
            var $ul = $("<ul>");
            try {

              var dateBefore = new Date();
              // read the content of the file with JSZip
              var zip = new JSZip(e.target.result);
              var dateAfter = new Date();

              $title.append($("<span>", {
                text:" (parsed in " + (dateAfter - dateBefore) + "ms)"
              }));

              // that, or a good ol' for(var entryName in zip.files)
              $.each(zip.files, function (index, zipEntry) {
                $ul.append("<li>" + zipEntry.name + "</li>");
               if(zipEntry.name=="data/images")
               {
               	 alert('data/images/');
               }
               //http://107.21.201.107/ziphandler/images/010001.jpg
                if(zipEntry.name=="data/data.txt")
                {
                	 // alert(zipEntry.asText());
              		  eventDataJSONObject = JSON.parse(zipEntry.asText());
              		  //alert('JSON object Initialized');      
              		  var $eventinfo = $("#eventinfo");
              		  $eventinfo.html("");  
              		   
						$(eventDataJSONObject).each(function() {  
							 $eventinfo.append("<div> Event Name: " + this.Name + "<br></div>");	
              		 		 $eventinfo.append("<div> Id: " + this.Id + "<br></div>");	
              		 		 $eventinfo.append("<div> Start Date: " + this.StartDate + "<br></div>");	
              		   		 $eventinfo.append("<div> End Date: " + this.EndDate + "<br></div>");	
              		   		  $eventinfo.append("<div> Participants################" + "<br></div>");	
		              		  var participantObject = this.Participants;
		              		   $(participantObject).each(function() {  
		              		    $eventinfo.append("<div> First Name: " + this.FirstName +"<br></div>");	
		              		    $eventinfo.append("<div> Last Name: " + this.LastName +"<br></div>");	
		              		    $eventinfo.append("<div> UniqueID: " + this.UniqueID +"<br></div>");	
		              		    $eventinfo.append("<div> Image:<img src='images/" + this.Image+"'></img><br></div>");	
		              		    $eventinfo.append("<div> Level: " + this.Level +"<br></div>");	
		              		    $eventinfo.append("<div> Points: " + this.Points +"<br></div>");		
		              		    	              		     
		              		    $eventinfo.append("<div> Performance*********" + "<br></div>");		
		              		    
		              		     var performanceObject = this.Performance;   
		              		       $(performanceObject).each(function() { 
		              		     
		              		       	  $eventinfo.append("<div> ObjectiveID: " + this.ObjectiveID +"<br></div>");	
		              		  		  $eventinfo.append("<div> Completed: " + this.Completed +"<br></div>");	
		              		       		        
		              		    }); // end of performance		              		    
		              		    
		              		     $eventinfo.append("<div> *********" + "<br></div>");	
		              		   }); // end of participants
		              		   
		              		   $eventinfo.append("<div> ################" + "<br></div>");	
		              		   
		              		    $eventinfo.append("<div> Game*********" + "<br></div>");	
		              		  
		              		    var gameObject = this.Game;
		              		    $(gameObject).each(function() {  
		              		    	
		              		    	 	  $eventinfo.append("<div>  Name: " + this.Name +"<br></div>");	
		              		    	 	   $eventinfo.append("<div> Id: " + this.Id +"<br></div>");	
		              		    	 	     
		              		    	 	      $eventinfo.append("<div> Levels*********" + "<br></div>");
		              		    	 	      var levelsObject = this.Levels;
		              		    	 	        $(levelsObject).each(function() {  
		              		    	 	        	 $eventinfo.append("<div>  ID: " + this.ID +"<br></div>");	
		              		    	 	        	  $eventinfo.append("<div>  Name: " + this.Name +"<br></div>");	
		              		    	 	        	  
		              		    	 	        	   $eventinfo.append("<div> Objectives*********" + "<br></div>");
		              		    	 	        	    var objectivesObject = this.Objectives;
		              		    	 	        	     $(objectivesObject).each(function() { 
		              		    	 	        	     	 $eventinfo.append("<div>  Name: " + this.Name +"<br></div>");	
		              		    	 	        	     	 $eventinfo.append("<div>  ID: " + this.ID +"<br></div>");	
		              		    	 	        	    }); // end of Objectives
		              		    	 	        	 $eventinfo.append("<div> *********" + "<br></div>");	
		              		    	 	        	 }); // end of Levels
		              		    	 	      	
		              		    	 	     	 $eventinfo.append("<div> *********" + "<br></div>");	
		              		   
		              		   }); // end of Game
		              		    $eventinfo.append("<div> *********" + "<br></div>");	
		              		   
							}); // end of Event
													
              		  	     		 
                }
                // the content is here : zipEntry.asText()
              });
              // end of the magic !

            } catch(e) {
              $ul.append("<li class='error'>Error reading " + theFile.name + " : " + e.message + "</li>");
            }
            $result.append($ul);
          }
        })(f);

        // read the file !
        // readAsArrayBuffer and readAsBinaryString both produce valid content for JSZip.
        reader.readAsArrayBuffer(f);
        // reader.readAsBinaryString(f);
      }
    });
  });


function SynchronizeDevice()
{
	// This function will synchronize the data for the event
	var zip = new JSZip();
	zip.file("Hello.txt", "Hello World\n");
	zip.file("hello1.txt", "Hello First World\n");
	var content = zip.generate();
	location.href="data:application/zip;base64,"+content;      	
}
function OpenZip()
{
	var zip = new JSZip();
	zip.load("data.zip");
}
//http://107.21.201.107/ziphandler/default.aspx
function downloadFile(){
	alert('download start')
        window.requestFileSystem(
                     LocalFileSystem.PERSISTENT, 0, 
                     function onFileSystemSuccess(fileSystem) {
                     fileSystem.root.getFile(
                                 "dummy.html", {create: true, exclusive: false}, 
                                 function gotFileEntry(fileEntry){
                                 var sPath = fileEntry.fullPath.replace("dummy.html","");
                                 var fileTransfer = new FileTransfer();
                                 fileEntry.remove();
 								 alert('downloading..');
                                 fileTransfer.download(
                                           "http://107.21.201.107/ziphandler/images/010002.jpg",
                                           sPath + "010002.jpg",
                                           function(theFile) {
                                           alert('download complete');
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
 
    }
    
    function showLink(url){
        alert(url);
        var divEl = document.getElementById("ready");
        var aElem = document.createElement("a");
        aElem.setAttribute("target", "_blank");
        aElem.setAttribute("href", url);
        aElem.appendChild(document.createTextNode("Ready! Click To Open."))
        divEl.appendChild(aElem);
 
    }
 
 
    function fail(evt) {
    	alert('Error');
       // console.log(evt.target.error.code);
    }
    
    function LoadZipFile()
    {
    	      alert('Start Loading Zip File');
			  var xhr1 = new XMLHttpRequest();
			  alert('1');
			  xhr1.open('GET', 'http://107.21.201.107/ziphandler/images/010002.jpg', true);
			  if (xhr1.overrideMimeType) {
			    xhr1.overrideMimeType('text/plain; charset=x-user-defined');
			  }
			  alert('2');
			  xhr1.onreadystatechange = function(e) {
			    alert(this.readyState+'-'+this.status);
			    if (this.readyState == 4 && this.status == 200) {
			      alert('3');
				  					 
			    }
			  };			
			  xhr1.send();
    }
    
