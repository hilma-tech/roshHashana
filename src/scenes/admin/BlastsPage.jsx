import React, { useEffect, useState, useContext } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import { fetchBlastsPub } from './fetch_and_utils';
import BlastsTable from './tables/BlastsTable';
import BlastInfo from "./BlastInfo"
import TopNavBar from "./TopNavBar"
import Search from './Search';
import BlastInfoPrev from "./BlastInfoPrev"
import './styles/blastsPage.scss'

let status = 0

const BlastsPage = (props) => {

    const { setLoadingBlastsPub, setBlastsPub, blastInfo, setPubMeetingsNum, pubMeetingsNum } = useContext(AdminMainContext)
    const [filters, setFilters] = useState(null)

    const getBlastsPub = function (filter = {}, limit = { start: 0, end: 10 }) {
        (async () => {
            if (!filter) filter = {}
            setLoadingBlastsPub(true)
            await fetchBlastsPub(limit, filter, (err, res) => {
                console.log(err, res)
                setLoadingBlastsPub(false)
                if (!err) {
                    setBlastsPub(res.publicMeetings)
                    setPubMeetingsNum(res.num)
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
        getBlastsPub(filters)
    }

    const onSearchAddress = (value) => {
        setFilters(pervFilters => {
            if (!pervFilters) pervFilters = {}
            pervFilters.address = value
            return pervFilters
        })
        getBlastsPub(filters)
    }

    useEffect(() => {
        (async () => {
            getBlastsPub()
        })()
    }, [])

    const statusCliked = function (s) {
        if (status === s) return
        status = s
        // getIsolateds(filters)
    }


    return (
        <div>
            <TopNavBar />
            <div className="BlastsPage">
                <div className="width75">
                    <div className="textHead bold">תקיעות</div>
                    <div style={{ display: 'flex' }}>
                        <Search onSearch={onSearchName} placeholder='חיפוש לפי שם' />
                        <div style={{ margin: '0 1vw' }}></div>
                        <Search onSearch={onSearchAddress} placeholder='חיפוש לפי כתובת' />
                    </div>
                    {/* <div className="overallNum">{pubMeetingsNum} תוצאות</div> */}
                    <div className='statusNavContainer'>
                        <div className={'orangeSubTitle pointer' + (status === 0 ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(0)}>מחפשים בלי בעל תוקע</div>
                        <div style={{ width: '3.5vw' }}></div>
                        <div className={'orangeSubTitle pointer' + (status === 1 ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(1)}>מחפשים עם בעל תוקע</div>
                        <div className='blueSubTitle resultNum bold'>{`סה"כ ${pubMeetingsNum} תוצאות`}</div>
                    </div>
                    <BlastsTable />
                </div>
                {blastInfo ? <BlastInfo /> : <BlastInfoPrev />}
            </div>
        </div>
    );
}
export default BlastsPage;