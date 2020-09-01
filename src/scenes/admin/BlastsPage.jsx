import React, { useEffect, useState, useContext } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import { fetchBlastsPub, fetchBlastsPrivate, deleteConectionToMeeting } from './fetch_and_utils';
import BlastsPubTable from './tables/BlastsPubTable';
import BlastsPrivateTable from './tables/BlastsPrivateTable';
import BlastInfo from "./BlastInfo"
import TopNavBar from "./TopNavBar"
import Search from './Search';
import BlastInfoPrev from "./BlastInfoPrev"
import './styles/blastsPage.scss'

const BlastsPage = (props) => {

    const { blastsNum, setBlastsNum, blastsPrivate, setLoadingBlastsPub, setBlastsPub, setBlastInfo, blastInfo, setPubMeetingsNum, privateMeetingsNum, pubMeetingsNum, setPrivateMeetingsNum, setBlastsPrivate, setLoadingBlastsPrivate } = useContext(AdminMainContext)
    const [filters, setFilters] = useState(null)
    const [isPublic, setPublic] = useState(true)

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

    const getBlastsPrivate = function (filter = {}, limit = { start: 0, end: 10 }) {
        (async () => {
            if (!filter) filter = {}
            setLoadingBlastsPrivate(true)
            await fetchBlastsPrivate(limit, filter, (err, res) => {
                console.log("!!!!", err, res)
                setLoadingBlastsPrivate(false)
                if (!err) {
                    setBlastsPrivate(res.privateMeetings)
                    setPrivateMeetingsNum(res.num)
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
        getBlastsPrivate(filters)
        getBlastsPub(filters)
    }

    const onSearchAddress = (value) => {
        setFilters(pervFilters => {
            if (!pervFilters) pervFilters = {}
            pervFilters.address = value
            return pervFilters
        })
        getBlastsPrivate(filters)
        getBlastsPub(filters)
    }

    const handleTrashClick = (id, index) => {
        (async () => {
            await deleteConectionToMeeting(id, (err, res) => {
                if (err) {
                    console.log("err in deleteConectionToMeeting", err)
                    return
                }
                let newblastsPrivate = [...blastsPrivate]
                newblastsPrivate.splice(index, 1)
                setBlastsPrivate(newblastsPrivate)
                setBlastInfo(null)
                setPrivateMeetingsNum(privateMeetingsNum - 1)
                setBlastsNum(blastsNum - 1)
            })
        })()
    }

    useEffect(() => {
        (async () => {
            getBlastsPub()
            getBlastsPrivate()
        })()
    }, [])

    const statusCliked = function (val) {
        setPublic(val)
        setBlastInfo(null)
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
                    <div className='statusNavContainer'>
                        <div className={'orangeSubTitle pointer' + (isPublic ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(true)}>תקיעה ציבורית</div>
                        <div style={{ width: '3.5vw' }}></div>
                        <div className={'orangeSubTitle pointer' + (!isPublic ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(false)}>תקיעה פרטית</div>
                        <div className='blueSubTitle resultNum bold'>{`סה"כ ${isPublic ? pubMeetingsNum : privateMeetingsNum} תוצאות`}</div>
                    </div>
                    {isPublic ? <BlastsPubTable /> : <BlastsPrivateTable handleTrashClick={handleTrashClick} />}
                </div>
                {blastInfo ? <BlastInfo handleTrashClick={handleTrashClick} /> : <BlastInfoPrev />}
            </div>
        </div>
    );
}
export default BlastsPage;