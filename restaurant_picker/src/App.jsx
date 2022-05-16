import { useEffect, useState, useRef } from 'react'
import { createUseStyles } from 'react-jss'


import exported_data from '../../exported_data.json'
import './App.css'

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet/dist/images/marker-shadow.png"

import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';


const useStyles = createUseStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },

  filter_column: {
    align: 'center',
    textAlign: 'center',
    width: '20%',
    height: '100vh',
    overflow: 'auto',
    overflowY: 'scroll',
    overflowX: 'hidden',
    '&::-webkit-scrollbar': {
      display: 'none',
    }
  },
  filter_list: {
    padding: '1rem',
    backgroundColor: '#fafafa',
    borderRadius: '0.5rem',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    margin: '1rem',
  },
  filter: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0.5rem',
    padding: '0.5rem',
    // border: '1px solid #ccc',
    // borderRadius: '0.25rem',
    // cursor: 'pointer',
    // '&:hover': {
    //   backgroundColor: '#eee',
    // }
  },

  restaurant_column: {
    align: 'center',
    textAlign: 'center',
    width: '20%',
    height: '100vh',
    overflow: 'auto',
    overflowY: 'scroll',
    overflowX: 'hidden',
    '&::-webkit-scrollbar': {
      display: 'none',
    }
  },
  restaurant_list: {
    padding: '1rem',
    backgroundColor: '#fafafa',
    borderRadius: '0.5rem',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    margin: '1rem',
  },
  restaurant: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0.5rem',
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#eee',
    }
  },
  map: {
    height: '100vh',
    width: '60%',
  },
  active: {
    backgroundColor: '#eee',
  },
}))

function LocationMarker() {
  const [position, setPosition] = useState(null)
  const map = useMapEvents({
    click() {
      map.locate()
    },
    locationfound(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  )
}

function App() {
  const [restaurants, setRestaurants] = useState([])
  const [filteredRestaurants, setFilteredRestaurants] = useState([])
  const [filteredCuisines, setFilteredCuisines] = useState([])
  const [cuisines, setCuisines] = useState([])

  const classes = useStyles()

  let markerRefs = useRef({})

  // Load the data from the json file
  useEffect(() => {
    setRestaurants(exported_data)

    // Get the cuisines
    // this line is kinda confusing. First we map the restaurants to an array of cuisines, if the restaurant doens't have a cuisine, then we add an empty array, otherwise we add an array of the cuisines split on a semicolon.
    // we then flatten the array of arrays, and then we remove any duplicates.
    setCuisines(exported_data.map(r => r.tags.cuisine ? r.tags.cuisine.split(";") : []).flat().filter((v, i, a) => a.indexOf(v) === i))
  }, [])

  useEffect(() => {
    setFilteredRestaurants(restaurants)
  }, [restaurants])

  useEffect(() => {
    // Filter the restaurants by cuisine
    if (filteredCuisines.length > 0) {
      setFilteredRestaurants(restaurants.filter(r => r.tags.cuisine ? r.tags.cuisine.split(";").some(c => filteredCuisines.includes(c)) : false))
    } else {
      setFilteredRestaurants(restaurants)
    }

  }, [filteredCuisines])


  return (
    <div className={classes.root}>

      <div className={classes.filter_column}>
        <h1>Filters</h1>
        <div className={classes.filters_list}>
          {/* Filter by cuisine: */}
          {/* {
            cuisines.map(cuisine => (
              <div
                key={cuisine}
                className={`${classes.filter} ${(filteredCuisines.includes(cuisine) ? classes.active : '')}`}
                onClick={() => {
                  if (filteredCuisines.includes(cuisine)) {
                    setFilteredCuisines(filteredCuisines.filter(c => c !== cuisine))
                  } else {
                    setFilteredCuisines([...filteredCuisines, cuisine])
                  }
                }}
              >
                {cuisine}
              </div>
            ))
          } */}
          <Autocomplete
            className={classes.filter}
            multiple
            id="tags-outlined"
            options={cuisines}
            getOptionLabel={(option) => option}
            onChange={(event, cuisine) => setFilteredCuisines(cuisine)}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cuisine"
              />
            )}
          />


        </div>
      </div>


      <div className={classes.restaurant_column}>
        <h1>Filtered Restaurants</h1>
        <div className={classes.restaurant_list}>

          {filteredRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-item">
              <div
                className={classes.restaurant}
                onClick={() => {
                  if (markerRefs.current[restaurant.id]) {
                    markerRefs.current[restaurant.id].openPopup()
                  }
                }}
              >
                {restaurant.tags.name}
              </div>

              {/* <div className="tags">

                {Object.keys(restaurant.tags).map((key, index) => (
                  <div key={restaurant.id + key} className="tag">
                    {key + ": " + restaurant.tags[key]}

                  </div>
                )
                )}
              </div> */}
            </div>
          ))}
        </div>
      </div>

      <div className={classes.map}>


        {/* Map */}
        <MapContainer center={[35.07, -85.2]} zoom={12} style={{ height: '100vh', width: '75wh' }}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredRestaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              position={[restaurant.lat, restaurant.lon]}
              ref={(ref) => {
                markerRefs.current[restaurant.id] = ref
              }}
            >
              <Popup>
                <div className="restaurant-item">
                  <h2>{restaurant.tags.name}</h2>
                  <div className="tags">
                    {Object.keys(restaurant.tags).map((key, index) => (
                      <div key={restaurant.id + key} className="tag">
                        {key + ": " + restaurant.tags[key]}
                      </div>
                    )
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          <LocationMarker />
        </MapContainer>

      </div>

    </div>
  )
}

export default App
