import { useEffect, useState } from 'react'
import { createUseStyles } from 'react-jss'


import exported_data from '../../exported_data.json'
import './App.css'

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet/dist/images/marker-shadow.png"


const useStyles = createUseStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },

  filter_column: {
    align: 'center',
    textAlign: 'center',
    width: '25%',
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
    border: '1px solid #ccc',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#eee',
    }
  },

  restaurant_column: {
    align: 'center',
    textAlign: 'center',
    width: '25%',
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

  const classes = useStyles()

  // Load the data from the json file
  useEffect(() => {
    setRestaurants(exported_data)
  }, [])

  return (
    <div className={classes.root}>

      <div className={classes.filter_column}>
        <h1>Filters</h1>
        <div className={classes.filters_list}>
          <div className={classes.filter}>
            <input type="checkbox" />
            <span>Filter 1</span>
          </div>

        </div>
      </div>


      <div className={classes.restaurant_column}>
        <h1>Filtered Restaurants</h1>
        <div className={classes.restaurant_list}>

          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-item">
              <div className={classes.restaurant}>
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
        <MapContainer center={[35.07, -85.13]} zoom={12} style={{ height: '100vh', width: '75wh' }}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Map over the restaurant locations */}
          {restaurants.map((restaurant) =>

          (<Marker key={restaurant.id} position={[restaurant.lat, restaurant.lon]}>
            <Popup>
              <div className="restaurant-item">
                <h2>{restaurant.tags.name}</h2>
              </div>
            </Popup>
          </Marker>
          )
          )}
          <LocationMarker />
        </MapContainer>



        {/* <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100vh', width: '100wh' }}
        >

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer> */}


      </div>

    </div>
  )
}

export default App
