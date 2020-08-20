import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import { getTime } from '../fetch_and_utils';
import GenericTable from './GenericTable'


const BlastsTable = (props) => {
    const { loadingBlastsPub, blastsPub } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)

    const th = [['name', 'בעל התוקע'], ['phone', 'סוג התקיעה'], ['address', 'כתובת'],['time', 'שעה משוערת'], ['info', ''], ['delete', '']]

    const handleInfoClick = (e) => {

    }

    const handleTrashClick = (e) => {

    }

    useEffect(() => {
        if (blastsPub) setTr(blastsPub.map(isolated => {
            return [
                isolated.blowerName,
                "ציבורית",
                isolated.address,
                getTime(isolated.start_time),
                <FontAwesomeIcon icon={['fas', 'info-circle']} color='#A5A4BF' onClick={handleInfoClick} />,
                <FontAwesomeIcon icon={['fas', 'trash']} color='#A5A4BF' onClick={handleTrashClick} />

            ]
        }))
    }, [blastsPub])


    return (
        <div className='blastsTable'>
            <GenericTable th={th} tr={tr} loading={loadingBlastsPub} navigation={true} nextPage={() => { }} lastPage={() => { }} />
        </div>
    );
}

export default BlastsTable