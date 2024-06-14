import { requestV1 } from '~/utils';

export const login = async (payload) => {
    try {
        const res = await requestV1.post('/login', payload, {
            headers: {
                'nc-name': `midvn`,
            },
        });

        return res.data;
    } catch (error) {
        console.log(error);
    }
};
