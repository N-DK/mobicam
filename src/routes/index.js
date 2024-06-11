import { Home } from '~/pages/Home';
import { Route } from '~/pages/Review/Route';

export const publicRoutes = [
    { path: '/online', component: Home },
    { path: '/route/review', component: Route },
];
export const privateRoutes = [];
