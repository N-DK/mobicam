import 'leaflet/dist/leaflet.css';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import { publicRoutes } from './routes';
import { DefaultLayout } from './components/layouts/DefaultLayout';
import React from 'react';

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    {publicRoutes.map((route, index) => {
                        const Layout =
                            route.layout === null
                                ? React.Fragment
                                : DefaultLayout;
                        const Page = route.component;

                        return (
                            <Route
                                exact
                                key={index}
                                path={route.path}
                                element={
                                    <Layout>
                                        <Page />
                                    </Layout>
                                }
                            />
                        );
                    })}
                    <Route path="/" element={<Navigate to="/online" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
