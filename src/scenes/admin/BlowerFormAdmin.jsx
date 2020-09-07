import React, { Fragment, Component } from 'react';
import { FormSearchBoxGenerator } from '../../components/maps/search_box_generator';
import AddPublicPlace from '../../components/addPublicPlace/AddPublicPlace';
import { updateSBDetails, checkDateBlock } from '../../fetch_and_utils';
import GeneralAlert from '../../components/modals/general_alert';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { BrowserView, isBrowser } from "react-device-detect";
import { CONSTS } from '../../consts/const_messages';
import { ThemeProvider } from "@material-ui/styles";
import { MainContext } from '../../ctx/MainContext';
import { createMuiTheme } from "@material-ui/core";
import { TimePicker } from '@material-ui/pickers';
import Slider from '@material-ui/core/Slider';
import Auth from '../../modules/auth/Auth';
import MomentUtils from '@date-io/moment';
import '../detailsForm/detailsForm.scss';

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

export default class BlowerFormAdmin extends Component {
    static contextType = MainContext
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: '',
            publicMeetErr: '',
            addressErr: '',
            nameErr: '',
            phoneErr: '',
            numOfBlowErr: '',
            name: '', //the name of the shofar blower
            phone: '', //the phone of the shofar blower
            blastsNum: '', //the number of the blasts of the shofar blower
            address: '', //the address of the shofar blower
            chosenTime: null, //the start time the shofar blower wants to start his volunteering
            openPublicMeetingOptions: false, // open or close the public meeting options form
            publicPlaces: [], //a list of all the public places that the shofar blower added,
            walkTime: -15 //the total time the shofar blower wants to walk
        }
    }

    //update the start time the shofar blower wants to start his volunteering
    changeChosenTime = (time) => {
        this.setState({ chosenTime: time._d });
    }

    //open or close the public meeting options
    changeShowMeetingOptions = (e) => {
        if (e.target.id === "no" && this.state.publicPlaces.length > 1) {
            this.setState({ publicPlaces: [{}] });
        }
        this.setState({ openPublicMeetingOptions: !this.state.openPublicMeetingOptions });
    }

    //update the public meeting that the shofar blower added
    updatePublicPlace = (index, keyName, publicPlaceVal) => {
        let publicPlaces = this.state.publicPlaces;
        // if (keyName === 'comments' && publicPlaceVal && publicPlaceVal.length && !/^[A-Zא-תa-z 0-9'"-]{2,}$/.test(publicPlaceVal)) {
        //     this.setState({ publicMeetErr: 'לא ניתן להכניס תווים מיוחדים בתיאור' });
        //     return;
        // }

        let value;
        if (keyName === 'time') {
            value = new Date(publicPlaceVal);
            value.setFullYear(2020, 8, 20);
        } else value = publicPlaceVal;

        publicPlaces[index][keyName] = value;
        this.setState({ publicPlaces });
    }

    //create another public place
    addPublicPlace = () => {
        if (this.state.publicPlaces.length < 4) {
            let publicPlaces = this.state.publicPlaces;
            publicPlaces.push({ id: this.state.publicPlaces.length });
            this.setState({ publicPlaces });
        }
        else this.setState({ publicMeetErr: 'מועד התקיעה מתקרב, לא ניתן להוסיף עוד תקיעות ציבוריות ' });
    }

    //remove the public meeting
    removePubPlace = (index) => {
        let publicPlaces = this.state.publicPlaces;
        publicPlaces.splice(index, 1);
        this.setState({ publicPlaces });
        if (publicPlaces.length < 4) {
            this.setState({ publicMeetErr: '' });
        }
    }

    //update name time
    handleNameChange = (event) => {
        if (event.target.value.length < 20)
            this.setState({ name: event.target.value })
    }

    //update phone time
    handlePhoneChange = (event) => {
        if (event.target.value.length < 11 && !isNaN(event.target.value) && event.target.value != "." && event.target.value != "-" && event.target.value != "+" && event.target.value != "e")
            this.setState({ phone: event.target.value })
    }

    handleBlastsNumChange = (event) => {
        if (event.target.value.length < 3 && !isNaN(event.target.value) && event.target.value != "." && event.target.value != "-" && event.target.value != "+" && event.target.value != "e")
            this.setState({ blastsNum: event.target.value })
    }

    //update walk time
    handleWalkTImeChange = (event, newValue) => {
        this.setState({ walkTime: newValue });
    }

    handleAddressChange = (address) => {
        this.setState({ address });
    }

    checkForMissingDataInPublicPlaces = async () => {
        let publicPlaces = this.state.publicPlaces;
        if (!publicPlaces || !Array.isArray(publicPlaces) || !publicPlaces.length) return true
        let updateArrInState = false;
        for (let i in publicPlaces) {
            if (publicPlaces[i].comments && publicPlaces[i].comments.length && !/^[A-Zא-תa-z 0-9'"-]{1,}$/.test(publicPlaces[i].comments)) {
                this.setState({ publicMeetErr: 'לא ניתן להכניס תווים מיוחדים בתיאור' });
                return false;
            }
            // if (!publicPlaces[i].address && !publicPlaces[i].time) {
            //     updateArrInState = true;
            //     publicPlaces.splice(i, 1);
            // }
            else {
                if (!publicPlaces[i].address || !Array.isArray(publicPlaces[i].address) || !publicPlaces[i].time) {
                    this.setState({ publicMeetErr: 'אנא מלא את כל הפרטים (כתובת וזמן פגישה)' });
                    return false;
                } else if (!Array.isArray(publicPlaces[i].address) || publicPlaces[i].address.length !== 2 || publicPlaces[i].address[0] === CONSTS.NOT_A_VALID_ADDRESS || !publicPlaces[i].address[1] || !publicPlaces[i].address[1].lng || !publicPlaces[i].address[1].lat) {
                    this.setState({ publicMeetErr: 'אנא בחר מיקום מהרשימה הנפתחת בתקיעות הציבוריות' });
                    return false;
                } else this.setState({ publicMeetErr: '' });
            }
        }
        updateArrInState && this.setState({ publicPlaces });
        return true;
    }

    handleKeyPress = (e) => {
        const key = e.charCode || e.keyCode || 0;
        if (key == 13) {
            e.preventDefault();
            return;
        }
    }

    //save all shofar blower details including public places
    saveShofarBlowerDetails = async (e) => {
        e.preventDefault();
        if (checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
            this.context.openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן יותר להכניס פרטים חדשים', block: true });
            return;
        }

        const formChilds = e.target.children;

        if (!this.state.name || !this.state.name.length || !this.state.phone || !this.state.phone.length || !this.state.blastsNum || !this.state.chosenTime || !this.state.address || !this.state.address.length) {
            this.setState({ errorMsg: 'אנא מלא את כל הפרטים' });
            return;
        }
        else this.setState({ errorMsg: '' });
        if (this.state.name.length < 2 || !/^[א-תa-z '"-]{2,}$/.test(this.state.name)) {
            this.setState({ nameErr: 'השם צריך להכיל אותיות בלבד' });
            return;
        }
        if (this.state.phone.length < 10 || this.state.phone && this.state.phone[0] != 0) {
            this.setState({ phoneErr: 'מספר פלאפון לא תקין' });
            return;
        }
        if (this.state.blastsNum > 20 || this.state.blastsNum.length > 2) { // check can_blow_x_times value
            this.setState({ numOfBlowErr: 'לא ניתן לבצע תקיעת שופר יותר מ-20 פעמים' });
            return;
        }
        else if (this.state.blastsNum < 1) {
            this.setState({ numOfBlowErr: 'יש לבצע תקיעת שופר לפחות פעם אחת' });
            return;
        } else this.setState({ numOfBlowErr: '' });

        // check address
        const { address } = this.state
        if (!Array.isArray(address) || !address.length) {
            this.setState({ addressErr: 'אנא הכנס מיקום' });
            return;
        }
        else if (!address[0] || address[0] === CONSTS.NOT_A_VALID_ADDRESS || typeof address[1] !== "object" || !address[1].lng || !address[1].lat) {
            this.setState({ addressErr: 'נא לבחור מיקום מהרשימה הנפתחת' })
            return;
        } else this.setState({ addressErr: '' });

        //startTime
        let startTime = new Date(this.state.chosenTime);
        startTime.setFullYear(2020, 8, 20);


        let success = await this.checkForMissingDataInPublicPlaces();
        if (!success) {
            return;
        }
        let blowerDetails = {
            "can_blow_x_times": this.state.blastsNum,
            "volunteering_start_time": startTime,
            "volunteering_max_time": Math.abs(this.state.walkTime),//endTime,
            "address": this.state.address,
            "publicPlaces": this.state.publicPlaces
        }
        this.setState({ errorMsg: '', publicMeetErr: '', addressErr: '', numOfBlowErr: '' });

        let [cuRes, duErr] = await Auth.superAuthFetch('/api/CustomUsers/' + (true ? 'createUser' : 'editUser'), {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ phone: this.state.phone, name: this.state.name, role: 2 })
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
            this.props.history.goBack()
        }
        else if (res){
            this.setState({ errorMsg: typeof error === "string" ? error : 'אירעה שגיאה בעת ההרשמה, נא נסו שנית מאוחר יותר, תודה' })
        }
    }

    render() {
        const { showAlert } = this.context;
        // var input = document.getElementById('locationTextField');
        // var autocomplete = new google.maps.places.Autocomplete(input);


        return (
            <div id="isolated-form-container">

                <div className="form-container" style={{ width: isBrowser ? '40%' : '100%' }}>
                    <img id="go-back" alt="" className="clickAble" src="/icons/go-back.svg" onClick={this.props.history.goBack} />
                    <div className="msg-txt header">{true ? 'בעל תוקע חדש' : 'עריכת בעל תוקע'}</div>

                    <form onSubmit={this.saveShofarBlowerDetails} onKeyPress={this.handleKeyPress}>

                        {/* shofar blowing name input */}
                        <div className="title">שם מלא</div>
                        <input type="text" placeholder={"נא להזין שם מלא"} value={this.state.name} onChange={this.handleNameChange} autoComplete={'off'} />
                        <div className="err-msg ">{this.state.nameErr}</div>

                        {/* shofar blowing phone input */}
                        <div className="title">מספר פלאפון</div>
                        <input type="tel" placeholder={"נא להזין מספר טלפון נייד"} value={this.state.phone} onChange={this.handlePhoneChange} />
                        <div className="err-msg ">{this.state.phoneErr}</div>

                        {/* shofar blowing times input */}
                        <div className="title">כמה פעמים יהיה מוכן לתקוע בשופר באזורו?</div>
                        <input type="number" value={this.state.blastsNum} onChange={this.handleBlastsNumChange} />
                        <div className="err-msg ">{this.state.numOfBlowErr}</div>

                        {/* start time input */}
                        <div className="title">שעת יציאה</div>
                        <div id="comment">ניתן לערוך את שעת התקיעה עד ליום רביעי, כ"ז באלול 16.9 בשעה 24:00</div>
                        <ThemeProvider theme={materialTheme}>
                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                <Fragment>
                                    <TimePicker
                                        placeholder="שעה"
                                        ampm={false}
                                        value={this.state.chosenTime}
                                        onChange={this.changeChosenTime}
                                        format={format}
                                    />
                                </Fragment>
                            </MuiPickersUtilsProvider>
                        </ThemeProvider>

                        {/* address inputs */}
                        <div className="title">מה הכתובת ממנה הוא יוצא?</div>
                        <div id="comment">נא לרשום את הכתובת המלאה</div>
                        <FormSearchBoxGenerator onAddressChange={this.handleAddressChange} uId='form-search-input-1' />
                        <div className="err-msg ">{this.state.addressErr}</div>

                        {/* walk time slider */}
                        <div className="walk-time title">סמן את זמן ההליכה</div>
                        <Slider track="inverted" value={this.state.walkTime} min={-180} max={-15} onChange={this.handleWalkTImeChange} aria-labelledby="continuous-slider" />
                        <div id="max-time-div">{`עד ${Math.abs(this.state.walkTime)} דקות`}</div>

                        {/* public meeting or not */}
                        <div className="title">האם ישנו מקום ציבורי בו אתה תוקע ואנשים נוספים יכולים להצטרף לתקיעה?</div>
                        <div className="checkbox-container">
                            <div>כן</div>
                            <input id="yes" className="clickAble" type="radio" name="isPublicMeeting" onChange={this.changeShowMeetingOptions} />
                        </div>

                        {/* Public Meeting Options */}
                        {this.state.openPublicMeetingOptions &&
                            <div className="public-meeting-options">
                                {this.state.publicPlaces && this.state.publicPlaces.map((place, index) => {
                                    return <AddPublicPlace
                                        key={"k" + place.id}
                                        removePubPlace={this.removePubPlace}
                                        index={index}
                                        format={format}
                                        updatePublicPlace={this.updatePublicPlace}
                                    />
                                })}
                                <div id="add-public-place" className="clickAble" onClick={this.addPublicPlace}>
                                    <div id="plus">+</div>
                                    <div id="add-public-place-button">הוסף מקום ציבורי</div>
                                </div>
                                <div className="err-msg ">{this.state.publicMeetErr}</div>
                            </div>}

                        <div className="checkbox-container">
                            <div>לא</div>
                            <input id="no" className="clickAble" type="radio" name="isPublicMeeting" defaultChecked onChange={(e) => this.changeShowMeetingOptions(e)} />
                        </div>

                        <div className="err-msg ">{this.state.errorMsg}</div>
                        <input type="submit" className="increase-padding" value="שמור" />
                    </form>
                </div>

                <BrowserView style={{ position: 'absolute', left: '0', width: '60%', height: '100%', top: '0' }}>
                    <img id="shofar-img" alt="" src="/icons/shofar.png" />
                </BrowserView>
                {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
            </div>
        );
    }
}