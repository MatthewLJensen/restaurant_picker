import { useEffect, useState, useRef } from 'react'
import { createUseStyles } from 'react-jss'


import exported_data from '../../exported_data.json'
import './App.css'

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet/dist/images/marker-shadow.png"

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { milesToMeters, getDistance } from './Utilities'


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

function LocationMarker(props) {
  const map = useMapEvents({
    click() {
      map.locate()
    },
    locationfound(e) {
      props.setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  return props.position === null ? null : (
    <Marker position={props.position}>
      <Popup>You are here</Popup>
    </Marker>
  )
}


function App() {
  const [restaurants, setRestaurants] = useState([])
  const [filteredRestaurants, setFilteredRestaurants] = useState([])
  const [filteredName, setFilteredName] = useState('')
  const [filteredCuisines, setFilteredCuisines] = useState([])
  const [filteredDistance, setFilteredDistance] = useState(null)
  const [cuisines, setCuisines] = useState([])
  const [userPosition, setUserPosition] = useState(null)



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
    let tempFilteredRestaurants = restaurants.slice()

    // Filter by name (which has been converted to an ID)
    if (filteredName) {
      tempFilteredRestaurants = tempFilteredRestaurants.filter(r => r.tags.name === filteredName)
    }

    // Filter the restaurants by cuisine
    if (filteredCuisines.length > 0) {
      tempFilteredRestaurants = tempFilteredRestaurants.filter(r => r.tags.cuisine ? r.tags.cuisine.split(";").some(c => filteredCuisines.includes(c)) : false)
    }

    // Filter the restaurants by distance from the user
    if (filteredDistance) {
      if (!userPosition) {
        console.log("No user position")
      } else {
        // get the distance to each restaurant
        tempFilteredRestaurants.forEach(r => {
          r.distance = getDistance(r.lat, r.lon, userPosition.lat, userPosition.lng)
        })

        // filter the restaurants by distance
        tempFilteredRestaurants = tempFilteredRestaurants.filter(r => filteredDistance > r.distance)

      }
    }

    setFilteredRestaurants(tempFilteredRestaurants)

  }, [filteredName, filteredCuisines, filteredDistance, userPosition])


  return (
    <div className={classes.root}>

      <div className={classes.filter_column}>
        <h1>Filters</h1>
        <div className={classes.filters_list}>

          {/* Filter By Name */}
          <Autocomplete
            className={classes.filter}
            id="name-filter"
            options={filteredRestaurants.map(r => r)}
            getOptionLabel={(option) => option.tags.name}
            renderOption={(props, option, index) => {
              return (
                <li {...props} key={option.id}>
                  {option.tags.name}
                </li>
              )
            }}
            onChange={(e, value) => {
              if (value) {
                setFilteredName(value.tags.name)
              }else{
                setFilteredName('')
              }
            }}

            renderInput={(params) => (
              <TextField
                {...params}
                label="Name"
                variant="outlined"
              />
            )}
          />



          {/* Filter by cuisine: */}
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

          {/* Filter by Distance: */}
          <div className={classes.filter}>
            <TextField
              id="outlined-basic"
              label="Distance"
              variant="outlined"
              fullWidth
              onChange={(event) => {
                setFilteredDistance(event.target.value)
              }}
            />
          </div>



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
          <LocationMarker position={userPosition} setPosition={setUserPosition} />

          {/* User defined filterDistance circle */}
          {filteredDistance && userPosition && (
          <Circle
            center={userPosition}
            radius={milesToMeters(filteredDistance)}
            color="red"
            fillColor="red"
            fillOpacity={0.2}
          />
          )}

        </MapContainer>

      </div>

    </div>
  )
}

export default App
