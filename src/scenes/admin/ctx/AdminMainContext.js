import React, { useState } from 'react';

export const AdminMainContext = React.createContext()

export const AdminMainProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [isolateds, setIsolateds] = useState(null)

    const ctxValue = {
        loading, setLoading,
        isolateds, setIsolateds
    }

    return <AdminMainContext.Provider value={ctxValue} >
        {children}
    </AdminMainContext.Provider>
}