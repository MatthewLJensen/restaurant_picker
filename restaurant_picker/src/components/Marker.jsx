import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'

const Marker = () => {

    return (
        <Marker
            key={restaurant.id}
            position={[restaurant.lat, restaurant.lon]}
            ref={(ref) => {
                markerRefs.push(ref)
            }}
        >
            <Popup>
                <div className="restaurant-item">
                    <h2>{restaurant.tags.name}</h2>
                </div>
            </Popup>
        </Marker>
    )
}