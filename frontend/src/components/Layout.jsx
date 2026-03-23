import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#f4f6fb' }}>
        <Sidebar />
        <main className="flex-grow-1 p-4" style={{ marginLeft: '240px', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px' }}>
                {children}
            </div>
        </main>
    </div>
);

export default Layout;
