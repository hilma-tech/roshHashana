import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from '../ctx/AdminMainContext';
import GenericTable from './GenericTable'
// import '../styles/staffList.scss'
// import Loading from '../Loading';

const IsolatedTable = (props) => {
    const { loading, isolateds } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)

    const th = [['name', 'שם'], ['phone', 'פלאפון'], ['address', 'כתובת'], ['info', ''], ['delete', '']]

    const handleInfoClick = (e) => {

    }

    const handleTrashClick = (e) => {

    }

    useEffect(() => {
        if (isolateds) setTr(isolateds.map(isolated => {
            return [
                isolated.name,
                isolated.phone,
                isolated.address,
                <FontAwesomeIcon icon={['fas', 'info-circle']} color='#A5A4BF' onClick={handleInfoClick} />,
                <FontAwesomeIcon icon={['fas', 'trash']} color='#A5A4BF' onClick={handleTrashClick} />
                // <div>
                //     <div className='tooltipContainer'>
                //         <div style={{
                //             WebkitMaskImage: `Url(icons/pen.svg)`,
                //             background: '#747474',
                //             width: '2.5vh',
                //             height: '2.5vh',
                //             WebkitMaskSize: '2.5vh 2.5vh'
                //         }}
                //             className="pointer"
                //             onClick={() => props.history.push('/edit-badge/' + badge.id)}
                //         ></div>
                //         <div className='passwordTooltip'>עריכת תג</div>
                //     </div>
                // </div>
            ]
        }))
    }, [isolateds
        // , allIsolateds
    ])

    // if (props.AdminStore.loading)
    //     return (
    //         <div className='staffList'>
    //             <Loading height="45vh" size="10vh" />
    //         </div>
    //     );
    // else
    return (
        <div className='isolatedTable'>
            <GenericTable th={th} tr={tr} loading={loading} navigation={true} nextPage={() => { }} lastPage={() => { }} />
        </div>
    );
}

export default IsolatedTable