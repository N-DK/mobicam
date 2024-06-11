const { Header } = require('./Header');

function DefaultLayout({ children }) {
    return (
        <div className={` `}>
            <Header />
            <div className="overflow-hidden h-screen">{children}</div>
        </div>
    );
}

export default DefaultLayout;
