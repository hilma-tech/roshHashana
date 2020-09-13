import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import GenericTable from './GenericTable'
import DeletePopup from '../popups/DeletePopup';
import { deleteIsolated } from '../fetch_and_utils';
import { withRouter } from 'react-router';
// import '../styles/staffList.scss'
// import Loading from '../Loading';

const whereToDelete = { id: -1, index: -1 }

const IsolatedTable = (props) => {
    const { loading, isolateds, setIsolateds } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)
    const [showDeletePopup, setShowDeletePopup] = useState(false)

    const th = [['name', 'שם'], ['phone', 'פלאפון'], ['address', 'כתובת'], props.haveMeeting ? ['shofarBlowerName', 'שם בעל התוקע'] : ['',''], ['road tableIcons', ''], !props.haveMeeting ?['location tableIcons', ''] : ['', ''], ['delete tableIcons', '']]

    useEffect(() => {
        if (isolateds) setTr(isolateds.map((isolated, index) => {
            return [
                isolated.name,
                isolated.phone,
                isolated.address || '*משתמש ציבורי*',
                props.haveMeeting && isolated.shofarBlowerName,
                isolated.comments && <div className='tooltipContainer'>
                    <FontAwesomeIcon icon='comment' color='#A5A4BF' />
                    <div className='myTooltip'>{isolated.comments}</div>
                </div>,
                !props.haveMeeting && <FontAwesomeIcon className='pointer' icon={['fas', 'map-marker-alt']} color='#A5A4BF' onClick={() => handleIsolatorClick(isolated)} />,
                <FontAwesomeIcon className='pointer' icon={['fas', 'trash']} color='#A5A4BF' onClick={() => handleTrashClick(isolated.isolatedId, index)} />,
            ]
        }))
    }, [isolateds])



    const handleTrashClick = (id, index) => {
        setShowDeletePopup(true)
        whereToDelete.id = id
        whereToDelete.index = index
    }

    const handleDelete = () => {
        (async () => {
            await deleteIsolated(whereToDelete.id, (err) => {
                if (!err) {
                    setIsolateds(prev => {
                        prev.splice(whereToDelete.index, 1)
                        return [...prev]
                    })
                    setShowDeletePopup(false)
                }
            })
        })()
    }

    const setPage = (page) => {
        props.getIsolateds(null, (page - 1) * 7)
    }

    const handleIsolatorClick = (isolator) => {
        typeof props.setSelectedIsolator === "function" && props.setSelectedIsolator(isolator)
        props.history.push("/skerdsgfkjs9889cdfcis596jtrgd7yfuszygs/searcher")
    }

    return (
        <div className='isolatedTable'>
            <GenericTable th={th} tr={tr} loading={loading} navigation={true} nextPage={setPage} prevPage={setPage} rowsNum={7} resaultsNum={props.resultNum} />

            {showDeletePopup &&
                <DeletePopup
                    okayText="מחק"
                    name='מחפש/ת'
                    handleDismiss={() => setShowDeletePopup(false)}
                    handleDelete={() => handleDelete()}
                />
            }
        </div>
    );
}

export default withRouter(IsolatedTable)