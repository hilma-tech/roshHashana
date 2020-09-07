import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import { MainContext } from '../../../ctx/MainContext';
import { setConfirmShofarBlower, deleteShofarBlower } from '../fetch_and_utils';
import GenericTable from './GenericTable'
import DeletePopup from '../popups/DeletePopup';

const whereToDelete = { id: -1, index: -1 }

const ShofarBlowerTable = (props) => {
    const { loading, shofarBlowers, setShofarBlowers, setBlowerNum, setBlastsNum, setShofarBlowerIdToEdit } = useContext(AdminMainContext)
    const { openGenAlert } = useContext(MainContext)
    const [tr, setTr] = useState(null)
    const [confirmArr, setConfirmArr] = useState([])
    const [showDeletePopup, setShowDeletePopup] = useState(false)

    let setSelectedSB = props.setSelectedSB
    let selectedSB = props.selectedSB

    const th = [shofarBlowers && shofarBlowers.length ? ['confrim', ''] : null, ['name', 'שם'], ['phone', 'פלאפון'], ['address', 'נקודת יציאה'], ['blastsNum', 'תקיעות בשופר'], ['maxTime', 'זמן מקסימלי'], ['road tableIcons', ''], ['edit tableIcons', ''], ['delete tableIcons', '']]


    useEffect(() => {
        if (shofarBlowers) setTr(shofarBlowers.map((shofarBlower, index) => {
            return [
                props.status === 0 ?
                    !confirmArr.includes(shofarBlower.id) ?
                        <div className='circleCheckBox pointer' onClick={() => confirmClicked(shofarBlower.id)}></div> :
                        <FontAwesomeIcon icon={['fas', 'check-circle']} className='checkedCircle' />
                    : null,
                shofarBlower.name,
                shofarBlower.username,
                shofarBlower.address,
                shofarBlower.blastsNum,
                shofarBlower.volunteering_max_time + " דק'",
                props.status === 0 ? null : <img src='/icons/way.svg' alt='way' className='pointer' onClick={() => { handleRouteClick(shofarBlower) }} style={{ height: '2.5vh' }} />,
                <FontAwesomeIcon className='pointer' icon={['fas', 'pen']} color='#A5A4BF' onClick={() => handleEditClick(shofarBlower.id)} />,
                <FontAwesomeIcon className='pointer' icon={['fas', 'trash']} color='#A5A4BF' onClick={() => handleTrashClick(shofarBlower.id, index)} />
            ]
        }))
    }, [shofarBlowers, confirmArr])

    const confirmClicked = (id) => {
        setConfirmArr(prev => [...prev, id])

        setTimeout(() => {
            let indexToConfirm = shofarBlowers.findIndex(i => i.id == id)
            let sbToConfirm = shofarBlowers.find(i => i.id == id)
            if ((!indexToConfirm && indexToConfirm != 0) || (!sbToConfirm)) return;
            setConfirmShofarBlower(sbToConfirm.id, (err) => {
                if (!err) setShofarBlowers(prev => {
                    prev.splice(indexToConfirm, 1)
                    return [...prev]
                })
                props.setResultNum(n => Number(n) - 1)
                setBlowerNum(prev => prev + 1)
                setBlastsNum(prev => prev + sbToConfirm.blastsNum)
                setConfirmArr(prev => {
                    prev.splice(prev.indexOf(id), 1)
                    return [...prev]
                })
                openGenAlert({ text: "אושר בהצלחה", block: true })
            })
        }, 1000)
    }

    const handleRouteClick = (sb) => {
        props.history && props.history.push && props.history.push("/shofar-blower")
        // console.log('setSelectedSB sb: ', sb);
        setSelectedSB(sb)
    }

    const handleEditClick = (id) => {
        setShofarBlowerIdToEdit(id)
        props.history.push('/edit-shofar-blower')
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
                    props.setResultNum(n => Number(n) - 1)
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