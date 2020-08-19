import React, { useState } from 'react';


export const MainContext = React.createContext()

export const MainProvider = ({ children }) => {
  
    const ctxValue = {
    }

    return <MainContext.Provider value={ctxValue} >
        {children}
    </MainContext.Provider>
}