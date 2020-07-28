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
            if (this.props.location && this.props.location.state && this.props.location.state.noDetails) {
                //get all cities for autocomplete
                let [res, err] = await Auth.superAuthFetch(`/api/cities/getAllCities`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" }
                }, true);
                if (res) {
                    this.setState({ cities: res });
                }
            }
            else {
                this.props.history.push('/');
                return;
            }
        })();
    }

    goBack = () => {
        this.props.history.goBack();
    }


    //update the chosen city
    updateCity = (city) => {
        let chosenCity;
        if (city.name) chosenCity = city.name;
        else chosenCity = city;
        this.setState({ chosenCity });
    }

    //save the isolated details
    saveIsolatedDetails = async (e) => {
        e.preventDefault();
        const formChilds = e.target.children;

        //cheked if the user inserted a city
        if (this.state.chosenCity === '') {
            this.setState({ errorMsg: 'אנא הכנס את שם העיר או היישוב' });
            return;
        }
        if (!formChilds[1].value && !formChilds[2].value && !formChilds[6].value) {
            this.setState({ errorMsg: 'אנא הכנס או שם רחוב ומספר בית או הערות המתארות את מקום מגוריך' });
            return;
        }

        const comments = formChilds[6].value ? formChilds[6].value : ' ';
        let address = this.state.chosenCity + ' ' + formChilds[1].value + ' ' + formChilds[2].value + ' ' + comments;
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
                    "comments": comments,
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

    goToMainPage = () => {
        const name = (this.props.location && this.props.location.state && this.props.location.state.name) ? this.props.location.state.name : '';
        const street = document.getElementById('street');
        const appartment = document.getElementById('appartment');
        const comments = document.getElementById('comments');
        const address = street.value + ' ' + appartment.value + ' ' + comments.value + ', ' + this.state.chosenCity;
        this.props.history.push('/', { name, address });
    }

    render() {
        const name = (this.props.location && this.props.location.state && this.props.location.state.name) ? this.props.location.state.name : '';

        return (
            <>
                <div id="isolated-form-container" style={{ opacity: this.state.openModal ? '0' : '1' }} >
                    <div className="form-container" style={{ width: isBrowser ? '40%' : '100%' }}>
                        <img id="go-back" className="clickAble" src="/icons/go-back.svg" onClick={this.goBack} />
                        <div className="msg-txt header">{`שלום ${name},`}</div>
                        <div className="msg-txt header"> נשמח לעזור לך למצוא בעל תוקע שיגיע עד אליך.</div>
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

                            <div className="checkbox-container ">
                                <div>בפתח הבית</div>
                                <input className="clickAble" type="radio" name="preferance" defaultChecked />
                            </div>

                            <div className="checkbox-container ">
                                <div>בחלון או במרפסת הפונה לרחוב</div>
                                <input className="clickAble" type="radio" name="preferance" />
                            </div>

                            <input autoComplete={'off'} id="comments" type="text" placeholder="הערות ותיאור הכתובת" />

                            <div className="checkbox-container approval ">
                                <div id="approval">אני מאשר שמספר הפלאפון שלי ישלח לבעל התוקע</div>
                                <input className="clickAble" type="checkbox" ></input>
                            </div>

                            <div className="err-msg">{this.state.errorMsg}</div>

                            <input type="submit" value="מצאו לי בעל תוקע" />
                        </form>
                    </div>
                    <BrowserView style={{ position: 'absolute', left: '0', width: '60%', height: '100%', top: '0' }}>
                        <img id="shofar-img" src="/icons/shofar.png" />
                    </BrowserView>
                </div>
                {this.state.openModal &&
                    <div id="background">
                        <div id="modal-container" className={isBrowser ? 'modal-resize' : ''}>
                            <div id="modal-contnet">תודה.<br></br> הפרטים שלך התקבלו אצלנו, ואנחנו מעבדים את הבקשה. <br></br><br></br>ביום חמישי , כ"ח באלול 17.9 נשלח אליך הודעה עם פרטי בעל התוקע ושעה משוערת</div>
                            <div id="button" className="clickAble" onClick={this.goToMainPage}>הבנתי תודה</div>
                        </div>
                    </div>}
            </>
        );
    }
}