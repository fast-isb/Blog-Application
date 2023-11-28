const { createContext, useState } = require("react");

export const Usercontext = createContext({});

export function Usercontextprovider({ children }) {
    const [userinfo, Setuserinfo] = useState({});
    return (
        <Usercontext.Provider value={{ userinfo, Setuserinfo }}>
            {children}
        </Usercontext.Provider>
    )
}