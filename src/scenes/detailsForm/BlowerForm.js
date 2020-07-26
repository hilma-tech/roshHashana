import React, { Fragment, Component } from 'react';
import AddPublicPlace from '../../components/addPublicPlace/AddPublicPlace';
import AutoComplete from '../../components/autocomplete/AutoComplete';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { BrowserView, isBrowser } from "react-device-detect";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import { TimePicker } from '@material-ui/pickers';
import Auth from '../../modules/auth/Auth';
import MomentUtils from '@date-io/moment';
import Geocode from "react-geocode";
import './detailsForm.scss';

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
            openModal: false, //open modal with a message to the user
            cities: [], // alist of all the cities
            chosenCity: '', //the city address of the shofar blower
            chosenTime: Date.now(), //the start time the shofar blower wants to start his volunteering
            openPublicMeetingOptions: false, // open or close the public meeting options form
            publicPlaces: [{}], //a list of all the public places that the shofar blower added,
            walkTime: 10 //the total time the shofar blower wants to walk
        }
    }

    componentDidMount() {
        (async () => {
            //get all cities for autocomplete
            let [res, err] = await Auth.superAuthFetch(`/api/cities/getAllCities`, {
                headers: { Accept: "application/json", "Content-Type": "application/json" }
            }, true);
            if (res) {
                this.setState({ cities: res });
            }
        })();
    }

    goBack = () => {
        this.props.history.goBack();
    }

    //update the city of the shofar blower
    updateCity = (city) => {
        let chosenCity;
        if (city.name) chosenCity = city.name;
        else chosenCity = city;
        this.setState({ chosenCity });
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
        let publicPlaces = this.state.publicPlaces;
        publicPlaces.push({});
        this.setState({ publicPlaces });
    }

    //update walk time
    handleWalkTImeChange = (e) => {
        this.setState({ walkTime: e.target.value });
    }

    checkForMissingDataInPublicPlaces = async () => {
        let publicPlaces = this.state.publicPlaces;
        for (let i = 0; i < this.state.publicPlaces.length; i++) {
            if (!this.state.publicPlaces[i].city && !this.state.publicPlaces[i].street && !this.state.publicPlaces[i].time) {
                publicPlaces.splice(i, 1);
            }
            else if (!this.state.publicPlaces[i].city || !this.state.publicPlaces[i].street || !this.state.publicPlaces[i].time) {
                this.setState({ errorMsg: 'אנא מלא את כל הפרטים' });
                return;
            }
            else continue;
        }
        this.setState({ publicPlaces });
    }

    //save all shofar blower details including public places
    saveShofarBlowerDetails = async (e) => {
        e.preventDefault();
        const formChilds = e.target.children;

        if (!formChilds[1].value || !this.state.chosenTime || !this.state.chosenCity || !formChilds[7].value || !formChilds[8].value) {
            this.setState({ errorMsg: 'אנא מלא את כל הפרטים' });
            return;
        }
        let address = this.state.chosenCity + ' ' + formChilds[7].value + ' ' + formChilds[2].value;
        let startTime = new Date(this.state.chosenTime);
        let endTime = new Date(this.state.chosenTime + this.state.walkTime * 60000)
        // console.log(startTime,endTime )
        endTime.setFullYear(2020, 8, 20);
        startTime.setFullYear(2020, 8, 20);

        //check if the address is correct
        Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
        Geocode.setLanguage("he");

        await this.checkForMissingDataInPublicPlaces();

        await Geocode.fromAddress(address).then(
            async response => {
                let blowerDetails = {
                    "can_blow_x_times": formChilds[1].value,
                    "volunteering_start_time": startTime,
                    "volunteering_max_time": this.state.walkTime,//endTime,
                    "city": this.state.chosenCity,
                    "street": formChilds[7].value,
                    "appartment": formChilds[8].value,
                    "publicPlaces": this.state.publicPlaces
                }
                this.setState({ errorMsg: '' });

                //update shofar blower details
                let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/InsertDataShofarBlower`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                    method: "POST",
                    body: JSON.stringify({ data: blowerDetails })
                }, true);
                if (res) {
                    //open modal with message
                    this.setState({ openModal: true });
                }
            },
            error => {
                this.setState({ errorMsg: 'הכתובת אינה תקינה, אנא בדוק אותה' });
                return;
            }
        );
    }

    render() {
        const name = (this.props.location && this.props.location.state && this.props.location.state.name) ? this.props.location.state.name : '';
        return (
            <div id="isolated-form-container" className={`${this.state.openModal ? 'change-color' : ''}`}>

                <div className="form-container" style={{ width: isBrowser ? '40%' : '100%', opacity: this.state.openModal ? '0.2' : '1' }}>
                    <img id="go-back" className="clickAble" src="/icons/go-back.svg" onClick={this.goBack} />
                    <div className="msg-txt header"> {`שלום ${name}, `}</div>
                    <div className="msg-txt header">ותודה על הנכונות לעזור!</div>
                    <div className="msg-txt header">כמה שאלות, ונמשיך לקביעת המפגש</div>


                    <form onSubmit={this.saveShofarBlowerDetails}>

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
                        <AutoComplete
                            optionsArr={this.state.cities}
                            placeholder="עיר / יישוב"
                            canAddOption={true}
                            displyField="name"
                            inputValue={this.state.chosenCity}
                            updateSelectOption={this.updateCity}
                            updateText={this.updateCity}
                            canAddOption={true}
                        />
                        <input autoComplete={'off'} id="street" type="text" placeholder="רחוב" />
                        <input autoComplete={'off'} id="appartment" type="text" placeholder="דירה/ בניין" />

                        {/* walk time slider */}
                        <div className="walk-time title">סמן את זמן ההליכה</div>
                        <input type="range" min="10" max="120" value={this.state.walkTime} className="slider" onChange={this.handleWalkTImeChange} />
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
                                        index={index}
                                        format={format}
                                        cities={this.state.cities}
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

                {this.state.openModal && <div id="modal-container" className={isBrowser ? 'modal-resize' : ''}>
                    <div id="modal-contnet">תודה!<br></br> לא מצאנו כרגע מחפשי תקיעת שופר בשעה ובמיקום שהגדרת.</div>
                    <div id="button" className="clickAble">הבנתי תודה</div>
                </div>}

                <BrowserView style={{ position: 'absolute', left: '0', width: '60%', height: '100%', top: '0', opacity: this.state.openModal ? '0.2' : '1' }}>
                    <img id="shofar-img" src="/icons/shofar.png" />
                </BrowserView>
            </div>
        );
    }
}