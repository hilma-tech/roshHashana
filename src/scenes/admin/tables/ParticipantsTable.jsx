import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import { deleteConectionToMeeting } from '../fetch_and_utils';
import GenericTable from './GenericTable'


const ParticipantsTable = (props) => {
    const { loadingBlastsPub, participantsPublicMeeting, setParticipantsPublicMeeting } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)

    const th = [['name', 'שם'], ['phone', 'טלפון'], ['delete', '']]



    const handleTrashClick = (id, index) => {
        (async () => {
            await deleteConectionToMeeting(id, (err, res) => {
                console.log(err, res)
                if (!err) {
                    let newParticipantsPublicMeeting = [...participantsPublicMeeting]
                    newParticipantsPublicMeeting.splice(index, 1)
                    setParticipantsPublicMeeting(newParticipantsPublicMeeting)
                }
            })

        })()
    }

    const setPage = (page) => {
        props.getParticipants(props.filters, (page - 1) * 7)
    }

    useEffect(() => {

        if (participantsPublicMeeting) {
            console.log(participantsPublicMeeting)
            setTr(participantsPublicMeeting.map((participant, index) => {
                return [
                    participant.name,
                    participant.phone,
                    participant.role !==1 &&<FontAwesomeIcon className="pointer trash" icon={['fas', 'trash']} color='#156879' onClick={() => { handleTrashClick(participant.idIsolated, index) }} />
                ]
            }))
        }
    }, [participantsPublicMeeting])


    return (
        <div className='blastsTable'>
            <GenericTable th={th} tr={tr} loading={loadingBlastsPub} nextPage={setPage} prevPage={setPage} navigation={false} />
        </div>
    );
}

export default ParticipantsTable