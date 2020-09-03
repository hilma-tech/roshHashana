import React, { useContext, useState, useEffect } from 'react';
import AdminMap from '../../components/maps/adminMap';
// import Map from '../../components/maps/map';
import TopNavBar from "./TopNavBar"
import './AdminHome.scss'
import ConfirmShofarBlower from './popups/ConfirmShofarBlower';
import { AdminMainContext } from './ctx/AdminMainContext';
import { getNumVolunteers, getNumberOfIsolatedWithoutMeeting, getNumberOfMeetings } from './fetch_and_utils';

const AdminHome = (props) => {
    const { showConfirmPopup, setShowConfirmPopup } = useContext(AdminMainContext)
    const [needConfirmNum, setNeedConfirmNum] = useState(null)

    useEffect(() => {
        (async () => {
            if (showConfirmPopup !== false) {
                await getNumVolunteers(false, (err, res) => {
                    if (!err) {
                        if (res === 0) {
                            setShowConfirmPopup(false)
                            return
                        }
                        setShowConfirmPopup(true)
                        setNeedConfirmNum(res)
                    }
                })
            }

        })()
    }, [])



    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <TopNavBar history={props.history}  />
            <AdminMap
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY_SECOND}`}
                loadingElement={<img alt="נטען..." className="loader" src='/images/loader.svg' />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />
            {showConfirmPopup && <ConfirmShofarBlower num={needConfirmNum} handleDismiss={setShowConfirmPopup} goTo={props.history.push} />}
        </div>
    )
}
export default AdminHome;