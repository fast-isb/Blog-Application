// Admincontext.js
import React, { createContext, useState } from 'react';

export const Admincontext = createContext({});

export function Admincontextprovider({ children }) {
    const [admininfo, setAdmininfo] = useState({});

    return (
        <Admincontext.Provider value={{ admininfo, setAdmininfo }}>
            {children}
        </Admincontext.Provider>
    )
}
