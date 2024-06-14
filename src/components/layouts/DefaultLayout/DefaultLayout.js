import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const { Header } = require('./Header');

function DefaultLayout({ children }) {
    const navigator = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) navigator('/login');
    }, []);

    return (
        <div className={` `}>
            <Header />
            <div className="overflow-hidden h-screen">{children}</div>
        </div>
    );
}

export default DefaultLayout;
