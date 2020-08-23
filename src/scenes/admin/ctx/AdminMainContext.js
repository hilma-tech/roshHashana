import React, { useState } from 'react';

export const AdminMainContext = React.createContext()

export const AdminMainProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [isolateds, setIsolateds] = useState(null)
    const [blastsPub, setBlastsPub] = useState(null)
    const [loadingBlastsPub, setLoadingBlastsPub] = useState(false)


    const ctxValue = {
        loading, setLoading,
        isolateds, setIsolateds,
        blastsPub, setBlastsPub,
        loadingBlastsPub, setLoadingBlastsPub
    }

    return <AdminMainContext.Provider value={ctxValue} >
        {children}
    </AdminMainContext.Provider>
}