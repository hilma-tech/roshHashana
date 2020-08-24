import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import { deleteIsolated } from '../fetch_and_utils';
import GenericTable from './GenericTable'
// import '../styles/staffList.scss'
// import Loading from '../Loading';

const ShofarBlowerTable = (props) => {
    const { loading, shofarBlowers, setShofarBlowers } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)

    const th = [['confrim', ''], ['name', 'שם'], ['phone', 'פלאפון'], ['address', 'נקודת יציאה'], ['blastsNum', 'תקיעות בשופר'], ['maxTime', 'זמן מקסימלי'], ['road tableIcons', ''], ['edit tableIcons', ''], ['delete tableIcons', '']]


    useEffect(() => {
        if (shofarBlowers) setTr(shofarBlowers.map((shofarBlower, index) => {
            return [
                <div className='circleCheckBox pointer'></div>,
                shofarBlower.name,
                shofarBlower.username,
                shofarBlower.address,
                shofarBlower.blastsNum,
                shofarBlower.volunteering_max_time,
                <img src='/icons/way.svg' alt='way' className='pointer' onClick={handleRoadClick} style={{ height: '2.5vh' }} />,
                <FontAwesomeIcon className='pointer' icon={['fas', 'pen']} color='#A5A4BF' onClick={handleEditClick} />,
                <FontAwesomeIcon className='pointer' icon={['fas', 'trash']} color='#A5A4BF' onClick={() => handleTrashClick(shofarBlower.id, index)} />
            ]
        }))
    }, [shofarBlowers])

    const handleRoadClick = (e) => {

    }

    const handleEditClick = (e) => {

    }

    const handleTrashClick = (id, index) => {
        (async () => {
            // await deleteIsolated(id, (err, res) => {
            //     if (!err) {
            //         let newShofarBlowers = [...shofarBlowers]
            //         newShofarBlowers.splice(index, 1)
            //         setShofarBlowers(newShofarBlowers)
            //     }
            // })
        })()

    }

    return (
        <div className='isolatedTable'>
            <GenericTable th={th} tr={tr} loading={loading} navigation={true} nextPage={() => { }} lastPage={() => { }} columnNum={10} resaultsNum={props.resultNum} />
        </div>
    );
}

export default ShofarBlowerTable