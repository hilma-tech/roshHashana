import React, { useEffect, useContext } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import { fetchIsolateds } from './fetch_and_utils';
import IsolatedTable from './tables/IsolatedTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './styles/generalAdminStyle.scss'

const IsolatedPage = (props) => {
    const { setLoading, setIsolateds } = useContext(AdminMainContext)

    useEffect(() => {
        (async () => {
            setLoading(true)
            await fetchIsolateds({ start: 0, end: 10 }, '', (err, res) => {
                console.log(err, res)
                setLoading(false)
                if (!err) setIsolateds(res)
            })
        })()
    }, [])

    return (
        <div className='isolatedsContainer' style={{ padding: '0 10vw' }}>
            <div className='inputContainer' >
                <input placeholder='חיפוש שם או כתובת' />
                {true ?
                    <FontAwesomeIcon icon={['fas', 'search']} className='inputIcon' /> :
                    <FontAwesomeIcon icon={['fas', 'times']} className='inputIcon' />
                }
            </div>
            <IsolatedTable />
        </div>
    );
}

export default IsolatedPage