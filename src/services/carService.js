import { request, requestV1 } from '~/utils';

export const getListVehicles = async () => {
    try {
        const res = await request.post(
            'mLvehi',
            {},
            {
                headers: {
                    'X-Mobicam-Token': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjQ1LCJhcHAiOiJtaWR2biIsImxldmVsIjowLCJjb21JRCI6LTEsImlhdCI6MTcxODI1MDU5NSwiZXhwIjoxNzE4NTA5Nzk1fQ.smD1pJI0lQgAeEPrX4E618vPt5k8g3ocUyI5nuFxuhs`,
                },
            },
        );

        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const getTrackList = async (payload) => {
    try {
        const res = await requestV1.post('trackList', payload, {
            headers: {
                'X-Mobicam-Token': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjQ1LCJhcHAiOiJtaWR2biIsImxldmVsIjowLCJjb21JRCI6LTEsImlhdCI6MTcxODI1MDU5NSwiZXhwIjoxNzE4NTA5Nzk1fQ.smD1pJI0lQgAeEPrX4E618vPt5k8g3ocUyI5nuFxuhs`,
            },
        });

        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const getPackingRp = async (payload) => {
    try {
        const res = await request.post('packingRp', payload, {
            headers: {
                'X-Mobicam-Token': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjQ1LCJhcHAiOiJtaWR2biIsImxldmVsIjowLCJjb21JRCI6LTEsImlhdCI6MTcxODI1MDU5NSwiZXhwIjoxNzE4NTA5Nzk1fQ.smD1pJI0lQgAeEPrX4E618vPt5k8g3ocUyI5nuFxuhs`,
            },
        });

        return res.data;
    } catch (error) {
        console.log(error);
    }
};
