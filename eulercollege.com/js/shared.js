/* $$$$$$$$$$$$$$$$$$$$$$$$$

Class creation

$$$$$$$$$$$$$$$$$$$$$$$$$$$*/


class Path
{
    constructor (title, locations)
    {
        this._title = title;

        this._locations = locations;
    }

    // Public methods

    setTitle(newTitle)
    {
        if (typeof newTitle === "string")
            {
                this._title = newTitle;
            }
        else
            {
                console.log("Invalid title" + newTitle);
            }
    }

    setLocations(newLocations)
{
        if (typeof newLocations === "array")
            {
                this._locations = newLocations;
            }
        else
            {
                console.log("Invalid locations" + newLocations);
            }
    }

    initialiseFromPathPDO(pathObject)
                {
                    // Initialise the instance via the mutator methods from the PDO object.
                    this._title = pathObject._title;
                    this._locations  = pathObject._locations;
                }

    getTitle()
    {
        return this._title;
    }

    getLocations()
{
        return this._locations;

    }

    getTurns()
    {
        return this._locations.length - 2
    }

    // get total path distance
    getDistance()
    {
        let distance = 0;
         //used a let here to make function work, as "locations" was not a variable

        //deg2rad below wasn't actually declared
        function deg2rad(degrees)
        {
            return degrees * Math.PI / 180;
        };

        
        for (let i = 0; i< this._locations.length-1; i++)
           {
            var R = 6371; // Radius of the earth in km

              var dLat = deg2rad(this._locations[i+1].lat - this._locations[i].lat);
              // deg2rad below
              var dLon = deg2rad(this._locations[i+1].lng - this._locations[i].lng);
              var a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(this._locations[i+1].lat)) * Math.cos(deg2rad(this._locations[i].lat)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);

              var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              var d = R * c; // Distance in km between two way points

              distance += d; // total distance
            }
        return Math.round(distance*1000 * 100) / 100;
    }

}

class Pathlist
{
    constructor()
    {
        this._paths = []

        // initialise path array
        if (typeof theTitle === "string")
         {
             //apparntly using "array" was invalid
            if (typeof theLocations === array)
            {
                this._paths.push(new Path(theTitle, theLocations));
            }
         }
    }

    setList(chemins)
    {
      this._paths.push(chemins);
    }

    getList()
    {
            for (let i = 0; i<this._paths.length; i++)
                {
                    let list = this._paths[i].title;
                }
            return list;
    }

    initialiseFromPathlistPDO(PathlistPDOObject)
    {
        if (this._paths == null)
        {
        this._paths = [];
        }
        
        for (let i = 0; i < PathlistPDOObject._paths.length; i++)
        {

            let path = new Path();
            path.initialiseFromPathPDO(PathlistPDOObject._paths[i]);
            this._paths.push(path);
        }
    }

    get paths()
                {
                    return this._paths;
                }

}

/*
This just outputs the locations in latlng form and the titles for now, am working on fix

*/
