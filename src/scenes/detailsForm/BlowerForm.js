import React, { Fragment, Component } from 'react';
import AddPublicPlace from '../../components/addPublicPlace/AddPublicPlace';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { BrowserView, isBrowser } from "react-device-detect";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import { TimePicker } from '@material-ui/pickers';
import Slider from '@material-ui/core/Slider';
import MomentUtils from '@date-io/moment';
import './detailsForm.scss';
import { FormSearchBoxGenerator } from '../../components/maps/search_box_generator';
import { updateSBDetails } from '../../fetch_and_utils';
import { CONSTS } from '../../const_messages';

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

export default class IsolatedForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: '',
            address: '', //the address of the shofar blower
            chosenTime: Date.now(), //the start time the shofar blower wants to start his volunteering
            openPublicMeetingOptions: false, // open or close the public meeting options form
            publicPlaces: [{}], //a list of all the public places that the shofar blower added,
            walkTime: 15 //the total time the shofar blower wants to walk
        }
    }

    componentDidMount() {
        (async () => {
            if (!this.props.location || !this.props.location.state || !this.props.location.state.noDetails) {
                this.props.history.push('/');
                return;
            }

        })();
    }

    goBack = () => {
        this.props.history.goBack();
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
        publicPlaces[index][keyName] = publicPlaceVal;
        this.setState({ publicPlaces });
    }

    //create another public place
    addPublicPlace = () => {
        if (this.state.publicPlaces.length < 4) {
            let publicPlaces = this.state.publicPlaces;
            publicPlaces.push({});
            this.setState({ publicPlaces });
        }
        else this.setState({ errorMsg: 'לא ניתן להוסיף עוד תקיעות ציבוריות ' });
    }

    //remove the public meeting
    removePubPlace = (index) => {
        let publicPlaces = this.state.publicPlaces;
        publicPlaces.splice(index, 1);
        this.setState({ publicPlaces });
    }

    //update walk time
    handleWalkTImeChange = (event, newValue) => {
        this.setState({ walkTime: newValue });
    }

    handleAddressChange = (address) => {
        this.setState({ address })
    }

    checkForMissingDataInPublicPlaces = async () => {
        let publicPlaces = this.state.publicPlaces;
        let updateArrInState = false;
        for (let i in publicPlaces) {
            if (!publicPlaces[i].address && !publicPlaces[i].time) {
                updateArrInState = true;
                publicPlaces.splice(i, 1);
            }
            else {
                if (!publicPlaces[i].address || !Array.isArray(publicPlaces[i].address) || !publicPlaces[i].time) {
                    this.setState({ errorMsg: 'אנא מלא את כל הפרטים' });
                    return false;
                }
                if (!Array.isArray(publicPlaces[i].address) || publicPlaces[i].address.length !== 2 || publicPlaces[i].address[0] === CONSTS.NOT_A_VALID_ADDRESS || !publicPlaces[i].address[1] || !publicPlaces[i].address[1].lng || !publicPlaces[i].address[1].lat) {
                    this.setState({ errorMsg: 'אנא בחר מיקום מהרשימה הנפתחת בתקיעות הציבוריות' });
                    return false;
                }
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
        const formChilds = e.target.children;

        if (!formChilds[1].value || !this.state.chosenTime || !this.state.address || !this.state.address.length) {
            this.setState({ errorMsg: 'אנא מלא את כל הפרטים' });
            return;
        }

        if (formChilds[1].value > 20 || formChilds[1].value.length > 2) { // check can_blow_x_times value
            this.setState({ errorMsg: 'לא ניתן לבצע תקיעת שופר יותר מ-20 פעמים' });
            return;
        }

        if(formChilds[1].value < 1){
            this.setState({ errorMsg: 'יש לבצע תקיעת שופר לפחות פעם אחת' });
            return;
        }

        // check address
        const { address } = this.state
        if (!Array.isArray(address) || !address.length) {
            this.setState({ errorMsg: 'אנא הכנס מיקום' });
            return;
        }
        if (!address[0] || address[0] === CONSTS.NOT_A_VALID_ADDRESS || typeof address[1] !== "object" || !address[1].lng || !address[1].lat) {
            this.setState({ errorMsg: 'נא לבחור מיקום מהרשימה הנפתחת' })
            return;
        }

        //startTime
        let startTime = new Date(this.state.chosenTime);
        startTime.setFullYear(2020, 8, 20);

        let success = await this.checkForMissingDataInPublicPlaces();
        if (!success) {
            return;
        }
        let blowerDetails = {
            "can_blow_x_times": formChilds[1].value,
            "volunteering_start_time": startTime,
            "volunteering_max_time": this.state.walkTime,//endTime,
            "address": this.state.address,
            "publicPlaces": this.state.publicPlaces
        }
        this.setState({ errorMsg: '' });
        //update shofar blower details
        updateSBDetails(blowerDetails, (error) => {
            if (!error) {
                this.props.history.push('/')
            } else {
                this.setState({ errorMsg: typeof error === "string" ? error : 'אירעה שגיאה בעת ההרשמה, נא נסו שנית מאוחר יותר, תודה' })
            }
        })
    }

    render() {
        const name = (this.props.location && this.props.location.state && this.props.location.state.name) ? this.props.location.state.name : '';

        // var input = document.getElementById('locationTextField');
        // var autocomplete = new google.maps.places.Autocomplete(input);


        return (
            <div id="isolated-form-container">

                <div className="form-container" style={{ width: isBrowser ? '40%' : '100%' }}>
                    <img id="go-back" className="clickAble" src="/icons/go-back.svg" onClick={this.goBack} />
                    <div className="msg-txt header"> {`שלום ${name}, `}</div>
                    <div className="msg-txt header">ותודה על הנכונות לעזור!</div>
                    <div className="msg-txt header">כמה שאלות, ונמשיך לקביעת המפגש</div>


                    <form onSubmit={this.saveShofarBlowerDetails} onKeyPress={this.handleKeyPress}>

                        {/* shofar blowing times input */}
                        <div className="title">כמה פעמים תהיה מוכן לקיים תקיעת שופר באזורך?</div>
                        <input type="number" />

                        {/* start time input */}
                        <div className="title">אני מתכנן לצאת למסלול תקיעות שופר בשעה:</div>
                        <div id="comment">ניתן לערוך את שעת התקיעה עד ליום רביעי, כ"ז באלול 16.9 בשעה 24:00</div>
                        <ThemeProvider theme={materialTheme}>
                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                <Fragment>
                                    <TimePicker
                                        ampm={false}
                                        value={this.state.chosenTime}
                                        onChange={this.changeChosenTime}
                                        format={format}
                                    />
                                </Fragment>
                            </MuiPickersUtilsProvider>
                        </ThemeProvider>

                        {/* address inputs */}
                        <div className="title">מה הכתובת ממנה אתה יוצא?</div>
                        <div id="comment">נא לרשום את הכתובת המלאה</div>
                        <FormSearchBoxGenerator onAddressChange={this.handleAddressChange} uId='form-search-input-1' />

                        {/* walk time slider */}
                        <div className="walk-time title">סמן את זמן ההליכה</div>
                        <Slider value={this.state.walkTime} min={15} max={180} onChange={this.handleWalkTImeChange} aria-labelledby="continuous-slider" />
                        <div>{`עד ${this.state.walkTime} דקות`}</div>

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
                                        key={index}
                                        removePubPlace={this.removePubPlace}
                                        index={index}
                                        format={format}
                                        updatePublicPlace={this.updatePublicPlace}
                                    />
                                })}
                                <div id="add-public-place" className="clickAble" onClick={this.addPublicPlace}>
                                    <div id="plus">+</div>
                                    <div>הוסף מקום ציבורי</div>
                                </div>
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
                    <img id="shofar-img" src="/icons/shofar.png" />
                </BrowserView>
            </div>
        );
    }
}