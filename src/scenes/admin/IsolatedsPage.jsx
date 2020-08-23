import React, { useEffect, useContext, useState } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import { fetchIsolateds } from './fetch_and_utils';
import IsolatedTable from './tables/IsolatedTable';
import TopNavBar from './TopNavBar';
import Search from './Search';
import './styles/generalAdminStyle.scss'

let status = 0

const IsolatedPage = function (props) {
    const { setLoading, setIsolateds } = useContext(AdminMainContext)
    const [filters, setFilters] = useState(null)
    const [resultNum, setResultNum] = useState('')

    useEffect(() => {
        (async () => {
            setLoading(true)
            getIsolateds()
        })()
    }, [])

    const getIsolateds = function (filter = {}, limit = { start: 0, end: 10 }) {
        (async () => {
            if (!filter) filter = {}
            if (status === 0) filter.haveMeeting = false
            else if (status === 1) filter.haveMeeting = true
            await fetchIsolateds(limit, filter, (err, res) => {
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
            if (!pervFilters) pervFilters = {}
            pervFilters.name = value
            return pervFilters
        })
        getIsolateds(filters)
    }

    const onSearchAddress = function (value) {
        setFilters(pervFilters => {
            if (!pervFilters) pervFilters = {}
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
            <TopNavBar />
            <div style={{ padding: '0 10vw' }}>
                <div className='orangeTitle'>מחפשים בעלי תקיעה</div>
                <div style={{ display: 'flex' }}>
                    <Search onSearch={onSearchName} placeholder='חיפוש לפי שם' />
                    <div style={{ margin: '0 2vw' }}></div>
                    <Search onSearch={onSearchAddress} placeholder='חיפוש לפי כתובת' />
                </div>
                <div className='statusNavContainer'>
                    <div className={'orangeSubTitle pointer' + (status === 0 ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(0)}>מחפשים בלי בעל תוקע</div>
                    <div style={{ width: '3.5vw' }}></div>
                    <div className={'orangeSubTitle pointer' + (status === 1 ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(1)}>מחפשים עם בעל תוקע</div>
                    <div className='blueSubTitle resultNum'>{`סה"כ ${resultNum} תוצאות`}</div>
                </div>
                <IsolatedTable resultNum={resultNum} />
            </div>
        </div>
    );
}

export default IsolatedPage