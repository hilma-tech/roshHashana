import React, { Component } from 'react';
import { FormSearchBoxGenerator } from '../../components/maps/search_box_generator';
import { updateIsolatedDetails, checkDateBlock } from '../../fetch_and_utils';
import { BrowserView, isBrowser, isIOS } from "react-device-detect";
import GeneralAlert from '../../components/modals/general_alert';
import Popup from '../../components/modals/general_popup';
import { CONSTS } from '../../consts/const_messages';
import { MainContext } from '../../ctx/MainContext';
import Auth from '../../modules/auth/Auth';
import './detailsForm.scss';

export default class IsolatedForm extends Component {
    static contextType = MainContext
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: '',
            addressErr: "",
            openModal: false,
            address: [],
            comments: '',
            publicMeeting: false,
            approval: true,
        }
    }

    componentDidMount() {
        (async () => {
            const disableEdit = checkDateBlock('DATE_TO_BLOCK_ISOLATED');
            let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo`, {
                headers: { Accept: "application/json", "Content-Type": "application/json" },
            }, true);
            if (disableEdit) {
                this.context.openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן יותר להכניס פרטים חדשים', block: true, isPopup: { okayText: "הבנתי" } }, () => {
                    this.props.history.push('/');
                    return;
                });
                return;
            }
            if ((res && res.address)) {
                this.props.history.push('/');
                return;
            }
            if (err || !res) {
                this.context.openGenAlert({ text: "אירעה שגיאה, נא נסו שנית מאוחר יותר" })
            }
        })();
    }

    goBack = () => {
        // this.props.history.goBack();
        Auth.logout(window.location.href = window.location.origin);
    }

    //update the chosen address
    setAddress = (address) => {
        this.setState({ address });
    }

    //save the isolated details
    saveIsolatedDetails = async (e) => {
        e.preventDefault();
        if (checkDateBlock('DATE_TO_BLOCK_ISOLATED')) {
            this.context.openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן יותר להכניס פרטים חדשים', block: true });
            return;
        }
        const { address, comments, approval, publicMeeting } = this.state
        if (comments && comments.length && !/^[A-Zא-תa-z0-9 '"-]{1,}$/.test(comments)) { this.setState({ errorMsg: 'לא ניתן להכניס תווים מיוחדים בתיאור' }); return; }
        //cheked address
        if (!Array.isArray(address) || !address.length) {
            this.setState({ addressErr: 'אנא הכנס מיקום' });
            return;
        } else if (!address[0] || address[0] === CONSTS.NOT_A_VALID_ADDRESS || typeof address[1] !== "object" || !address[1].lng || !address[1].lat) {
            this.setState({ addressErr: 'נא לבחור מיקום מהרשימה הנפתחת' })
            return;
        }
        else this.setState({ addressErr: '' });

        let isolatedDetails = {
            "public_phone": approval ? true : false,
            "address": address,
            "comments": comments,
            "public_meeting": publicMeeting ? true : false
        }

        //update isolated details
        this.setState({ errorMsg: '' });

        updateIsolatedDetails(isolatedDetails, (error) => {
            if (!error) {
                //open modal with message
                this.setState({ openModal: true });
            }
            else if (error === CONSTS.CURRENTLY_BLOCKED_ERR) {
                this.context.openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן יותר לעדכן את הפרטים' });
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
    handleCommentsChange = (e) => {
        this.setState({ comments: e.target.value });
    }
    publicMeetingChange = (bool) => {
        this.setState({ publicMeeting: bool });
    }
    approvedChange = (e) => {
        this.setState({ approval: e.target.checked });
    }
    goToMainPage = () => {
        const name = (this.props.location && this.props.location.state && this.props.location.state.name) ? this.props.location.state.name : '';
        const { address, comments } = this.state
        this.props.history.push('/', { name, address: address[0], comments });
    }

    render() {
        const name = (this.props.location && this.props.location.state && this.props.location.state.name) ? this.props.location.state.name : '';
        const { showAlert } = this.context;
        return (
            <>
                <div id="isolated-form-container" style={{ opacity: this.state.openModal ? '0' : '1' }} >
                    <div className="form-container" style={{ width: isBrowser ? '40%' : '100%' }}>
                        <img id="go-back" alt="" className="clickAble" src="/icons/go-back.svg" onClick={this.goBack} />
                        <div className="msg-txt header">{`שלום ${name},`}</div>
                        <div className="msg-txt header"> נשמח לעזור לך למצוא בעל תוקע שיגיע עד אליך.</div>
                        <br></br>
                        <div className="msg-txt h1"> הפרטים שלך הם: </div>

                        <form onSubmit={this.saveIsolatedDetails} onKeyPress={this.handleKeyPress} style={{ marginTop: "1.8rem" }} >

                            <div id="comment">* נא לרשום את הכתובת המלאה</div>
                            <FormSearchBoxGenerator uId={"form-search-input-isolated"} onAddressChange={this.setAddress} />
                            <div className="err-msg">{this.state.addressErr}</div>
                            <input value={this.state.comments} onChange={this.handleCommentsChange} autoComplete={'off'} id="isolated-comments" type="text" placeholder="הערות נוספות למציאת המיקום" maxLength={254} />

                            <div className="preferance">מהם העדפותיך לשמיעת תקיעת השופר?</div>

                            <div className="checkbox-container ">
                                <div>בפתח הבית- תקיעה פרטית</div>
                                <input checked={this.state.publicMeeting ? false : true} onChange={e => { this.publicMeetingChange(e.target.checked ? false : true) }} className="clickAble" type="radio" name="preferance" style={{ marginTop: isIOS ? '0' : '2%' }} />
                            </div>

                            <div className="checkbox-container ">
                                <div>בחלון או מרפסת הפונה לרחוב- תקיעה ציבורית</div>
                                <input checked={this.state.publicMeeting ? true : false} onChange={e => { this.publicMeetingChange(e.target.checked ? true : false) }} className="clickAble" type="radio" name="preferance" style={{ marginTop: isIOS ? '0' : '2%' }} />
                            </div>

                            <div className="checkbox-container approval ">
                                <div id="approval">אני מאשר שמספר הפלאפון שלי ישלח לבעל התוקע</div>
                                <input onChange={this.approvedChange} checked={this.state.approval} className="clickAble" type="checkbox" style={{ marginTop: isIOS ? '0' : '2%' }}></input>
                            </div>

                            <div className="err-msg">{this.state.errorMsg}</div>

                            <input type="submit" value="מצאו לי בעל תוקע" />
                        </form>
                    </div>
                    <BrowserView style={{ position: 'absolute', left: '0', width: '60%', height: '100%', top: '0' }}>
                        <img id="shofar-img" alt="" src="/icons/shofar.png" />
                    </BrowserView>
                </div>
                {this.state.openModal ?
                    <div id="override-popup-container" ><Popup text={`תודה \nהפרטים שלך התקבלו אצלנו, ואנחנו מעבדים את הבקשה.\nביום חמישי , כ"ח באלול 17.9 נשלח אליך הודעה עם פרטי בעל התוקע ושעה משוערת `} okayText="הבנתי, תודה" closeSelf={this.goToMainPage} /></div>
                    : null}
                {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}

            </>
        );
    }
}