import React, { useState } from 'react';

export const AdminMainContext = React.createContext()

export const AdminMainProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [isolateds, setIsolateds] = useState(null)
    const [blastsPub, setBlastsPub] = useState(null)
    const [loadingBlastsPub, setLoadingBlastsPub] = useState(false)
    const [blastInfo, setBlastInfo] = useState(null)
    const [isOpenParticipantsPopUp, setOpenParticipantsPopUp] = useState(false)
    const [blowersNum, setBlowerNum] = useState(0);
    const [isolatedNum, setIsolatedNum] = useState(0);
    const [blowsNum, setBlowsNum] = useState(0);
    const [isOpenSideBar, setOpenSideBar] = useState(false);


    const ctxValue = {
        loading, setLoading,
        isolateds, setIsolateds,
        blastsPub, setBlastsPub,
        loadingBlastsPub, setLoadingBlastsPub,
        blastInfo, setBlastInfo,
        isOpenParticipantsPopUp, setOpenParticipantsPopUp,
        blowersNum, setBlowerNum,
        isolatedNum, setIsolatedNum,
        blowsNum, setBlowsNum,
        isOpenSideBar, setOpenSideBar
    }

    return <AdminMainContext.Provider value={ctxValue} >{children}</AdminMainContext.Provider>
}