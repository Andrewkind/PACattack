

			var d = document.getElementById('canvas1');
			paper.setup(d);
						
			d.style = "border:1px solid #000000;";
			
	
	// Create a raster item using the image tag with id='raster'
	var raster = new paper.Raster('/static/notebook/js/turtle.png');

	//turtle starts at 90 degrees (looking up) to x-axis
	var turtleAngle = 90;

	// home coordinates
	var xhome = 250;
	var yhome = 250;
	
	// turtle coordinates (start at home)
	var xcoord = xhome;
	var ycoord = yhome;

	
	// image position
	raster.position.x = xcoord;
	raster.position.y = ycoord;
	
	// Scale the image by 50%
	raster.scale(0.5);

	
	
	//speed of movement
	var speed = 2;

	// create path object for turtle
	var turtlePath = new paper.Path();
	turtlePath.strokeColor = 'blue';
	turtlePath.add(new paper.Point (xcoord, ycoord));
	
	
	var angle = 90; //this is to keep track of the turtles angle.

	//Get the events from output area.
	var myEvents = ($(".myString")).text();
	myEvents = myEvents.split(" ");			
			
	//list of events
	var eventList = [];
	//create events, push them into list...
	var index;
	//var event = [];

	//loop through array and create events
	for (index = 0; index < myEvents.length; ++index) {
	var event = [];
		console.log("Current word is "+myEvents[index]);
    	
		if ( myEvents[index].indexOf('rotate') >= 0){
    		event.command = myEvents[index];
    		++index;
    		event.rotate = myEvents[index];
    		
    		eventList.push (event);	
    	}
    	
    	if ( myEvents[index].indexOf('forward') >= 0) {
    	var event = [];
    	console.log("got to forward");
    		event.command = "line";
    		++index;
    		event.xend = myEvents[index];
    		++index;
    		event.yend = myEvents[index];
    		eventList.push(event);
    	}
		
    	if ( myEvents[index].indexOf('speed') >= 0) {
    	var event = [];
    	console.log("got a speed");
    		event.command = "speed";
    		++index;
    		event.speed = myEvents[index];
    		eventList.push(event);
    	}
			
	}
	
	 var distancex;
	 var distancey;
	 
	 var x = 0; //event index
	 
	 console.log("Event name:" + eventList[0].command);
	 console.log("Event xend:" + eventList[0].xend);
	 
	 
	 paper.view.onFrame = function(event) {
		//check if we have an event to be done
		if (x < eventList.length) {
		
			//check if curent event is a line movement
			if (eventList[x].command == "line") {
			
				//calculate distancex and distancey if not calculated yet
				if (!eventList[x].hasOwnProperty("distancex")) {
					
					if (eventList[x].xend > xcoord ) eventList[x].distancex = eventList[x].xend - xcoord;
					 else eventList[x].distancex = xcoord - eventList[x].xend;
					
					
					//maybe try putting prevous x-1 event's xend yend
					 if (eventList[x].yend >ycoord ) eventList[x].distancey = eventList[x].yend - ycoord;
					 else eventList[x].distancey = ycoord - eventList[x].yend;
					
					//check which direction to go in (see above comment)
					if (eventList[x].xend < xcoord) {
						eventList[x].distancex = -eventList[x].distancex;
					}
					if (eventList[x].yend > ycoord) {
						eventList[x].distancey = -eventList[x].distancey;
					}
	
				}
				
				//calculate hypotenuse to get distance required if not calculated yet
				if (!eventList[x].hasOwnProperty("distanceh")) {
				
				eventList[x].distanceh = Math.sqrt((eventList[x].distancex * eventList[x].distancex) + (eventList[x].distancey * eventList[x].distancey))
				
				//dont need to round off apparently
				//eventList[x].distanceh = Math.round(eventList[x].distanceh)
				
				}
				
				//keep drawing line until we reach end point
				
				//check if we are near our endpoint
				var difx;
				difx = xcoord - eventList[x].xend;
				difx = Math.abs(difx);
				var dify;
				dify = ycoord - eventList[x].yend;
				dify = Math.abs(dify);
				
				//check if done
				if ((Math.floor(difx) == 0) && (Math.floor(dify) == 0 )){
				x++;
				
				} else {

					//reverse angle temporarily
					turtleAngle = -turtleAngle;
					//convert to radians
					var angleRadians = (turtleAngle * (Math.PI / 180));
									
					//calculate coordinate 
					yDest = Math.sin(angleRadians);
					yDest = -yDest; //y coord increase in down direction 
					xDest = Math.cos(angleRadians);
					
					//adjust speed
					//make condition to check if we are approaching destination, if we are, dont overshoot
					if (speed <= eventList[x].distanceh) {
					xDest = xDest * speed;
					yDest = yDest * speed;
					
					}
					else {
					console.log("should see me once!!");
					xDest = xDest * (eventList[x].distanceh - speed);
					yDest = yDest * (eventList[x].distanceh - speed);
					x++;
					
					
					}
				
					// increase path
					turtlePath.add(new paper.Point (xcoord - xDest, ycoord - yDest)); 
					
					//move turtle to new point
					raster.position.x = xcoord - xDest;
					raster.position.y = ycoord - yDest;
					
					//update new coordinate for turtle position
					xcoord = xcoord - xDest;
					ycoord = ycoord - yDest;
					
					//set angle back
					turtleAngle = -turtleAngle;
					
				
				}
					
				
			}
			
			if (x < eventList.length) {
				if (eventList[x].command == "rotate") {
					console.log("got to rotate");
					if (eventList[x].rotate > 0) {
					raster.rotate(1); //rotate clockwise
					eventList[x].rotate--; //decrease angle until we hit 0
					turtleAngle++;
					}
					
					
					else if (eventList[x].rotate < 0) {
					raster.rotate(-1); //rotate counterclockwise
					eventList[x].rotate++; //increase angle until we hit 0
					turtleAngle--;
					}
					else {
					// we are done rotating 
					x++;
					}
				}
			}
			
			if (x < eventList.length) {
				if (eventList[x].command == "speed") {
					
					// change speed
					speed = eventList[x].speed;
					x++;
					
				}
			}
			
		}  
	} //END ON FRAME FUNCTION

	