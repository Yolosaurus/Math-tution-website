let displayroutes = document.getElementById('Routes');
let routes = [];
// ClaytonPaths
let downloadedPaths  = new Pathlist;
// downloading user paths separately
let createdPaths = new Pathlist();
 
// Make the request
let data = {
    campus: "clayton",
    callback: "routesResponse"
};
jsonpRequest("https://eng1003.monash/api/campusnav/", data);

function jsonpRequest(url, data)
{
    // Build URL parameters from data object.
    let params = "";
    // For each key in data object...
    for (let key in data)
    {
        if (data.hasOwnProperty(key))
        {
            if (params.length == 0)
            {
                // First parameter starts with '?'
                params += "?";
            }
            else
            {
                // Subsequent parameter separated by '&'
                params += "&";
            }

            let encodedKey = encodeURIComponent(key);
            let encodedValue = encodeURIComponent(data[key]);

            params += encodedKey + "=" + encodedValue;
         }
    }
    let script = document.createElement('script');
    script.src = url + params;
    document.body.appendChild(script);
}


function routesResponse(routesArray)
{
    routes = routesArray;

    // List view section heading
    let listHTML = "";
    
    let oldStringPathListJSON = localStorage.getItem("Created_Paths");
    let oldStringPathList = JSON.parse(oldStringPathListJSON);
    if (oldStringPathList != null)
    {
        createdPaths.initialiseFromPathlistPDO(oldStringPathList);
    }
    
    // adding clayton paths to downloaded paths
    for (let i=0; i < routesArray.length; i++)
    {
      let path1 = new Path(routes[i].title, routes[i].locations);
      downloadedPaths.setList(path1);
    }
    
    // display clayton paths
    for (let i=0; i < downloadedPaths._paths.length; i++)
    {
        listHTML += "<tr> <td onmousedown=\"listRowTapped("+i+")\" class=\"full-width mdl-data-table__cell--non-numeric\">" + downloadedPaths._paths[i]._title;
 
        listHTML += "<div class=\"subtitle\">" + "Turns: " + downloadedPaths._paths[i].getTurns() + "</br>" + "Distance: " + downloadedPaths._paths[i].getDistance() + "m" + "</div></td></tr>";
    }
    
    // display user created paths
    for (let i=0; i < createdPaths._paths.length; i++)
    {
        listHTML += "<tr> <td onmousedown=\"userRowTapped("+i+")\" class=\"full-width mdl-data-table__cell--non-numeric\">" + createdPaths._paths[i]._title;
 
        listHTML += "<div class=\"subtitle\">" + "Turns: " + createdPaths._paths[i].getTurns() + "</br>" + "Distance: " + createdPaths._paths[i].getDistance() + "m" + "</div></td></tr>";
    }
    
    // display all paths
    displayroutes.innerHTML = listHTML;
 
}

function listRowTapped(routeIndex)
{
    let displaypath = JSON.stringify(downloadedPaths._paths[routeIndex]);
    localStorage.setItem("displayPath", displaypath);
    
    // opens up navigation page
    // see: https://stackoverflow.com/questions/8454510/open-url-in-same-window-and-in-same-tab
    location.href = "navigate.html";
}

function userRowTapped(routeIndex)
{
    let displaypath = JSON.stringify(createdPaths._paths[routeIndex]);
    localStorage.setItem("displayPath", displaypath);
    
    // opens up navigation page
    // see: https://stackoverflow.com/questions/8454510/open-url-in-same-window-and-in-same-tab
    location.href = "navigate.html";
}