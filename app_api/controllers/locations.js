'use strict';

const debug = require('debug')('meanwifi:controllers');
const db = require("../models/db");

const locationsList = (req, res) => { 
  db.Location.find( (error, locations) => {
    if (error || !locations) { 
      const msg = "Locations not found";
      console.error(msg);
      return res.status(404).json( { 
        "message": msg, 
        "error": error
      });
    }
    else { 
      return res.status(200).json(locations);
    }
  });
};

function validateParam(paramName, paramValue, res) { 
  debug(`validateParam: ${paramName}=${paramValue}`);
  if (paramValue) { 
    return true;
  }
  else {
    res.status(404).json({ 
      "message": `Param '${paramName}' required`
    });
    return false;
  }
}

const locationsListByDistance = (req, res) => { 
  debug(`locationsListByDistance params: ${JSON.stringify(req.query)}`);

  //URL format: api/locations?lng=-0.7992599&lat=51.378091&maxDistance=20000
  const lng = parseFloat(req.query.lng);
  if (!validateParam("lng", lng, res)) { 
    return;
  }

  const lat = parseFloat(req.query.lat);
  if (!validateParam("lat", lat, res)) { 
    return;
  }

  const maxDistance = parseInt(req.query.maxDistance);
  if (!validateParam("maxDistance", maxDistance, res)) { 
    return;
  }

  const limit = 10;

  const near = {
    type: "Point",
    coordinates: [lng, lat]
  };

  /*
    You’re using spherical: true here because it causes
    MongoDB to use $nearSphere semantics, which
    calculates distances using spherical geometry.
    If this were false, it would use 2D geometry. 
  */
  const geoOptions = { 
    distanceField: "distance.calculated",
    spherical: true,
    maxDistance: maxDistance
    /*  Note: Starting in version 4.2, MongoDB removes the limit 
        and num options for the $geoNear stage as well as the default 
        limit of 100 documents. To limit the results of $geoNear, use 
        the $geoNear stage with the $limit stage. */
    //limit: limit
  };

  db.Location.aggregate([{ $geoNear: {near, ...geoOptions} }, { $limit: limit } ], (error, locations) => { 
    if (error || !locations) { 
      const msg = "Error performing query for locations by geo";
      console.error(msg);

      return res.status(404).json({ 
        "message": msg, 
        /* If you pass the entire error object then the error.message property is
           not included in JSON.stringify output.  
           Why? It's type and value doesn't fall into any of the cases where stringify 
           would drop it on the floor...  */
        "error": error.message
      });
      //   { 
      //   "message": msg, 
      //   "error": error.message
      // });
    }
    else { 
      return res.status(200).json(locations);
    }
  });

  // res
  //   .status(200)
  //   .json({"status" : "success"});
};

const locationsCreate = (req, res) => { 
  res
    .status(200)
    .json({"status" : "success"});
};

const locationsReadOne = (req, res) => { 
  const id = req.params.locationid;

  db.Location.findById(id, (error, location) => { 
    //mongoose returns error when bad ID is provided... 
    if (error || !location) {
      const msg = `error retrieving location '${id}'`;
      console.error(msg);
      return res.status(404).json({ 
        "message": msg,
        "error": error
      });
    }
    else { 
      debug(`success retrieving location '${id}'`);
      return res.status(200).json(location);
    }
  });
};

const locationsUpdateOne = (req, res) => { 
  res
    .status(200)
    .json({"status" : "success"});
};

const locationsDeleteOne = (req, res) => { 
  res
    .status(200)
    .json({"status" : "success"});
};

module.exports = {
  locationsList,
  locationsListByDistance,
  locationsCreate,
  locationsReadOne,
  locationsUpdateOne,
  locationsDeleteOne
};
