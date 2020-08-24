import React, { useState } from 'react';

export const AdminMainContext = React.createContext()

export const AdminMainProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [isolateds, setIsolateds] = useState(null)
    const [shofarBlowers, setShofarBlowers] = useState(null)
    const [blastsPub, setBlastsPub] = useState(null)
    const [loadingBlastsPub, setLoadingBlastsPub] = useState(false)
    const [blastInfo, setBlastInfo] = useState(null)
    const [isOpenParticipantsPopUp, setOpenParticipantsPopUp] = useState(false)
    const [blowersNum, setBlowerNum] = useState(0);
    const [isolatedNum, setIsolatedNum] = useState(0);
    const [blastsNum, setBlastsNum] = useState(0);
    const [isOpenSideBar, setOpenSideBar] = useState(false);


    const ctxValue = {
        loading, setLoading,
        isolateds, setIsolateds,
        shofarBlowers, setShofarBlowers,
        blastsPub, setBlastsPub,
        loadingBlastsPub, setLoadingBlastsPub,
        blastInfo, setBlastInfo,
        isOpenParticipantsPopUp, setOpenParticipantsPopUp,
        blowersNum, setBlowerNum,
        isolatedNum, setIsolatedNum,
        blastsNum, setBlastsNum,
        isOpenSideBar, setOpenSideBar
    }

    return <AdminMainContext.Provider value={ctxValue} >{children}</AdminMainContext.Provider>
}