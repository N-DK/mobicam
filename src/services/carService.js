import { request, requestV1 } from '~/utils';

export const getListVehicles = async () => {
    try {
        const res = await request.post(
            'mLvehi',
            {},
            {
                headers: {
                    'X-Mobicam-Token': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjQ1LCJhcHAiOiJtaWR2biIsImxldmVsIjowLCJjb21JRCI6LTEsImlhdCI6MTcxNzk5MTE3NCwiZXhwIjoxNzE4MjUwMzc0fQ.UMy5aIHz4z6t4UTJ3Lqfc7h3wkXdfRS-a-Tp5Q4RdxQ`,
                },
            },
        );

        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const getTrackList = async () => {
    try {
        const res = await requestV1.post(
            'trackList',
            {
                startDate: '2024-06-11',
                endDate: '2024-06-11',
                startTime: '00:00:00',
                endTime: '23:59:59',
                company: 1,
                devId: '08944FDDBT',
                vid: '50G02619',
            },
            {
                headers: {
                    'X-Mobicam-Token': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjQ1LCJhcHAiOiJtaWR2biIsImxldmVsIjowLCJjb21JRCI6LTEsImlhdCI6MTcxNzk5MTE3NCwiZXhwIjoxNzE4MjUwMzc0fQ.UMy5aIHz4z6t4UTJ3Lqfc7h3wkXdfRS-a-Tp5Q4RdxQ`,
                },
            },
        );

        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export const getPackingRp = async () => {
    try {
        const res = await request.post(
            'packingRp',
            {
                company: 1,
                endTime: 1718125199,
                licencePlate: ['50G02607'],
                limit: 0,
                startTime: 1718038800,
            },
            {
                headers: {
                    'X-Mobicam-Token': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjQ1LCJhcHAiOiJtaWR2biIsImxldmVsIjowLCJjb21JRCI6LTEsImlhdCI6MTcxNzk5MTE3NCwiZXhwIjoxNzE4MjUwMzc0fQ.UMy5aIHz4z6t4UTJ3Lqfc7h3wkXdfRS-a-Tp5Q4RdxQ`,
                },
            },
        );

        return res.data;
    } catch (error) {
        console.log(error);
    }
};
