import { MapContainer } from 'react-leaflet';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';
function MapWrapper({ children, center }) {
    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            zoomControl={false}
        >
            {/* <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url={`${map}`}
                            /> */}
            <ReactLeafletGoogleLayer
                apiKey="AIzaSyA8A9yPeigR3I485ayAHKniugLw3OqXlS4"
                type={'satellite'}
            />
            {children}
        </MapContainer>
    );
}

export default MapWrapper;
