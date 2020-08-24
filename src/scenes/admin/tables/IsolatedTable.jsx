import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import GenericTable from './GenericTable'
import { deleteIsolated } from '../fetch_and_utils';
// import '../styles/staffList.scss'
// import Loading from '../Loading';

const IsolatedTable = (props) => {
    const { loading, isolateds, setIsolateds } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)

    const th = [['name', 'שם'], ['phone', 'פלאפון'], ['address', 'כתובת'], ['info', ''], ['delete', '']]

    const handleInfoClick = (e) => {

    }

    const handleTrashClick = (id, index) => {
        (async () => {
            await deleteIsolated(id, (err, res) => {
                if (!err) {
                    let newIsolateds = [...isolateds]
                    newIsolateds.splice(index, 1)
                    setIsolateds(newIsolateds)
                }
            })

        })()
    }

    useEffect(() => {
        if (isolateds) setTr(isolateds.map((isolated, index) => {
            return [
                isolated.name,
                isolated.phone,
                isolated.address,
                // <img src='images/map.svg' alt='map' style={{ height: '3vh' }} />
                <FontAwesomeIcon className='pointer' icon={['fas', 'info-circle']} color='#A5A4BF' onClick={handleInfoClick} />
                ,
                <FontAwesomeIcon className='pointer' icon={['fas', 'trash']} color='#A5A4BF' onClick={() => handleTrashClick(isolated.id, index)} />
            ]
        }))
    }, [isolateds])

    return (
        <div className='isolatedTable'>
            <GenericTable th={th} tr={tr} loading={loading} navigation={true} nextPage={() => { }} prevPage={() => { }} columnNum={10} resaultsNum={props.resultNum} />
        </div>
    );
}

export default IsolatedTable