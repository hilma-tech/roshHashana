import React, { useEffect, useContext, useState } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchShofarBlowers } from './fetch_and_utils';
import ShofarBlowerTable from './tables/ShofarBlowerTable';
import TopNavBar from './TopNavBar';
import Search from './Search';
import './styles/shofarBlowerPage.scss'

let status = 0 // 0 is not confirmed, 1 is confirmed shofar blowers

const ShofarBlowerPage = function (props) {
    const { selectedSB, setSelectedSB, setLoading, setShofarBlowers } = useContext(AdminMainContext)
    const [filters, setFilters] = useState({})
    const [resultNum, setResultNum] = useState('')

    useEffect(() => {
        getShofarBlowers()
    }, [])

    // useEffect(() => {
    //     console.log('selectedSB: ', selectedSB);
    //     if (selectedSB && props.location.pathname === "/shofar-blowers") {
    //         props.history.push("/shofar-blower")
    //     } else if (selectedSB === null && props.location.pathname === "/shofar-blower") {
    //         props.history.push("/shofar-blowers")
    //     }
    // }, [selectedSB])

    const getShofarBlowers = function (filter = filters, startRow = 0) {
        (async () => {
            if (!filter) filter = filters
            if (status === 0) filter.confirm = false
            else if (status === 1) filter.confirm = true
            setLoading(true)
            await fetchShofarBlowers(startRow, filter, (err, res) => {
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
            pervFilters.name = value
            return pervFilters
        })
        getShofarBlowers(filters)
    }

    const onSearchAddress = function (value) {
        setFilters(pervFilters => {
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
        <div className="isolatedsContainer" >
            <TopNavBar history={props.history}  />
            <div style={{ padding: '0 10vw' }}>
                <div className='orangeTitle'>מתנדבים לתקוע בשופר</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Search onSearch={onSearchName} placeholder='חיפוש לפי שם' />
                    <div style={{ margin: '0 1vw' }}></div>
                    <Search onSearch={onSearchAddress} placeholder='חיפוש לפי כתובת' />
                    <div className='bluePlusContainer pointer' onClick={() => { props.history.push('/skerdsgfkjs9889cdfcis596jtrgd7yfuszygs/add-shofar-blower') }}>
                        <FontAwesomeIcon icon={['fas', 'plus-circle']} />
                        <div>הוספת בעל תקיעה</div>
                    </div>
                </div>
                <div className='statusNavContainer'>
                    <div className={'orangeText subTitle pointer' + (status === 0 ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(0)}>ממתינים לאישור</div>
                    <div style={{ width: '3.5vw' }}></div>
                    <div className={'orangeText subTitle pointer' + (status === 1 ? ' bold orangeBorderBottom' : '')} onClick={() => statusCliked(1)}>מתנדבים</div>
                    <div className='blueText subTitle resultNum bold'>{`סה"כ ${resultNum} תוצאות`}</div>
                </div>
                <ShofarBlowerTable selectedSB={selectedSB} setSelectedSB={setSelectedSB} getShofarBlowers={getShofarBlowers} setResultNum={setResultNum} resultNum={resultNum} status={status} history={props.history} />
            </div>
        </div>
    );
}

export default ShofarBlowerPage