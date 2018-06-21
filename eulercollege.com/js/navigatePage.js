// for creating a map inside a column
var pathJSON = localStorage.getItem("displayPath");
var pObject = JSON.parse(pathJSON);
var pathObject = new Path(pObject._title,pObject._locations);
// compass calibration
alert('Compass Calibration: \nPlease move your phone in a figure-8 shape');

var map, infoWindow;
var colour;

// for calculating compass direction
var alpha, beta, gamma;

// user locations found here
var userlocation = {
    lat: [],
    lng: [],
    heading: [],
    err: [],
    time: [],
    // current position
    now:
    {
        lat: undefined,
        lng: undefined,
        // sets current location as loading when displating
        heading: 'loading...',
        err: 'loading...',
        time: 0
    }
};

// to calculate the values for the instructions
var direction = {
    heading: 0,
    distance: 0,
    turn: 0,
    last: false
};

// Calculating which node has been tavelled to
var node = {
    history: [],
    now: undefined,
    past: undefined,
    // segment distance of path in array for each two nodes in km
    segdis: []
};


// initiating replaceable variables for calculating length and heading
var x, y, latI, lngI, latJ, lngJ;
var R = 6371;   // Radius of the earth in km
// calculate each segment distance
for (i = 0; i < pathObject._locations.length-1; i++)
{
    // lat lng of ith node (the node before)
    latI = deg2rad(pathObject._locations[i].lat);
    lngI = deg2rad(pathObject._locations[i].lng);
    // lat lng of jth node (the node after)
    latJ = deg2rad(pathObject._locations[i+1].lat);
    lngJ = deg2rad(pathObject._locations[i+1].lng);

    x = (lngJ-lngI)*Math.cos((latJ+latI)/2);
    y = latJ-latI;
    d = R * Math.sqrt(x*x+y*y); // Distance in km between two way points

    node.segdis.push(d);    // distance of ith segment
}

// distance travelled
var totalDistance = 0

// degree to radians
function deg2rad(degrees)
{
    return degrees * Math.PI / 180;
}


// GPS options
var options = {
    enableHighAccuracy: true,
    timeout: 120000,
    maximumAge: 0
};

// continuously updating user location
// see: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
setInterval(function(){
    navigator.geolocation.getCurrentPosition(success, error, options);

    // displays the heading (bearing)
    document.getElementById("displayheading").innerHTML = 'Bearing: ' + userlocation.now.heading.toFixed(0);
    // displays the accuracy of the gps
    document.getElementById("displayerror").innerHTML = 'Accuracy: ' + userlocation.now.err.toFixed(1);

    // time (in s) since opening up navigation page
    var timelapse = (userlocation.now.time - userlocation.time[1])/1000;
    // distance travelled (in m)
    var distance = getRem();
    var speed = totalDistance/timelapse;
    document.getElementById("displaydistance").innerHTML = 'Distance: ' + distance.toFixed(0) + "m";
    document.getElementById("displayspeed").innerHTML = 'Speed: ' + speed.toFixed(1);

    // The clockwise angle needed to align with path (turn right by how much)
    var diffangle = (direction.heading - userlocation.now.heading + 360)%360;
    var turnangle = (direction.heading - direction.turn + 360)%360;

    // for printing instructions
    var instruction = 'Turn ';
    // is this the last point?: reach destination
    if (direction.last == true)
    {
        intruction = 'Your destination is'
    }

    // positioning user to face the next point
    if (diffangle > 22.5 && diffangle <= 67.5) {
        instruction += 'slightly right';
    } else if (diffangle > 67.5 && diffangle <= 112.5) {
        instruction += 'right';
    } else if (diffangle > 112.5 && diffangle < 247.5) {
        instruction += 'around';
    } else if (diffangle >= 247.5 && diffangle < 292.5) {
        instruction += 'left';
    } else if (diffangle >= 292.5 && diffangle < 337.5) {
        instruction += 'slightly left';
    } else {
            // is this the last point?: reach destination
        if (direction.last === true)
        {
            instruction = 'Your destination is in ' + direction.distance.toFixed(0) + 'm'
        }
        else
        {
        var turnangle = (direction.heading - direction.turn + 360)%360;

        // informing the reader of next point turning angle if the user is travelling straight
        if (turnangle > 22.5 && turnangle <= 67.5) {
            instruction += 'slightly right';
        } else if (turnangle > 67.5 && turnangle <= 112.5) {
            instruction += 'right';
        } else if (turnangle > 112.5 && turnangle < 247.5) {
            instruction += 'around';
        } else if (turnangle >= 247.5 && turnangle < 292.5) {
            instruction += 'left';
        } else if (turnangle >= 292.5 && turnangle < 337.5) {
            instruction += 'slightly left';
        } else {
            instruction = 'Continue walking'
        }
        instruction += ' in '
        instruction += direction.distance.toFixed(0) + 'm'
        }
    }

    document.getElementById("displayinstruction").innerHTML = instruction;

},1000);


