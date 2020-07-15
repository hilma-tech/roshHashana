import React, { Component } from 'react';
import { BrowserView, isBrowser } from "react-device-detect";
import Auth from '../../modules/auth/Auth';
import Geocode from "react-geocode";
import AutoComplete from '../../components/autocomplete/AutoComplete';
import './detailsForm.scss';

export default class IsolatedForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: '',
            openModal: false,
            cities: [],
            chosenCity: ''
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

    updateCity = (city) => {
        let chosenCity;
        if (city.name) chosenCity = city.name;
        else chosenCity = city;
        this.setState({ chosenCity });
    }

    saveIsolatedDetails = async (e) => {
        e.preventDefault();
        const formChilds = e.target.children;
        console.log(formChilds, 'formChilds');

        //cheked if the user inserted a city
        if (this.state.chosenCity === '') {
            this.setState({ errorMsg: 'אנא הכנס את שם העיר או היישוב' });
            return;
        }
        let address = this.state.chosenCity + formChilds[1].value + formChilds[2].value;
        //check if the address is correct
        Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
        Geocode.setLanguage("he");

        await Geocode.fromAddress(address).then(
            async response => {
                let isolatedDetails = {
                    "public_phone": formChilds[7].children[1].checked,
                    "city": this.state.chosenCity,
                    "street": formChilds[1].value,
                    "appartment": formChilds[2].value,
                    "comments": formChilds[6].value,
                    "public_meeting": formChilds[4].children[1].checked ? false : true
                }
                this.setState({ errorMsg: '' });

                //update isolated details
                let [res, err] = await Auth.superAuthFetch(`/api/isolateds/InsertDataIsolated`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                    method: "POST",
                    body: JSON.stringify({ data: isolatedDetails })
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
        return (
            <div id="isolated-form-container" className={`${this.state.openModal ? 'change-color' : ''}`}>

                {!this.state.openModal ?
                    <div className="form-container" style={{ width: isBrowser ? '40%' : '100%' }}>
                        <img id="go-back" src="/icons/go-back.svg" />
                        <div className="msg-txt header">שלום רון, <br></br> נשמח לעזור לך למצוא בעל תוקע שיגיע עד אליך.</div>
                        <br></br>
                        <div className="msg-txt">הפרטים שלך הם:</div>
                        <form onSubmit={this.saveIsolatedDetails}>

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

                            <div className="preferance">מהם העדפותיך לשמיעת תקיעת השופר?</div>

                            <div className="checkbox-container">
                                <div>בפתח הבית</div>
                                <input id="home" type="radio" name="preferance" />
                            </div>

                            <div className="checkbox-container">
                                <div>בחלון או במרפסת הפונה לרחוב</div>
                                <input id="street" type="radio" name="preferance" />
                            </div>

                            <input autoComplete={'off'} id="comments" type="text" placeholder="הערות" />

                            <div className="checkbox-container approval">
                                <div id="approval">אני מאשר שמספר הפלאפון שלי ישלח לבעל התוקע</div>
                                <input type="checkbox" ></input>
                            </div>

                            <div className="err-msg">{this.state.errorMsg}</div>

                            <input type="submit" value="מצאו לי בעל תוקע" />
                        </form>
                    </div>
                    : <div id="modal-container">
                        <div id="modal-contnet">תודה.<br></br> הפרטים שלך התקבלו אצלנו, ואנחנו מעבדים את הבקשה. <br></br><br></br>ביום חמישי , כ"ח באלול 17.9 נשלח אליך הודעה עם פרטי בעל התוקע ושעה משוערת</div>
                        <div id="button">הבנתי תודה</div>
                    </div>}
                <BrowserView style={{ position: 'absolute', left: '0', width: '60%', height: '100%', top: '0' }}>
                    <img id="shofar-img" src="/icons/shofar.png" />
                </BrowserView>
            </div>
        );
    }
}