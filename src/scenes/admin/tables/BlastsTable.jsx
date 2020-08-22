import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import { getTime, deletePublicMeeting } from '../fetch_and_utils';
import GenericTable from './GenericTable'
import BlastInfo from '../BlastInfo';


const BlastsTable = (props) => {
    const { loadingBlastsPub, blastsPub, setBlastInfo } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)

    const th = [['name', 'בעל התוקע'], ['phone', 'סוג התקיעה'], ['address', 'כתובת'], ['time', 'שעה משוערת'], ['info', ''], ['delete', '']]

    const handleInfoClick = (blast) => {
        blast.type = "ציבורית"
        blast.start_time = getTime(blast.start_time);
        setBlastInfo(blast)
    }

    const handleTrashClick = (id) => {
        (async () => {
            await deletePublicMeeting(id, (err, res) => {
                console.log(err, res)
            })
        })()
    }

    useEffect(() => {
        if (blastsPub) setTr(blastsPub.map(blast => {
            return [
                blast.blowerName,
                "ציבורית",
                blast.address,
                getTime(blast.start_time),
                <FontAwesomeIcon className="pointer" icon={['fas', 'info-circle']} color='#156879' onClick={() => { handleInfoClick(blast) }} />,
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

export default BlastsTable