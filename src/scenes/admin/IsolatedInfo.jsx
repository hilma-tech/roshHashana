import React, { useCallback, useContext, useState } from 'react';
import { FormSearchBoxGenerator } from '../../components/maps/search_box_generator';
import './styles/sideInfo.scss'
import './styles/sideInfoPrev.scss'
import Auth from '../../modules/auth/Auth';
import { AdminMainContext } from './ctx/AdminMainContext';
import { CONSTS } from '../../consts/const_messages';

const IsolatedInfo = (props) => {
    const { setIsolateds, selectedIsolator, setSelectedIsolator } = useContext(AdminMainContext)

    const [loading, setLoading] = useState(false)
    const [addressErr, setAddressErr] = useState('')

    const handleAddressChange = (address) => {
        setSelectedIsolator(prevIsolator => {
            prevIsolator.address = address
            return prevIsolator
        })
    }

    const handleSave = async () => {
        if (!Array.isArray(selectedIsolator.address) || !selectedIsolator.address.length) {
            setAddressErr('אנא הכנס מיקום')
            return;
        }
        if (!selectedIsolator.address[0] || selectedIsolator.address[0] === CONSTS.NOT_A_VALID_ADDRESS || typeof selectedIsolator.address[1] !== "object" || !selectedIsolator.address[1].lng || !selectedIsolator.address[1].lat) {
            setAddressErr('נא לבחור מיקום מהרשימה הנפתחת')
            return;
        }
        setAddressErr('')
        console.log(selectedIsolator)

        let [res, error] = await Auth.superAuthFetch(`/api/CustomUsers/updateIsolatedAddressAdmin`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ userId: selectedIsolator.id, address: selectedIsolator.address, isPublicMeeting: selectedIsolator.isPublicMeeting })
        }, true);
        if (!res) {
            setAddressErr(typeof error === "string" ? error : 'אירעה שגיאה בעת ההרשמה, נא נסו שנית מאוחר יותר, תודה')
        }
        else {
            setIsolateds(prevIsolateds => prevIsolateds.map(i => {
                if (i.id === selectedIsolator.id) i.address = selectedIsolator.address[0]
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
                    <img className="icon" style={{ width: "2.4vh" }} src="/icons/location.svg" />
                </div>
                <div>
                    <FormSearchBoxGenerator onAddressChange={handleAddressChange} uId='form-search-input-1' defaultValue={typeof selectedIsolator.address !== 'string' && selectedIsolator.address.length > 0 ? selectedIsolator.address[0] : selectedIsolator.address} />
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