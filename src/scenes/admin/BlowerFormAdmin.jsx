import React, { Fragment, Component, useContext } from 'react';
import { FormSearchBoxGenerator } from '../../components/maps/search_box_generator';
import AddPublicPlace from '../../components/addPublicPlace/AddPublicPlace';
import { updateSBDetails, checkDateBlock } from '../../fetch_and_utils';
// import GeneralAlert from '../../components/modals/general_alert';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { BrowserView, isBrowser } from "react-device-detect";
import { CONSTS } from '../../consts/const_messages';
import { ThemeProvider } from "@material-ui/styles";
// import { MainContext } from '../../ctx/MainContext';
import { AdminMainContext } from './ctx/AdminMainContext';
import { createMuiTheme } from "@material-ui/core";
import { TimePicker } from '@material-ui/pickers';
import Slider from '@material-ui/core/Slider';
import Auth from '../../modules/auth/Auth';
import MomentUtils from '@date-io/moment';
import '../detailsForm/detailsForm.scss';
import { useState } from 'react';
import { useEffect } from 'react';
import { getShofarBlowerByIdAdmin } from './fetch_and_utils';

const materialTheme = createMuiTheme({
    overrides: {
        MuiPickersToolbar: {
            toolbar: {
                backgroundColor: "#16697a",
                direction: "ltr"
            },
        },
        MuiPickersTimePickerToolbar: {
            toolbarAmpmLeftPadding: {
                direction: "ltr"
            }
        },
    },
    palette: {
        primary: { main: "#16697a" }
    }
});

const format = 'HH:mm';

