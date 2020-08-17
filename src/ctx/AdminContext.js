import React, { useState, useEffect } from 'react';
import Auth from '../modules/auth/Auth';


export const AdminContext = React.createContext()

export const AdminProvider = ({ children }) => {

    const [blowersNum, setBlowerNum] = useState(0);
    const [isolatedNum, setIsolatedNum] = useState(0);
    const [blowsNum, setBlowsNum] = useState(0);

    useEffect(() => {
       ( async () => {
            const [errI, resI] = await Auth.superAuthFetch('/api/isolateds/count', {
                headers: { Accept: "application/json", "Content-Type": "application/json" }
            }, true);
            if (errI) {
                console.log("ERROR getting isolated num", errI);
                return;
            }
            console.log("RESSS", resI);
            setIsolatedNum(resI)

            const [errSB, resSB] = await Auth.superAuthFetch('/api/shofarBlowers/count', {
                headers: { Accept: "application/json", "Content-Type": "application/json" }
            }, true);
            if (errSB) {
                console.log("ERROR getting isolated num", errSB);
                return;
            }
            console.log("RESSS", resSB);
            setIsolatedNum(resSB)

            const [errB, resB] = await Auth.superAuthFetch('/api/isolateds/count', {
                headers: { Accept: "application/json", "Content-Type": "application/json" }
            }, true);
            if (errB) {
                console.log("ERROR getting isolated num", errB);
                return;
            }
            console.log("RESSS", resB);
            setIsolatedNum(resB)
        })();
    }, [])

    const ctxValue = {
        isolatedNum, setIsolatedNum,
        blowersNum, setBlowerNum,
        blowsNum, setBlowsNum
    }

    return <AdminContext.Provider value={ctxValue} >
        {children}
    </AdminContext.Provider>
}