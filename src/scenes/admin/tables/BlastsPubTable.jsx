import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import { getTime, deletePublicMeeting } from '../fetch_and_utils';
import GenericTable from './GenericTable'
import '../styles/table.scss'


const BlastsPubTable = (props) => {
    const { loadingBlastsPub, blastsPub, setBlastInfo, pubMeetingsNum } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)

    const th = [['name', 'בעל התוקע'], ['phone', 'סוג התקיעה'], ['address', 'כתובת'], ['time', 'שעה משוערת'], ['info infoPub tableIcons', '']]

    const handleInfoClick = (blast) => {
        blast.type = "ציבורית"
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
                <FontAwesomeIcon className="pointer" style={{ fontSize: "1.7vh", textAlign: "left !important" }} icon={['fas', 'info-circle']} color='#156879' onClick={() => { handleInfoClick(blast) }} />,
                // <FontAwesomeIcon className="pointer" style={{fontSize:"1.7vh"}} icon={['fas', 'trash']} color='#156879' onClick={() => { handleTrashClick(blast.id) }} />

            ]
        }))
    }, [blastsPub])


    return (
        <div className='blastsTable'>
            <GenericTable th={th} tr={tr} loading={loadingBlastsPub} navigation={true} nextPage={() => { }} lastPage={() => { }} columnNum={10} resaultsNum={pubMeetingsNum} />
        </div>
    );
}

export default BlastsPubTable