export default function BlowerFormAdmin(props) {
    // const { showAlert } = useContext(MainContext)
    const { shofarBlowerIdToEdit, setShofarBlowerIdToEdit } = useContext(AdminMainContext)

    const [errorMsg, setErrorMsg] = useState('')
    const [publicMeetErr, setPublicMeetErr] = useState('')
    const [addressErr, setAddressErr] = useState('')
    const [nameErr, setNameErr] = useState('')
    const [phoneErr, setPhoneErr] = useState('')
    const [numOfBlowErr, setNumOfBlowErr] = useState('')
    const [name, setName] = useState('') //the name of the shofar blower
    const [phone, setPhone] = useState('') //the phone of the shofar blower
    const [blastsNum, setBlastsNum] = useState('') //the number of the blasts of the shofar blower
    const [address, setAddress] = useState('') //the address of the shofar blower
    const [chosenTime, setChosenTime] = useState(null) //the start time the shofar blower wants to start his volunteering
    const [openPublicMeetingOptions, setOpenPublicMeetingOptions] = useState(false) // open or close the public meeting options form
    const [publicPlaces, setPublicPlaces] = useState([]) //a list of all the public places that the shofar blower added,
    const [walkTime, setWalkTime] = useState(-15) //the total time the shofar blower wants to walk

    useEffect(() => {
        (async () => {
            if (props.location.pathname === '/edit-shofar-blower' && !shofarBlowerIdToEdit) props.history.goBack()
            else if (shofarBlowerIdToEdit) {
                await getShofarBlowerByIdAdmin(shofarBlowerIdToEdit, (err, res) => {
                    if (!err) {
                        console.log(res)
                        setName(res.name)
                        setPhone(res.phone)
                        setBlastsNum(Number(res.blastsNum))
                        setAddress(res.address)
                        setChosenTime(res.chosenTime)
                        if (res.publicPlaces.length > 0) {
                            setOpenPublicMeetingOptions(true)
                            setPublicPlaces(res.publicPlaces)
                        }
                    }
                })
            }
        })()

        return () => {
            setShofarBlowerIdToEdit(null)
        }
    }, [])
    //update the start time the shofar blower wants to start his volunteering
    const changeChosenTime = (time) => {
        setChosenTime(time._d)
    }

    //open or close the public meeting options
    const changeShowMeetingOptions = (e) => {
        if (e.target.id === "no" && publicPlaces.length > 1) {
            setPublicPlaces([{}])
        }
        setOpenPublicMeetingOptions(prev => !prev)
    }

    //update the public meeting that the shofar blower added
    const updatePublicPlace = (index, keyName, publicPlaceVal) => {
        let value;
        if (keyName === 'time') {
            value = new Date(publicPlaceVal);
            value.setFullYear(2020, 8, 20);
        } else value = publicPlaceVal;

        setPublicPlaces(prev => {
            prev[index][keyName] = value
            return [...prev]
        })
    }

    //create another public place
    const addPublicPlace = () => {
        if (publicPlaces.length < 4) {
            setPublicPlaces(prev => {
                prev.push({ id: prev.length })
                return [...prev]
            })
        }
        else setPublicMeetErr('מועד התקיעה מתקרב, לא ניתן להוסיף עוד תקיעות ציבוריות ');
    }

    //remove the public meeting
    const removePubPlace = (index) => {
        setPublicPlaces(prev => {
            prev.splice(index, 1)
            return [...prev]
        })

        if (publicPlaces.length < 4) {
            setPublicMeetErr('');
        }
    }

    //update name time
    const handleNameChange = (event) => {
        if (event.target.value.length < 20)
            setName(event.target.value)
    }

    //update phone time
    const handlePhoneChange = (event) => {
        if (event.target.value.length < 11 && !isNaN(event.target.value) && event.target.value != "." && event.target.value != "-" && event.target.value != "+" && event.target.value != "e")
            setPhone(event.target.value)
    }

    const handleBlastsNumChange = (event) => {
        if (event.target.value.length < 3 && !isNaN(event.target.value) && event.target.value != "." && event.target.value != "-" && event.target.value != "+" && event.target.value != "e")
            setBlastsNum(event.target.value)
    }

    //update walk time
    const handleWalkTImeChange = (event, newValue) => {
        setWalkTime(newValue)
    }

    const handleAddressChange = (address) => {
        setAddress(address)
    }

    const checkForMissingDataInPublicPlaces = async () => {
        if (!publicPlaces || !Array.isArray(publicPlaces) || !publicPlaces.length) return true
        for (let i in publicPlaces) {
            if (publicPlaces[i].comments && publicPlaces[i].comments.length && !/^[A-Zא-תa-z 0-9'"-]{1,}$/.test(publicPlaces[i].comments)) {
                setPublicMeetErr('לא ניתן להכניס תווים מיוחדים בתיאור')
                return false;
            }
            else {
                if (!publicPlaces[i].address || !Array.isArray(publicPlaces[i].address) || !publicPlaces[i].time) {
                    setPublicMeetErr('אנא מלא את כל הפרטים (כתובת וזמן פגישה)')
                    return false;
                } else if (!Array.isArray(publicPlaces[i].address) || publicPlaces[i].address.length !== 2 || publicPlaces[i].address[0] === CONSTS.NOT_A_VALID_ADDRESS || !publicPlaces[i].address[1] || !publicPlaces[i].address[1].lng || !publicPlaces[i].address[1].lat) {
                    setPublicMeetErr('אנא בחר מיקום מהרשימה הנפתחת בתקיעות הציבוריות')
                    return false;
                } else setPublicMeetErr('')
            }
        }
        return true;
    }

    const handleKeyPress = (e) => {
        const key = e.charCode || e.keyCode || 0;
        if (key == 13) {
            e.preventDefault();
            return;
        }
    }

    //save all shofar blower details including public places
    const saveShofarBlowerDetails = async (e) => {
        e.preventDefault();

        const formChilds = e.target.children;

        if (!name || !name.length || !phone || !phone.length || !blastsNum || !chosenTime || !address || !address.length) {
            setErrorMsg('אנא מלא את כל הפרטים')
            return;
        }
        else setErrorMsg('')
        if (name.length < 2 || !/^[א-תa-z '"-]{2,}$/.test(name)) {
            setNameErr('השם צריך להכיל אותיות בלבד')
            return;
        }
        if (phone.length < 10 || phone && phone[0] != 0) {
            setPhoneErr('מספר פלאפון לא תקין')
            return;
        }
        if (blastsNum > 20 || blastsNum.length > 2) { // check can_blow_x_times value
            setNumOfBlowErr('לא ניתן לבצע תקיעת שופר יותר מ-20 פעמים')
            return;
        }
        else if (blastsNum < 1) {
            setNumOfBlowErr('יש לבצע תקיעת שופר לפחות פעם אחת')
            return;
        } else setNumOfBlowErr('')

        // check address
        if (!Array.isArray(address) || !address.length) {
            setAddressErr('אנא הכנס מיקום')
            return;
        }
        else if (!address[0] || address[0] === CONSTS.NOT_A_VALID_ADDRESS || typeof address[1] !== "object" || !address[1].lng || !address[1].lat) {
            setAddressErr('נא לבחור מיקום מהרשימה הנפתחת')
            return;
        } else setAddressErr('')

        //startTime
        let startTime = new Date(chosenTime);
        startTime.setFullYear(2020, 8, 20);


        let success = await checkForMissingDataInPublicPlaces();
        if (!success) {
            return;
        }
        let blowerDetails = {
            "can_blow_x_times": blastsNum,
            "volunteering_start_time": startTime,
            "volunteering_max_time": Math.abs(walkTime),//endTime,
            "address": address,
            "publicPlaces": publicPlaces
        }
        setErrorMsg('')
        setPhoneErr('')
        setAddressErr('')
        setNumOfBlowErr('')

        let [cuRes, duErr] = await Auth.superAuthFetch('/api/CustomUsers/' + (true ? 'createUser' : 'editUser'), {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ phone: phone, name: name, role: 2 })
        }, true);
        if (duErr || !cuRes) {
            return duErr === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר"
        }

        blowerDetails.userId = cuRes.id
        //update shofar blower details
        let [res, error] = await Auth.superAuthFetch(`/api/shofarBlowers/` + (true ? 'InsertDataShofarBlowerAdmin' : 'editDataShofarBlowerAdmin'), {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ data: blowerDetails })
        }, true);
        if (!error) {
            props.history.goBack()
        }
        else if (res) {
            setErrorMsg(typeof error === "string" ? error : 'אירעה שגיאה בעת ההרשמה, נא נסו שנית מאוחר יותר, תודה')
        }
    }

    // const { showAlert } = this.context;
    // var input = document.getElementById('locationTextField');
    // var autocomplete = new google.maps.places.Autocomplete(input);


    return (
        <div id="isolated-form-container">

            <div className="form-container" style={{ width: isBrowser ? '40%' : '100%' }}>
                <img id="go-back" alt="" className="clickAble" src="/icons/go-back.svg" onClick={props.history.goBack} />
                <div className="msg-txt header">{!shofarBlowerIdToEdit ? 'בעל תוקע חדש' : 'עריכת בעל תוקע'}</div>

                <form onSubmit={saveShofarBlowerDetails} onKeyPress={handleKeyPress}>

                    {/* shofar blowing name input */}
                    <div className="title">שם מלא</div>
                    <input type="text" placeholder={"נא להזין שם מלא"} value={name} onChange={handleNameChange} autoComplete={'off'} />
                    <div className="err-msg ">{nameErr}</div>

                    {/* shofar blowing phone input */}
                    <div className="title">מספר פלאפון</div>
                    <input type="tel" placeholder={"נא להזין מספר טלפון נייד"} value={phone} onChange={handlePhoneChange} />
                    <div className="err-msg ">{phoneErr}</div>

                    {/* shofar blowing times input */}
                    <div className="title">כמה פעמים יהיה מוכן לתקוע בשופר באזורו?</div>
                    <input type="number" value={blastsNum} onChange={handleBlastsNumChange} />
                    <div className="err-msg ">{numOfBlowErr}</div>

                    {/* start time input */}
                    <div className="title">שעת יציאה</div>
                    <div id="comment">ניתן לערוך את שעת התקיעה עד ליום רביעי, כ"ז באלול 16.9 בשעה 24:00</div>
                    <ThemeProvider theme={materialTheme}>
                        <MuiPickersUtilsProvider utils={MomentUtils}>
                            <Fragment>
                                <TimePicker
                                    placeholder="שעה"
                                    ampm={false}
                                    value={chosenTime}
                                    onChange={changeChosenTime}
                                    format={format}
                                />
                            </Fragment>
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>

                    {/* address inputs */}
                    <div className="title">מה הכתובת ממנה הוא יוצא?</div>
                    <div id="comment">נא לרשום את הכתובת המלאה</div>
                    <FormSearchBoxGenerator onAddressChange={handleAddressChange} uId='form-search-input-1' defaultValue={address} />
                    <div className="err-msg ">{addressErr}</div>

                    {/* walk time slider */}
                    <div className="walk-time title">סמן את זמן ההליכה</div>
                    <Slider track="inverted" value={walkTime} min={-180} max={-15} onChange={handleWalkTImeChange} aria-labelledby="continuous-slider" />
                    <div id="max-time-div">{`עד ${Math.abs(walkTime)} דקות`}</div>

                    {/* public meeting or not */}
                    <div className="title">האם ישנו מקום ציבורי בו אתה תוקע ואנשים נוספים יכולים להצטרף לתקיעה?</div>
                    <div className="checkbox-container">
                        <div>כן</div>
                        <input id="yes" className="clickAble" type="radio" name="isPublicMeeting" onChange={changeShowMeetingOptions} checked={openPublicMeetingOptions} />
                    </div>

                    {/* Public Meeting Options */}
                    {openPublicMeetingOptions &&
                        <div className="public-meeting-options">
                            {publicPlaces && publicPlaces.map((place, index) => {
                                return <AddPublicPlace
                                    key={"k" + place.id}
                                    removePubPlace={removePubPlace}
                                    index={index}
                                    format={format}
                                    updatePublicPlace={updatePublicPlace}
                                    info={place}
                                />
                            })}
                            <div id="add-public-place" className="clickAble" onClick={addPublicPlace}>
                                <div id="plus">+</div>
                                <div id="add-public-place-button">הוסף מקום ציבורי</div>
                            </div>
                            <div className="err-msg ">{publicMeetErr}</div>
                        </div>}

                    <div className="checkbox-container">
                        <div>לא</div>
                        <input id="no" className="clickAble" type="radio" name="isPublicMeeting" onChange={(e) => changeShowMeetingOptions(e)} checked={!openPublicMeetingOptions} />
                    </div>

                    <div className="err-msg ">{errorMsg}</div>
                    <input type="submit" className="increase-padding" value="שמור" />
                </form>
            </div>

            <BrowserView style={{ position: 'absolute', left: '0', width: '60%', height: '100%', top: '0' }}>
                <img id="shofar-img" alt="" src="/icons/shofar.png" />
            </BrowserView>
            {/* {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null} */}
        </div>
    );

}