import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import { getTime, deleteConectionToMeeting } from '../fetch_and_utils';
import GenericTable from './GenericTable'
import '../styles/table.scss'


const BlastsPrivateTable = (props) => {
    const { setBlastInfo, privateMeetingsNum, setPrivateMeetingsNum, blastsPrivate, setBlastsPrivate, loadingBlastsPrivate, setLoadingBlastsPrivate } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)

    const th = [['name', 'בעל התוקע'], ['nameOfIsolated', 'שם המבודד'], ['type', 'סוג התקיעה'], ['address', 'כתובת'], ['time', 'שעה משוערת'], ['info tableIcons', ''], ['delete tableIcons', '']]

    const handleInfoClick = (blast, index) => {
        blast.type = "פרטית"
        blast.index = index
        setBlastInfo(blast)
    }

    useEffect(() => {
        if (blastsPrivate) setTr(blastsPrivate.map((blast, index) => {
            return [
                blast.blowerName,
                blast.isolatedName,
                "פרטית",
                blast.address,
                getTime(blast.start_time),
                <FontAwesomeIcon className="pointer" style={{ fontSize: "1.7vh", textAlign: "left !important" }} icon={['fas', 'info-circle']} color='#156879' onClick={() => { handleInfoClick(blast, index) }} />,
                <FontAwesomeIcon className="pointer" style={{ fontSize: "1.7vh" }} icon={['fas', 'trash']} color='#156879' onClick={() => { props.handleTrashClick(blast.id, index) }} />

            ]
        }))
    }, [blastsPrivate])


    return (
        <div className='blastsTable'>
            <GenericTable th={th} tr={tr} loading={loadingBlastsPrivate} navigation={true} nextPage={() => { }} lastPage={() => { }} rowsNum={10} resaultsNum={privateMeetingsNum} />
        </div>
    );
}

export default BlastsPrivateTable