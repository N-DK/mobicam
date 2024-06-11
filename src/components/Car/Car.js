import { Marker, Popup } from 'react-leaflet';
import { getIcon } from '~/utils';
import React, { useMemo } from 'react';

const Car = React.memo(({ data }) => {
    const icon = useMemo(() => {
        return getIcon(
            data?.dir,
            data?.speed === 0
                ? data?.accIO % 2 === 0
                    ? '#e74b3c'
                    : '#4397c9'
                : '#00aa9a',
        );
    }, [data?.dir, data?.speed, data?.accIO]);

    return (
        data && (
            <Marker position={[data?.lat, data?.lng]} icon={icon}>
                <Popup>{data?.name}</Popup>
            </Marker>
        )
    );
});

export default Car;
