import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import GenericTable from './GenericTable'
// import '../styles/staffList.scss'
// import Loading from '../Loading';

const IsolatedTable = (props) => {
    const { loading, isolateds } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)

    const th = [['name', 'שם'], ['phone', 'פלאפון'], ['address', 'כתובת'], ['info', ''], ['delete', '']]

    const handleInfoClick = (e) => {

    }

    const handleTrashClick = (e) => {

    }

    useEffect(() => {
        if (isolateds) setTr(isolateds.map(isolated => {
            return [
                isolated.name,
                isolated.phone,
                isolated.address,
                <FontAwesomeIcon className='pointer' icon={['fas', 'info-circle']} color='#A5A4BF' onClick={handleInfoClick} />,
                <FontAwesomeIcon className='pointer' icon={['fas', 'trash']} color='#A5A4BF' onClick={handleTrashClick} />
            ]
        }))
    }, [isolateds])

    return (
        <div className='isolatedTable'>
            <GenericTable th={th} tr={tr} loading={loading} navigation={true} nextPage={() => { }} lastPage={() => { }} columnNum={10} resaultsNum={props.resultNum} />
        </div>
    );
}

export default IsolatedTable