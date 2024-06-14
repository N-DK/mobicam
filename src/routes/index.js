import { Home } from '~/pages/Home';
import { Login } from '~/pages/Login';
import Route from '~/pages/Review/Route/Route';

export const publicRoutes = [
    { path: '/online', component: Home },
    { path: '/route/review', component: Route },
    { path: '/login', component: Login, layout: null },
];
export const privateRoutes = [];
