import React, { useEffect, useContext, useState } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import { fetchIsolateds } from './fetch_and_utils';
import IsolatedTable from './tables/IsolatedTable';
import TopNavBar from './TopNavBar';
import Search from './Search';

let status = 0

const IsolatedPage = function (props) {
    const { setLoading, setIsolateds, selectedIsolator, setSelectedIsolator } = useContext(AdminMainContext)
    const [filters, setFilters] = useState({})
    const [resultNum, setResultNum] = useState('')

    useEffect(() => {
        (async () => {
            setLoading(true)
            getIsolateds()
        })()
    }, [])

    useEffect(() => {
        if (selectedIsolator && props.location.pathname === "/searchings") {
            props.history.push("/searcher")
        } else if (selectedIsolator === null && props.location.pathname === "/searcher") {
            props.history.push("/searchings")
        }
    }, [selectedIsolator])

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
            <div style={{ padding: '0 10vw' }}>
                <div className='orangeTitle'>מחפשים בעלי תקיעה</div>
                <div style={{ display: 'flex' }}>
                    <Search onSearch={onSearchName} placeholder='חיפוש לפי שם' />
                    <div style={{ margin: '0 1vw' }}></div>
                    <Search onSearch={onSearchAddress} placeholder='חיפוש לפי כתובת' />
                </div>
                <div className='statusNavContainer'>
                    <div className={'orangeText subTitle pointer' + (status === 0 ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(0)}>מחפשים בלי בעל תוקע</div>
                    <div style={{ width: '3.5vw' }}></div>
                    <div className={'orangeText subTitle pointer' + (status === 1 ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(1)}>מחפשים עם בעל תוקע</div>
                    <div className='blueText subTitle resultNum bold'>{`סה"כ ${resultNum} תוצאות`}</div>
                </div>
                <IsolatedTable resultNum={resultNum} getIsolateds={getIsolateds} setSelectedIsolator={setSelectedIsolator} />
            </div>
        </div>
    );
}

export default IsolatedPage