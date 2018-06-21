//Creating a map inside a column
var map, infoWindow;
// array for locations
var patharray = [];
var pathtitle;
// addmarker: currently empty
var addmarker;
// empty routeline:
var routeline;

// testing the repo

function initMap()
{
    // Creating map with initial position and zoom
    map = new google.maps.Map(
        document.getElementById('addmap'), {
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
    addmarker = new google.maps.Marker
    ({
        // initial position of marker when loaded
        position: {lat: 0, lng: 0},

        // marker icon
        icon:
        {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            rotation: 0,
            strokeWeight: 3,
            // colour using Hex RGB:
            strokeColor: "#000000"
        },
        map: map,           // places marker inside map
        draggable:true,     // marker is draggable
        crossOnDrag: false
    });


    infoWindow = new google.maps.InfoWindow;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        //This is the start of the important function that we want
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            // open position in current location
            infoWindow.open(map);
            map.setCenter(pos);
            addmarker.setPosition(pos)
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
        }
    else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}


function handleLocationError(browserHasGeolocation, infoWindow, pos)
{
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
          'Error: The Geolocation service failed.' :
          'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

// Creating a point for a new path
function create()
{
    if (patharray.length > 0)
    {
        // deletes route line for updating
        routeline.setMap(null);
    }

  ;
    // getting marker location
    let markerpos =addmarker.position
    map.setCenter(markerpos);
    patharray.push({lat: addmarker.getPosition().lat(), lng:addmarker.getPosition().lng()});


    routeline = new google.maps.Polyline({
        path: patharray,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    routeline.setMap(map);
}

// undo's user's last point
function undo()
{
    routeline.setMap(null);
    patharray.pop();

    if (patharray.length > 0)
    {
    // reset marker position to last position
    var pos = patharray[patharray.length-1];
    map.setCenter(pos);
    addmarker.setPosition(pos);
    }

    routeline = new google.maps.Polyline({
        path: patharray,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    routeline.setMap(map);

}


function done()
{
    if (patharray.length < 2)
    {
        alert("Path is invalid");
    }
    else
    {
        let pathtitle = prompt("Please name your path:", "Start to Destination");

        while (pathtitle == null || pathtitle == "")
        {
            pathtitle = prompt("Please enter a valid name:", "Start to Destination");
        }

        let createdPaths = new Pathlist();
        let path1 = new Path(pathtitle,patharray);

        let oldStringPathListJSON = localStorage.getItem("Created_Paths");
        let oldStringPathList = JSON.parse(oldStringPathListJSON);

        if (oldStringPathList != null)
        {
        createdPaths.initialiseFromPathlistPDO(oldStringPathList);
        }
        createdPaths.setList(path1);

        let stringOfPathList = JSON.stringify(createdPaths);
        localStorage.setItem("Created_Paths", stringOfPathList);

        // takes the user back to the index page
        location.href = "index.html";

        location.href = "index.html";

    }
}
