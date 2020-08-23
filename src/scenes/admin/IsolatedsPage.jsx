import React, { useEffect, useContext, useState } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import { fetchIsolateds } from './fetch_and_utils';
import IsolatedTable from './tables/IsolatedTable';
import Search from './Search';
import './styles/generalAdminStyle.scss'

const IsolatedPage = (props) => {
    const { setLoading, setIsolateds } = useContext(AdminMainContext)
    const [filters, setFilters] = useState(null)
    const [resultNum, setResultNum] = useState('')

    useEffect(() => {
        (async () => {
            setLoading(true)
            getIsolateds()
        })()
    }, [])

    const getIsolateds = async (filter = {}, limit = { start: 0, end: 10 }) => {

        await fetchIsolateds(limit, filter, (err, res) => {
            setLoading(false)
            if (!err) {
                setIsolateds(res.isolateds)
                setResultNum(res.resNum)
            }
        })
    }

    const onSearchName = (value) => {
        setFilters(pervFilters => {
            if (!pervFilters) pervFilters = {}
            pervFilters.name = value
            return pervFilters
        })
        getIsolateds(filters)
    }

    const onSearchAddress = (value) => {
        setFilters(pervFilters => {
            if (!pervFilters) pervFilters = {}
            pervFilters.address = value
            return pervFilters
        })
        getIsolateds(filters)
    }

    return (
        <div className='isolatedsContainer' style={{ padding: '0 10vw' }}>
            <div className='orangeTitle'>מחפשים בעלי תקיעה</div>
            <div style={{ display: 'flex' }}>
                <Search onSearch={onSearchName} placeholder='חיפוש לפי שם' />
                <div style={{ margin: '0 2vw' }}></div>
                <Search onSearch={onSearchAddress} placeholder='חיפוש לפי כתובת' />
            </div>
            <div className='blueSubTitle'>{`סה"כ ${resultNum} תוצאות`}</div>
            <IsolatedTable resultNum={resultNum} />
        </div>
    );
}

export default IsolatedPage