import React, { Component } from 'react';
import AutoComplete from '../../components/autocomplete/AutoComplete';
import { BrowserView, isBrowser } from "react-device-detect";
import Popup from '../../components/modals/general_popup';
import Auth from '../../modules/auth/Auth';
import Geocode from "react-geocode";
import './detailsForm.scss';
import { FormSearchBoxGenerator } from '../../components/maps/search_box_generator';
import { updateIsolatedDetails } from '../../fetch_and_utils';
import { CONSTS } from '../../const_messages';

export default class IsolatedForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: '',
            openModal: false,
            address: [],
            chosenCity: '',
            approval: true,
        }
    }

    goBack = () => {
        this.props.history.goBack();
    }

    //update the chosen address
    setAddress = (address) => {
        this.setState({ address });
    }

    //save the isolated details
    saveIsolatedDetails = async (e) => {
        e.preventDefault();
        const formChilds = e.target.children;
        const { address } = this.state

        //cheked address
        if (!Array.isArray(address) || !address.length) {
            this.setState({ errorMsg: 'אנא הכנס מיקום' });
            return;
        }
        if (!address[0] || address[0] === CONSTS.NOT_A_VALID_ADDRESS || typeof address[1] !== "object" || !address[1].lng || !address[1].lat) {
            this.setState({ errorMsg: 'נא לבחור מיקום מהרשימה הנפתחת' })
            return;
        }

        const comments = formChilds[4].value ? formChilds[4].value : ' ';

        let isolatedDetails = {
            "public_phone": formChilds[5].children[1].checked,
            "address": address,
            "comments": comments,
            "public_meeting": formChilds[2] && formChilds[2].children[1] && formChilds[2].children[1].checked ? false : true
        }

        //update isolated details
        this.setState({ errorMsg: '' });

        updateIsolatedDetails(isolatedDetails, (error) => {
            if (!error) {
                //open modal with message
                this.setState({ openModal: true });
            }
            else this.setState({ errorMsg: "אירעה שגיאה בעת שמירת הפרטים, נא נסו שנית מאוחר יותר" })
        })
    }

    handleKeyPress = (e) => {
        const key = e.charCode || e.keyCode || 0;
        if (key == 13) {
            e.preventDefault();
            return;
        }
    }
    checkboxChange = (e) => {
        this.setState({ approval: e.target.checked });
    }
    goToMainPage = () => {
        const name = (this.props.location && this.props.location.state && this.props.location.state.name) ? this.props.location.state.name : '';
        const { address } = this.state
        this.props.history.push('/', { name, address: address[0] });
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
                        <form onSubmit={this.saveIsolatedDetails} onKeyPress={this.handleKeyPress} style={{ marginTop: "2.5rem" }} >

                            <FormSearchBoxGenerator uId={"form-search-input-isolated"} onAddressChange={this.setAddress} />
                            <input autoComplete={'off'} id="isolated-comments" type="text" placeholder="הערות ותיאור הכתובת" />

                            <div className="preferance">מהם העדפותיך לשמיעת תקיעת השופר?</div>

                            <div className="checkbox-container ">
                                <div>בפתח הבית</div>
                                <input className="clickAble" type="radio" name="preferance" defaultChecked />
                            </div>

                            <div className="checkbox-container ">
                                <div>בחלון או במרפסת הפונה לרחוב</div>
                                <input className="clickAble" type="radio" name="preferance" />
                            </div>

                            <div className="checkbox-container approval ">
                                <div id="approval">אני מאשר שמספר הפלאפון שלי ישלח לבעל התוקע</div>
                                <input onChange={this.checkboxChange} checked={this.state.approval} className="clickAble" type="checkbox" ></input>
                            </div>

                            <div className="err-msg">{this.state.errorMsg}</div>

                            <input type="submit" value="מצאו לי בעל תוקע" />
                        </form>
                    </div>
                    <BrowserView style={{ position: 'absolute', left: '0', width: '60%', height: '100%', top: '0' }}>
                        <img id="shofar-img" src="/icons/shofar.png" />
                    </BrowserView>
                </div>
                {this.state.openModal ?
                    <div id="override-popup-container" ><Popup text={`תודה!\nהפרטים שלך התקבלו אצלנו, ואנחנו מעבדים את הבקשה.\nביום חמישי , כ"ח באלול 17.9 נשלח אליך הודעה עם פרטי בעל התוקע ושעה משוערת `} okayText="הבנתי תודה" closeSelf={this.goToMainPage} /></div>
                    : null}
            </>
        );
    }
}