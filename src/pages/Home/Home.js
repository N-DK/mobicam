import { useEffect, useState } from 'react';
import { MapContainer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { io } from 'socket.io-client';
import { Car } from '~/components/Car';
import { getListVehicles } from '~/services';
import { createClusterCustomIcon } from '~/utils';
import ReactLeafletGoogleLayer from 'react-leaflet-google-layer';

const maps = [
    {
        id: 1,
        name: 'Bản đồ đường bộ',
        map: 'https://api.maptiler.com/maps/landscape/256/{z}/{x}/{y}.png?key=toU6ZdFKgGUvtZCs7NXx',
    },
    {
        id: 2,
        name: 'Bản đồ vệ tinh',
        map: 'https://api.maptiler.com/maps/cadastre-satellite/256/{z}/{x}/{y}.png?key=toU6ZdFKgGUvtZCs7NXx',
    },
    {
        id: 3,
        name: 'Base Map',
        map: 'https://api.maptiler.com/maps/backdrop/256/{z}/{x}/{y}.png?key=toU6ZdFKgGUvtZCs7NXx',
    },
    {
        id: 4,
        name: 'Bản đồ đường bộ và địa hình',
        map: 'https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=toU6ZdFKgGUvtZCs7NXx',
    },
];

function Home() {
    const [markers, setMarkers] = useState();
    const [map, setMap] = useState(maps[0].map);

    useEffect(() => {
        const socket = io('https://checkapp.midvietnam.com', {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        'X-Mobicam-Token':
                            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjQ1LCJhcHAiOiJtaWR2biIsImxldmVsIjowLCJjb21JRCI6LTEsImlhdCI6MTcxNzk5MTE3NCwiZXhwIjoxNzE4MjUwMzc0fQ.UMy5aIHz4z6t4UTJ3Lqfc7h3wkXdfRS-a-Tp5Q4RdxQ',
                    },
                },
            },
        });

        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('statusVid', (data) => {
            setMarkers(data.data);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetch = async () => {
            const res = await getListVehicles();
            setMarkers(res?.data);
        };

        fetch();
    }, []);

    return (
        <div>
            {markers && (
                <div>
                    <div className="w-screen h-screen">
                        <MapContainer
                            center={[markers[0]?.lat, markers[0]?.lng]}
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
                            <MarkerClusterGroup
                                chunkedLoading
                                iconCreateFunction={createClusterCustomIcon}
                            >
                                {markers?.map((marker, index) => (
                                    <Car key={index} data={marker} />
                                ))}
                            </MarkerClusterGroup>
                        </MapContainer>
                    </div>
                    <div className="flex-col fixed bottom-10 right-2 z-1000 w-max">
                        {maps.map((item) => (
                            <button
                                onClick={() => setMap(item.map)}
                                key={item.id}
                                className="rounded flex items-center bg-white w-full mt-1"
                            >
                                <div className="overflow-hidden rounded w-12 h-12">
                                    <img
                                        src={`https://my.mobicam.vn/static/images/maptype-${item.id}.png`}
                                        alt=""
                                    />
                                </div>
                                <p className="p-2 text-xs font-semibold">
                                    {item.name}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
