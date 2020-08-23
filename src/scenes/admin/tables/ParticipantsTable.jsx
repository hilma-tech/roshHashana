import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import { getTime, deletePublicMeeting } from '../fetch_and_utils';
import GenericTable from './GenericTable'


const ParticipantsTable = (props) => {
    const { loadingBlastsPub, blastsPub, setBlastInfo } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)

    const th = [['name', 'שם'], ['phone', 'טלפון'], ['delete', '']]

    

    const handleTrashClick = (id) => {
        (async () => {
           
        })()
    }

    useEffect(() => {
        if (blastsPub) setTr(blastsPub.map(blast => {
            return [
                blast.blowerName,
                blast.phone,
                <FontAwesomeIcon className="pointer" icon={['fas', 'trash']} color='#156879' onClick={() => { handleTrashClick(blast.id) }} />
            ]
        }))
    }, [blastsPub])


    return (
        <div className='blastsTable'>
            <GenericTable th={th} tr={tr} loading={loadingBlastsPub} navigation={true} nextPage={() => { }} lastPage={() => { }} />
        </div>
    );
}

export default ParticipantsTable