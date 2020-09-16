import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormSearchBoxGenerator } from '../../components/maps/search_box_generator';
import './styles/sideInfo.scss'
import './styles/sideInfoPrev.scss'
import Auth from '../../modules/auth/Auth';
import { AdminMainContext } from './ctx/AdminMainContext';
import { CONSTS } from '../../consts/const_messages';

const IsolatedInfo = (props) => {
    const { setIsolateds, selectedIsolator } = useContext(AdminMainContext)

    const [loading, setLoading] = useState(false)
    const [address, setAddress] = useState('')
    const [addressErr, setAddressErr] = useState('')
    const [comments, setComments] = useState('')

    useEffect(() => {
        if (selectedIsolator) {
            setAddress(selectedIsolator.address || '')
            setComments(selectedIsolator.comments || '')
        }
    }, [selectedIsolator])
    const handleAddressChange = (address) => {
        setAddress(address)
    }

    const handleSave = async () => {
        if (address === selectedIsolator.address && comments === selectedIsolator.comments) return

        let data = {}
        if (address !== selectedIsolator.address) {
            if (!Array.isArray(address) || !address.length) {
                setAddressErr('אנא הכנס מיקום')
                return;
            }
            if (!address[0] || address[0] === CONSTS.NOT_A_VALID_ADDRESS || typeof address[1] !== "object" || !address[1].lng || !address[1].lat) {
                setAddressErr('נא לבחור מיקום מהרשימה הנפתחת')
                return;
            }
            data.address = address
        }
        setAddressErr('')
        if (comments !== selectedIsolator.comments) {
            data.comments = comments
        }

        let [res, error] = await Auth.superAuthFetch(`/api/CustomUsers/updateIsolatedAdmin`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ userId: selectedIsolator.id, data, isPublicMeeting: Boolean(selectedIsolator.isPublicMeeting) })
        }, true);
        if (!res) {
            setAddressErr(typeof error === "string" ? error : 'אירעה שגיאה בעת ההרשמה, נא נסו שנית מאוחר יותר, תודה')
        }
        else {
            
                setIsolateds(prevIsolateds => prevIsolateds.map(i => {
                    if (i.id === selectedIsolator.id){
                        if (address !== selectedIsolator.address) i.address = address[0]
                        if (comments !== selectedIsolator.comments) i.comments = comments
                    } 
                    return i
                }))
            
        }
    }

    if (selectedIsolator) return (
        <div className="sideInfo">
            <div className="flexContainer leftdives" style={{ marginBottom: '5vh' }}>
                <div className="bold fonttkia">פרטי מחפש</div>
            </div>
            <div className="flexRow">
                <div className="width25">
                    <img className="icon" src="/icons/peopleBlue.svg" />
                </div>
                <div className="width75">
                    <div className="info">{selectedIsolator.name}</div>
                    <div className="info">{selectedIsolator.phone}</div>
                </div>
            </div>
            <div className="flexRow">
                <div className="width25">
                    <FontAwesomeIcon icon='comment' color='#A5A4BF' />
                </div>
                <div className="width75">
                    <input className="info comments"
                        type='text'
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        required />
                </div>
            </div>
            <div className="flexRow">
                <div className="width25">
                    <img className="icon" style={{ width: "2.4vh" }} src="/icons/location.svg" />
                </div>
                <div>
                    <FormSearchBoxGenerator onAddressChange={handleAddressChange} uId='form-search-input-1' defaultValue={Array.isArray(address) && address.length > 0 ? address[0] : address} />
                    <div className="err-msg ">{addressErr}</div>
                </div>
            </div>
            <div className="bottomToList pointer" style={{ margin: 'auto' }} onClick={handleSave}>שמור</div>
        </div>
    );
    else return (
        <div className="sideInfoPrev">
            <img className="iconInfo" src="/icons/peopleBlue.svg" />
            <div className="textInfo">פרטי מחפש</div>
        </div>
    )
}

export default IsolatedInfo