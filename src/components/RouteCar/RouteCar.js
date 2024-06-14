import { useEffect, useState } from 'react';
import { Car } from '../Car';
import { chunkArray } from '~/utils';
import { MapContainer, Polyline, useMap } from 'react-leaflet';

function RouteCar({ props }) {
    const {
        data,
        pointRoute,
        speed,
        play,
        pointRouteRef,
        rangeRef,
        maxPage,
        setPage,
    } = props;
    const [point, setPoint] = useState(pointRoute);
    const [properties, setProperties] = useState();

    const map = useMap();

    const getPageByPointRoute = (pointRoute) => {
        const chunks = chunkArray(data, maxPage);
        for (let page = 0; page < chunks.length; page++) {
            for (let index = 0; index < chunks[page].length; index++) {
                if (maxPage * page + index === pointRoute) {
                    return page;
                }
            }
        }
        return -1;
    };

    useEffect(() => {
        setPoint(pointRoute);
    }, [pointRoute]);

    useEffect(() => {
        // if (rangeRef) {
        //     rangeRef.current.value = point;
        //     const valPercent = (point / rangeRef.current.max) * 100;
        //     rangeRef.current.style.background = `linear-gradient(to right, #3671f6 ${valPercent}%, #cccccc ${valPercent}%)`;
        // }
    }, [point]);

    useEffect(() => {
        pointRouteRef.current = point;
        if (getPageByPointRoute(point) > -1)
            setPage(getPageByPointRoute(point));
    }, [point]);

    useEffect(() => {
        if (data) {
            setProperties({
                lat: data[point]?.lat,
                lng: data[point]?.lng,
                dir: data[point]?.direction + 90,
                speed: data[point]?.speed,
                accIO: data[point]?.ac,
                name: 'TRUYEN VAO',
            });
        }
    }, [data, point]);

    useEffect(() => {
        if (data && play) {
            const interval = setInterval(() => {
                setPoint((prevPointRoute) => {
                    const newPointRoute =
                        prevPointRoute + 1 < data.length
                            ? prevPointRoute + 1
                            : prevPointRoute;
                    pointRouteRef.current = newPointRoute;
                    return newPointRoute;
                });
            }, 1000 / speed);

            return () => clearInterval(interval);
        }
    }, [data, speed, play]);

    return (
        <div>
            {properties && (
                <>
                    <Car data={properties} />
                </>
            )}
        </div>
    );
}

export default RouteCar;
