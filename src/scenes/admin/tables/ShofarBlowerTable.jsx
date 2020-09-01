import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import { setConfirmShofarBlower, deleteShofarBlower } from '../fetch_and_utils';
import GenericTable from './GenericTable'
import DeletePopup from '../popups/DeletePopup';

const whereToDelete = { id: -1, index: -1 }

const ShofarBlowerTable = (props) => {
    const { loading, shofarBlowers, setShofarBlowers } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)
    const [confirmArr, setConfirmArr] = useState([])
    const [showDeletePopup, setShowDeletePopup] = useState(false)

    const th = [shofarBlowers && shofarBlowers.length ? ['confrim', ''] : null, ['name', 'שם'], ['phone', 'פלאפון'], ['address', 'נקודת יציאה'], ['blastsNum', 'תקיעות בשופר'], ['maxTime', 'זמן מקסימלי'], ['road tableIcons', ''], ['edit tableIcons', ''], ['delete tableIcons', '']]


    useEffect(() => {
        if (shofarBlowers) setTr(shofarBlowers.map((shofarBlower, index) => {
            return [
                props.status === 0 ?
                    !confirmArr.includes(index) ?
                        <div className='circleCheckBox pointer' onClick={() => confirmClicked(index)}></div> :
                        <FontAwesomeIcon icon={['fas', 'check-circle']} className='checkedCircle' />
                    : null,
                shofarBlower.name,
                shofarBlower.username,
                shofarBlower.address,
                shofarBlower.blastsNum,
                shofarBlower.volunteering_max_time + " דק'",
                props.status === 0 ? null : <img src='/icons/way.svg' alt='way' className='pointer' onClick={handleRoadClick} style={{ height: '2.5vh' }} />,
                <FontAwesomeIcon className='pointer' icon={['fas', 'pen']} color='#A5A4BF' onClick={handleEditClick} />,
                <FontAwesomeIcon className='pointer' icon={['fas', 'trash']} color='#A5A4BF' onClick={() => handleTrashClick(shofarBlower.id, index)} />
            ]
        }))
    }, [shofarBlowers, confirmArr])

    const confirmClicked = (index) => {
        setConfirmArr(prev => [...prev, index])

        setTimeout(() => {
            setConfirmArr(prev => {
                prev.splice(prev.indexOf(index), 1)
                return [...prev]
            })
            setConfirmShofarBlower(shofarBlowers[index].id, (err) => {
                if (!err) setShofarBlowers(prev => {
                    prev.splice(index, 1)
                    return [...prev]
                })
            })
        }, 1000)
    }

    const handleRoadClick = (e) => {

    }

    const handleEditClick = (e) => {

    }

    const handleTrashClick = (id, index) => {
        setShowDeletePopup(true)
        whereToDelete.id = id
        whereToDelete.index = index
    }

    const handleDelete = () => {
        (async () => {
            await deleteShofarBlower(whereToDelete.id, (err) => {
                if (!err) {
                    setShofarBlowers(prev => {
                        prev.splice(whereToDelete.index, 1)
                        return [...prev]
                    })
                    setShowDeletePopup(false)
                }
            })
        })()
    }

    const setPage = (page) => {
        props.getShofarBlowers(null, (page - 1) * 7)
    }

    return (
        <div className='shofarBlowerTable'>
            <GenericTable th={th} tr={tr} loading={loading} navigation={true} nextPage={setPage} prevPage={setPage} rowsNum={7} resaultsNum={props.resultNum} />

            {showDeletePopup &&
                <DeletePopup
                    name='מתנדב'
                    handleDismiss={() => setShowDeletePopup(false)}
                    handleDelete={() => handleDelete()}
                />
            }
        </div>
    );
}

export default ShofarBlowerTable