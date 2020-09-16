import React, { useEffect, useContext, useState } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import { fetchIsolateds } from './fetch_and_utils';
import IsolatedTable from './tables/IsolatedTable';
import TopNavBar from './TopNavBar';
import Search from './Search';
import IsolatedInfo from './IsolatedInfo';

import { useSocket, useJoinLeave } from "@hilma/socket.io-react";

let status = 0

const IsolatedPage = function (props) {
    const { setLoading, setIsolateds, selectedIsolator, setSelectedIsolator } = useContext(AdminMainContext)
    const [filters, setFilters] = useState({})
    const [resultNum, setResultNum] = useState('')
    const socket = useSocket();
    useJoinLeave('blower-events', (err) => {
        if (err) console.log("failed to join room blower-events");
    })

    useEffect(() => {
        setLoading(true)
        getIsolateds();
        socket.on('newMeetingAssigned', handleNewMeeting)
        return () => {
            socket.off('newMeetingAssigned', handleNewMeeting);
        }
    }, [])

    const getIsolateds = function (filter = filters, startRow = 0) {
        (async () => {
            if (!filter) filter = filters
            if (status === 0) filter.haveMeeting = false
            else if (status === 1) filter.haveMeeting = true
            await fetchIsolateds(startRow, filter, (err, res) => {
                setLoading(false)
                if (!err) {
                    setIsolateds(res.isolateds)
                    setResultNum(res.resNum)
                }
            })
        })()
    }
    const compareIsPublicMeetings = (pm1, pm2) => {
        let pm1bool = (pm1 == 0 || pm1 == false) ? false : (pm1 == 1 || pm1 == true) ? true : null
        let pm2bool = (pm2 == 0 || pm2 == false) ? false : (pm2 == 1 || pm2 == true) ? true : null
        return (pm1bool === null || pm2bool === null) ? false : pm1bool == pm2bool
    }
    const handleNewMeeting = (req) => {
        if (status === 0) {
            setIsolateds(prevIsolateds => {
                let isolateds = [...prevIsolateds]
                isolateds = isolateds.filter((isolated) => (!compareIsPublicMeetings(isolated.isPublicMeeting, req.isPublicMeeting) || isolated.id !== req.meetingId))
                return isolateds
            })
        }
    };

    const onSearchName = function (value) {
        setFilters(pervFilters => {
            pervFilters.name = value
            return pervFilters
        })
        getIsolateds(filters)
    }

    const onSearchAddress = function (value) {
        setFilters(pervFilters => {
            pervFilters.address = value
            return pervFilters
        })
        getIsolateds(filters)
    }

    const statusCliked = function (s) {
        if (status === s) return
        status = s
        getIsolateds(filters)
    }

    return (
        <div className='isolatedsContainer'>
            <TopNavBar history={props.history} />
            <div>
                <div style={{ display: 'flex', width: '100vw' }}>
                    <div style={{ padding: '0 4vw', width: '65%' }}>
                        <div className='orangeTitle'>מחפשים בעלי תקיעה</div>
                        <div style={{ display: 'flex' }}>
                            <Search onSearch={onSearchName} placeholder='חיפוש לפי שם' regex={/^[A-Zא-תa-z '"-]{1,}$/} />
                            <div style={{ margin: '0 1vw' }}></div>
                            <Search onSearch={onSearchAddress} placeholder='חיפוש לפי כתובת' regex={/^[A-Zא-תa-z '"-()0-9,]{1,}$/} />
                        </div>
                        <div className='statusNavContainer'>
                            <div className={'orangeText subTitle pointer' + (status === 0 ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(0)}>מחפשים בלי בעל תוקע</div>
                            <div style={{ width: '3.5vw' }}></div>
                            <div className={'orangeText subTitle pointer' + (status === 1 ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(1)}>מחפשים עם בעל תוקע</div>
                            <div className='blueText subTitle resultNum bold'>{`סה"כ ${resultNum} תוצאות`}</div>
                        </div>
                        <IsolatedTable resultNum={resultNum} getIsolateds={getIsolateds} setSelectedIsolator={setSelectedIsolator} haveMeeting={filters.haveMeeting} />
                    </div>
                    <IsolatedInfo />
                </div>
            </div>
        </div>
    );
}

export default IsolatedPage