// creating map
function initMap()
{
    // Creating map with initial position and zoom
    map = new google.maps.Map(
        document.getElementById('navmap'), {
        center:{lat: -37.9110467, lng: 145.134},
        zoom: 14.5,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false

    });


    // Marker for creating a new path
    var locationmarker = new google.maps.Marker
    ({
        // initial position of marker when loaded
        position: {lat: 0, lng: 0},

        // marker icon
        icon:
        {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            rotation: 0,
            strokeWeight: 3,
            // colour using Hex RGB:
            strokeColor: "#CC0000"
        },
        map: map,         // places marker inside map
        draggable:false     // marker is not draggable
    });


     // displays path
    routeNav = new google.maps.Polyline({
        path: pathObject._locations,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    routeNav.setMap(map);



    // Circle of accuracy: currently empty
    var errorcircle = new google.maps.Circle({});


    // animating markers and map
    setInterval(function() {

        // userlocation.now can also be considered a latlng literal
        var latlng = userlocation.now;
        // setting marker location to user location
        locationmarker.setPosition(latlng);
        locationmarker.setIcon({
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            rotation: userlocation.now.heading,
            strokeWeight: 3,
            // colour using Hex RGB:
            strokeColor: "#CC0000"
        });

        // setting map centre to user location
        map.setCenter(latlng);

        // delete, then remake circle
        errorcircle.set('map',null)

        if (latlng.err >= 50)
        {
            colour = '#FF3333'
        }
        if (latlng.err < 50)
        {
            colour = '#EE8855'
        }
        if (latlng.err < 30)
        {
            colour = '#EEBB44'
        }
        if (latlng.err < 15)
        {
            colour = '#44DDCC'
        }

        // Circle of accuracy
        errorcircle = new google.maps.Circle({
            strokeColor: colour,
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: colour,
            fillOpacity: 0.1,
            map: map,
            center: latlng,
            radius: latlng.err,
            editable: false
        });

    },1000);

}


// Tracking user location
function success(pos) {

    // gets values required to calculate heading
    window.addEventListener('deviceorientation', function(event) {
        alpha = event.alpha;
        beta = event.beta;
        gamma = event.gamma;
    });
    userlocation.now.heading = compassHeading( alpha, beta, gamma );

    var crd = pos.coords;
    // associate a specific time to the location
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Position/timestamp
    userlocation.now.time = pos.timestamp;
    userlocation.time.push(pos.timestamp);

    //finds current location
    userlocation.now.lat = crd.latitude;
    userlocation.now.lng = crd.longitude;

    // adds location and error to array
    userlocation.lat.unshift(crd.latitude);
    userlocation.lng.unshift(crd.longitude);
    userlocation.heading.push(userlocation.now.heading);

    // computes GPS accuraccy
    userlocation.now.err = crd.accuracy;
    userlocation.err.push(crd.accuracy);
    
    if (userlocation.lat.length > 2)
    {
        calculateDistanceTravelled();
    }
}

// error in getting user location
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}


// From W3C DeviceOrientation Event specification:
// http://w3c.github.io/deviceorientation/spec-source-orientation.html
function compassHeading( alpha, beta, gamma )
{
    let degtorad = Math.PI / 180; // Degree-to-Radian conversion
    let radtodeg = 180 / Math.PI; // Radian-to-Degree conversion

    let _x = beta  ? beta  * degtorad : 0; // beta value
    let _y = gamma ? gamma * degtorad : 0; // gamma value
    let _z = alpha ? alpha * degtorad : 0; // alpha value
    let cX = Math.cos( _x );
    let cY = Math.cos( _y );
    let cZ = Math.cos( _z );
    let sX = Math.sin( _x );
    let sY = Math.sin( _y );
    let sZ = Math.sin( _z );

    // Calculate Vx and Vy components
    let Vx = - cZ * sY - sZ * sX * cY;
    let Vy = - sZ * sY + cZ * sX * cY;

    // Calculate compass heading
    let compassHeading = Math.atan( Vx / Vy );

    // Convert compass heading to use whole unit circle
    if( Vy < 0 )
    {
        compassHeading += Math.PI;
    }
    else if( Vx < 0 )
    {
        compassHeading += 2 * Math.PI;
    }
    return compassHeading * radtodeg; // Compass Heading (in degrees)
}


function getRem()
{

    let distanceR = 0;      // distance left
    var R = 6371;           // Radius of the earth in km
    // finding shortest distance from user location
    var minDistance = 2*R*1000*Math.PI;     // this is the circumference of the earth
    var minIndex = 0;

    // distance to user location array;
    var Dis2User = [];
    // which path is the user in?
    var inpath = [];
    // the node the user will travel to
    var nodeIndex;

    // closest turning point distance
    for (i = 0; i < pathObject._locations.length; i++)
    {
        // lat lng of ith node (the node before)
        latI = deg2rad(userlocation.now.lat);
        lngI = deg2rad(userlocation.now.lng);
        // lat lng of jth node (the node after)
        latJ = deg2rad(pathObject._locations[i].lat);
        lngJ = deg2rad(pathObject._locations[i].lng);

        x = (lngJ-lngI)*Math.cos((latJ+latI)/2);
        y = latJ-latI;
        d = R * Math.sqrt(x*x+y*y); // Distance in km between two nodes
        Dis2User.push(d);

        if (d < minDistance)
        {
            minIndex = i;   // index of minimum distance to user
            minDistance = d;
        }
    }


    var factor = 1.15 // Ellipse 'height' checking factor
    for (i = 0; i < pathObject._locations.length-1; i++)
    {
        // is the user inside an ellipse with two consecutive nodes as
        if (Dis2User[i] +  Dis2User[i+1] < factor*node.segdis[i])
        {
            inpath.push(i);
        }
    }

    // if user is not inside the path
    if (inpath.length == 0)
    {
        nodeIndex = minIndex;
    }
    else
    {
        // default if inpath has length of 1
        nodeIndex = inpath[0]+1;
        // if user is within more than 1 path segment
        if (inpath.length > 1)
        {
            for (let i = 0; i < inpath.length; i++)
            {
                var exists = node.history.indexOf(inpath[i]);
                if ((exists != -1) && (node.history.length !=0))
                {
                    nodeIndex = inpath[i]+1;
                }
            }
        }
    }


    if (minDistance < 7)
    {
        // within 10 meter of a node (user has been to recently)
        node.now = nodeIndex;
    }
    // If users reaches a new node or gets lost, update History
    if (inpath.length == 0)
    {
        node.history = [];
        node.now = undefined;
    }
    else
    {
        if (node.now != node.past)
        {
            node.history.push(node.now);
        }
    }
    node.past = node.now;


    // calculate distance from closest point to end
    for (i = nodeIndex; i < pathObject._locations.length-1; i++)
    {
        distanceR += node.segdis[i];         // total distance
    }

    // Adding distance to closest or next point after closest point
    distanceR += Dis2User[nodeIndex];

    // storing distance from user location to first point in meters
    direction.distance = 1000*Dis2User[nodeIndex];

    // calculating heading of user location to first point
    // lat lng of ith node (the node before)
    latI = deg2rad(userlocation.now.lat);
    lngI = deg2rad(userlocation.now.lng);
    // lat lng of jth node (the node after)
    latJ = deg2rad(pathObject._locations[nodeIndex].lat);
    lngJ = deg2rad(pathObject._locations[nodeIndex].lng);
    y = Math.sin(lngJ - lngI) * Math.cos(latJ);
    x =
        Math.cos(latI) *
        Math.sin(latJ) -
        Math.sin(latI) *
        Math.cos(latJ)*
        Math.cos(lngJ - lngI);
    // Storing direction publically
    direction.heading = ( (Math.atan2(y, x))*180/Math.PI +360)%360;


    // calculating heading of the target node and next node segment
    if (nodeIndex < pathObject._locations.length-1)
    {
        // calculating heading of the first point to second point
        // lat lng of ith node (the node before)
        latI = deg2rad(pathObject._locations[nodeIndex].lat);
        lngI = deg2rad(pathObject._locations[nodeIndex].lng);
        // lat lng of jth node (the node after)
        latJ = deg2rad(pathObject._locations[nodeIndex+1].lat);
        lngJ = deg2rad(pathObject._locations[nodeIndex+1].lng);
        y = Math.sin(lngJ - lngI) * Math.cos(latJ);
        x =
            Math.cos(latI) *
            Math.sin(latJ) -
            Math.sin(latI) *
            Math.cos(latJ)*
            Math.cos(lngJ - lngI);
        // Storing direction publically
        direction.turn = ( (Math.atan2(y, x))*180/Math.PI +360)%360;
        direction.last = false;
    }
    else
    {
        direction.last = true;
    }

    // returns the distance value
    return Math.round(distanceR*1000 * 100)/ 100;
}

function calculateDistanceTravelled()
{
      // lat lng of ith node (the node before)
      var latI = deg2rad(userlocation.lat[1]), lngI = deg2rad(userlocation.lng[1]);
      // lat lng of jth node (the node after)
      var latJ = deg2rad(userlocation.lat[2]), lngJ = deg2rad(userlocation.lng[2]);

      var x = (lngJ-lngI)*Math.cos((latJ+latI)/2);
      var y = latJ-latI;
      d = R * Math.sqrt(x*x+y*y)*1000; // Distance in m between two points
      totalDistance += d
    return totalDistance;
}
