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
    const [blastsNum, setBlastsNum] = useState(0);
    const [isOpenSideBar, setOpenSideBar] = useState(false);
    const [pubMeetingsNum, setPubMeetingsNum] = useState(false);
    const [participantsPublicMeeting, setParticipantsPublicMeeting] = useState(null)


    const ctxValue = {
        pubMeetingsNum, setPubMeetingsNum,
        loading, setLoading,
        isolateds, setIsolateds,
        blastsPub, setBlastsPub,
        loadingBlastsPub, setLoadingBlastsPub,
        blastInfo, setBlastInfo,
        isOpenParticipantsPopUp, setOpenParticipantsPopUp,
        blowersNum, setBlowerNum,
        isolatedNum, setIsolatedNum,
        blastsNum, setBlastsNum,
        isOpenSideBar, setOpenSideBar,
        participantsPublicMeeting, setParticipantsPublicMeeting
    }

    return <AdminMainContext.Provider value={ctxValue} >{children}</AdminMainContext.Provider>
}