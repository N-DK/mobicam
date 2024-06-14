import { request, requestV1 } from '~/utils';

export const getListVehicles = async () => {
    try {
        const res = await request.post(
            'mLvehi',
            {},
            {
                headers: {
                    'X-Mobicam-Token': `${
                        JSON.parse(localStorage.getItem('user')).accessToken
                    }`,
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
                'X-Mobicam-Token': `${
                    JSON.parse(localStorage.getItem('user')).accessToken
                }`,
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
                'X-Mobicam-Token': `${
                    JSON.parse(localStorage.getItem('user')).accessToken
                }`,
            },
        });

        return res.data;
    } catch (error) {
        console.log(error);
    }
};
