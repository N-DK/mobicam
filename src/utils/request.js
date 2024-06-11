import axios from 'axios';

const request = axios.create({
    baseURL: 'https://checkapp.midvietnam.com/v2/',
});

const requestV1 = axios.create({
    baseURL: 'https://checkapp.midvietnam.com/v1/',
});

export const get = async (path, options = {}) => {
    const response = await request.get(path, options);
    return response.data;
};

export const put = async (path, data = {}) => {
    const response = await request.put(path, data);
    return response.data;
};
export { requestV1 };
export default request;
