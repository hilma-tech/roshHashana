import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import { getTime, deletePublicMeeting } from '../fetch_and_utils';
import GenericTable from './GenericTable'


const ParticipantsTable = (props) => {
    const { loadingBlastsPub, participantsPublicMeeting } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)

    const th = [['name', 'שם'], ['phone', 'טלפון'], ['delete', '']]



    const handleTrashClick = (id) => {
        (async () => {

        })()
    }

    useEffect(() => {

        if (participantsPublicMeeting) {
            setTr(participantsPublicMeeting.map(participant => {
                return [
                    participant.name,
                    participant.phone,
                    <FontAwesomeIcon className="pointer" icon={['fas', 'trash']} color='#156879' onClick={() => { handleTrashClick(participant.id) }} />
                ]
            }))
        }
    }, [participantsPublicMeeting])


    return (
        <div className='blastsTable'>
            <GenericTable th={th} tr={tr} loading={loadingBlastsPub} navigation={false} />
        </div>
    );
}

export default ParticipantsTable