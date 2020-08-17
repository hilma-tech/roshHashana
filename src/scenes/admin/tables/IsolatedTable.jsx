import React, { useEffect, useState, useContext } from 'react';
import { AdminMainContext } from '../ctx/AdminMainContext';
import GenericTable from './GenericTable'
// import '../styles/staffList.scss'
// import Loading from '../Loading';

const IsolatedTable = (props) => {
    const { loading, setLoading, isolateds, setIsolateds } = useContext(AdminMainContext)
    const [tr, setTr] = useState(null)

    const th = [['name', 'שם'], ['phone', 'פלאפון'], ['address', 'כתובת'], ['info', ''], ['delete', '']]

    useEffect(() => {
        (async () => {
            if (isolateds) setTr(isolateds.map(isolated => {
                return [
                    isolated.name,
                    isolated.phone,
                    isolated.address,
                    null,
                    null
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
        })()
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
        <div className='classesList'>
            <GenericTable th={th} tr={tr} loading={loading} />
        </div>
    );
}

export default IsolatedTable