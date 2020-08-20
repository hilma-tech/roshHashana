import React, { useEffect, useState, useContext } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import { fetchBlastsPub } from './fetch_and_utils';
import BlastsTable from './tables/BlastsTable';
import BlastInfo from "./BlastInfo"
import BlastInfoPrev from "./BlastInfoPrev"
import './style/BlastsPage.scss'

const BlastsPage = (props) => {

    const { setLoadingBlastsPub, setBlastsPub } = useContext(AdminMainContext)

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
        <div className="BlastsPage">
            <div className="width75">
                <BlastsTable />
            </div>
            <BlastInfo />
            {/* <BlastInfoPrev/> */}
        </div>
    );
}
export default BlastsPage;