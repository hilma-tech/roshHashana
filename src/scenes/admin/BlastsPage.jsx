import React, { useEffect, useState, useContext } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import { fetchBlastsPub } from './fetch_and_utils';
import BlastsTable from './tables/BlastsTable';
import BlastInfo from "./BlastInfo"
import TopNavBar from "./TopNavBar"
import Search from './Search';
import BlastInfoPrev from "./BlastInfoPrev"
import './styles/blastsPage.scss'

const BlastsPage = (props) => {

    const { setLoadingBlastsPub, setBlastsPub, blastInfo } = useContext(AdminMainContext)

    const onSearchName = (value) => {
        // setFilters(pervFilters => {
        //     if (!pervFilters) pervFilters = {}
        //     pervFilters.name = value
        //     return pervFilters
        // })
        // getIsolateds(filters)
    }

    const onSearchAddress = (value) => {
        // setFilters(pervFilters => {
        //     if (!pervFilters) pervFilters = {}
        //     pervFilters.address = value
        //     return pervFilters
        // })
        // getIsolateds(filters)
    }

    useEffect(() => {
        (async () => {
            setLoadingBlastsPub(true)
            await fetchBlastsPub({ start: 0, end: 10 }, '', (err, res) => {
                console.log(err, res)
                setLoadingBlastsPub(false)
                if (!err) setBlastsPub(res)
            })
        })()
    }, [])


    return (
        <div >
            <TopNavBar />
            <div className="BlastsPage">
                <div className="width75">
                    <div className="textHead bold">תקיעות</div>
                    <div style={{ display: 'flex' }}>
                        <Search onSearch={onSearchName} placeholder='חיפוש לפי שם' />
                        <div style={{ margin: '0 2vw' }}></div>
                        <Search onSearch={onSearchAddress} placeholder='חיפוש לפי כתובת' />
                    </div>
                    <div className="overallNum">סה"כ 259 תקיעות</div>
                    <BlastsTable />
                </div>
                {blastInfo ? <BlastInfo /> : <BlastInfoPrev />}
            </div>
        </div>
    );
}
export default BlastsPage;