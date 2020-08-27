import React, { useEffect, useContext, useState } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import { fetchShofarBlowers } from './fetch_and_utils';
import ShofarBlowerTable from './tables/ShofarBlowerTable';
import TopNavBar from './TopNavBar';
import Search from './Search';
import './styles/generalAdminStyle.scss'

let status = 0

const IsolatedPage = function (props) {
    const { setLoading, setShofarBlowers } = useContext(AdminMainContext)
    const [filters, setFilters] = useState(null)
    const [resultNum, setResultNum] = useState('')

    useEffect(() => {
        (async () => {
            setLoading(true)
            getShofarBlowers()
        })()
    }, [])

    const getShofarBlowers = function (filter = {}, limit = { start: 0, end: 10 }) {
        (async () => {
            if (!filter) filter = {}
            if (status === 0) filter.confirm = false
            else if (status === 1) filter.confirm = true
            await fetchShofarBlowers(limit, filter, (err, res) => {
                setLoading(false)
                if (!err) {
                    setShofarBlowers(res.shofarBlowers)
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
        getShofarBlowers(filters)
    }

    const onSearchAddress = function (value) {
        setFilters(pervFilters => {
            if (!pervFilters) pervFilters = {}
            pervFilters.address = value
            return pervFilters
        })
        getShofarBlowers(filters)
    }

    const statusCliked = function (s) {
        if (status === s) return
        status = s
        getShofarBlowers(filters)
    }

    return (
        <div className='isolatedsContainer'>
            <TopNavBar />
            <div style={{ padding: '0 10vw' }}>
                <div className='orangeTitle'>מתנדבים לתקוע בשופר</div>
                <div style={{ display: 'flex' }}>
                    <Search onSearch={onSearchName} placeholder='חיפוש לפי שם' />
                    <div style={{ margin: '0 2vw' }}></div>
                    <Search onSearch={onSearchAddress} placeholder='חיפוש לפי כתובת' />
                </div>
                <div className='statusNavContainer'>
                    <div className={'orangeSubTitle pointer' + (status === 0 ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(0)}>ממתינים לאישור</div>
                    <div style={{ width: '3.5vw' }}></div>
                    <div className={'orangeSubTitle pointer' + (status === 1 ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(1)}>מתנדבים</div>
                    <div className='blueSubTitle resultNum'>{`סה"כ ${resultNum} תוצאות`}</div>
                </div>
                <ShofarBlowerTable resultNum={resultNum} />
            </div>
        </div>
    );
}

export default IsolatedPage