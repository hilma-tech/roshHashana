
import React from 'react';
import Auth from "../modules/auth/Auth";
import './Register.scss';
import { isBrowser } from "react-device-detect";
import { CONSTS } from '../consts/const_messages';
import { MainContext } from '../ctx/MainContext';
import GeneralAlert from '../components/modals/general_alert';
const errKey = "קוד שגוי"
const timeOut = "זמן הקוד פג"
const SomethingMissing = "שם או מספר טלפון לא תקין"

class Register extends React.Component {
  static contextType = MainContext;
  constructor(props) {
    super(props);
    this.state = {
      // type: this.props.location.state.type === 'blower' ? blower : isolator,
      status: "start",
      role: (this.props.location.state.type === 'blower') ? 2 : (this.props.location.state.type === 'isolator') ? 1 : (this.props.location.state.type === 'generalUser') ? 3 : null,
      phone: "",
      name: "",
      key: "",
      alart: null,
      sendKey: false,
      imgLoadedNum: 0
    };
    if (!this.props.location || !this.props.location.state || !this.props.location.state.type || !this.state.role)
      return this.props.history.push('/');
    this.generalUser = `אני רוצה לשמוע תקיעת שופר קרוב לבית`;
    this.isolator = "אני רוצה לשמוע \n תקיעת שופר";
    this.blower = "אני רוצה לתקוע בשופר";
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (Auth.isAuthenticated()) {
      return this.props.history.push('/');
    }
  }

  handleChange(event) {
    this.setState({ alart: null })
    if ((event.target.id === "phone" && event.target.value.length < 11 && !isNaN(event.target.value) && event.target.value !== "." && event.target.value !== "-" && event.target.value !== "+" && event.target.value !== "e") ||
      (event.target.id === "name" && event.target.value.length < 20) ||
      (event.target.id === "key" && event.target.value.length < 5 && !isNaN(event.target.value) && event.target.value !== ".")) {
      this.setState({ [event.target.id]: event.target.value })
    }

  }

  async handleSubmit() {
    if (this.state.status === "start" && this.state.phone.length === 10 && this.state.name.length > 1 && this.state.phone[0] === 0 && /^[A-Zא-תa-z '"-]{2,}$/.test(this.state.name)) {
      let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/createUser`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ "name": this.state.name, "phone": this.state.phone, "role": this.state.role })
      });
      if (err) {
        console.log("ERR", err);
        this.context.openGenAlert({ text: err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא נסו שנית מאוחר יותר" })
      }
      if (res) {
        if (res && res === CONSTS.CURRENTLY_BLOCKED_ERR) {
          this.context.openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן ליצור יותר משתמשים' });
        } else {
          this.setState({ status: "stepTwo" })
        }
        return;
      }
    } else if (this.state.phone.length < 10 || this.state.name.length < 2 || (this.state.phone && this.state.phone[0] != 0) || !/^[א-תa-z '"-]{2,}$/.test(this.state.name)) { //todo: האם שווה להפריד את בדיקת המספרים בשם שלו, ככה יהיה אפשר לומר לו שיש להכיל אותיות בלבד
      console.log(this.state.phone.length < 10 || this.state.name.length < 2 || (this.state.phone && this.state.phone[0] != 0));
      this.setState({ alart: SomethingMissing })
    }
    if (this.state.status === "stepTwo" && this.state.key.length === 4) {
      //TODO id for generalUser this.props.location.state.meetingInfo
      let meetingId = this.props.location.state.meetingInfo ? this.props.location.state.meetingInfo.meetingId ? this.props.location.state.meetingInfo.meetingId : this.props.location.state.meetingInfo.id : null
      if (this.state.role === 3 && !meetingId) return this.props.history.push('/');
      let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/authenticationKey?key=${this.state.key}&&meetingId=${meetingId}&&role=${this.state.role}`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "get",
      });
      if (err) {
        console.log("ERR", err);
        this.context.openGenAlert({ text: err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא נסו שנית מאוחר יותר" })
      }
      if (res && res.ok) {
        switch (res.ok) {
          case "LOG_OUT":
            this.props.history.push('/')
            break;
          case "err key":
            this.setState({ alart: errKey })
            break;
          case "time out":
            this.setState({ alart: timeOut });

            break;
          case "blower new":
            this.props.history.push('/addDetails', { name: res.data.name });

            break;
          case "blower with data":
            this.props.history.push('/');

            break;
          case "isolator new":
            this.props.history.push('/addDetails', { name: res.data.name });
            break;
          case "isolator with data":
            this.props.history.push('/', { name: res.data.name, address: res.data.address, comments: res.data.comments });

            break;
          case "isolated with new public meeting":
            this.props.history.push('/', { meetingInfo: this.props.location.state.meetingInfo, name: res.data.name });


            break;
          case "isolated with public meeting":
            this.props.history.push('/', { meetingInfo: res.data.meetingInfo, name: res.data.name });


            break;
          case "public meeting already exists":
            //TODO "להגיד לו שהוא לא יכול להרשם פעמיים לפגישה ציבורית"
            this.props.history.push('/', { meetingInfo: this.props.location.state.meetingInfo, name: res.data.name, cantSignUpAgain: true });

            break;
          default:
            this.setState({ status: "start", })
            break;
        }

      }

    } else if (this.state.status === "stepTwo" && this.state.key.length < 4) {
      this.setState({ alart: errKey })
    }


  }
  sendKey = async () => {
    if (!this.state.sendKey) {
      let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/createUser`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ "name": this.state.name, "phone": this.state.phone })
      });
      if (err) {
        console.log("ERR", err);
        this.context.openGenAlert({ text: err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא נסו שנית מאוחר יותר" })
      }
      if (res) {
        this.setState({ sendKey: true })
        setTimeout(() => { this.setState({ sendKey: false, }) }, 300000);
      }
    }
  }

  updateImgLoadedNum = () => {
    let num = this.state.imgLoadedNum;
    num++;
    this.setState({ imgLoadedNum: num })
  }

  render() {
    const { showAlert } = this.context;
    if (!this.props.location || !this.props.location.state) this.props.history.push("/")

    return (
      <div className={`${isBrowser ? "browserRegisterPage" : "mobileRegisterPage"} fade-in`} style={{ display: this.state.imgLoadedNum !== 0 ? 'block' : 'none' }}  >
        {this.state.status === "start" ?
          <img id="go-back" alt="" className="clickAble" src="/icons/go-back.svg" onClick={() => this.props.history.push('/')} />
          :
          <img id="go-back" alt="" className="clickAble" src="/icons/go-back.svg" onClick={() => { this.setState({ status: "start", alart: null, phone: "", name: "", key: "" }) }} />
        }
        {/* <div className="allDataRegisterPage"> */}
        <div className=""><img alt="" style={{ width: isBrowser ? '21vw' : '55vw', marginTop: isBrowser ? "6%" : "10%" }} src="/images/header.svg" onLoad={this.updateImgLoadedNum} /></div>
        {(this.props.location && this.props.location.state && this.props.location.state.type === 'blower') ?
          <div className={`${isBrowser ? "browserinputTextAndPhone" : "mobileinputTextAndPhone"}`} >{this.blower}</div>
          :
          (this.props.location && this.props.location.state && this.props.location.state.type === 'isolator') ?
            <div className={`${isBrowser ? "browserinputTextAndPhone" : "mobileinputTextAndPhoneisolator"}`} >{this.isolator}</div>
            :
            <div className={`${isBrowser ? "browserinputTextAndPhone" : "mobileinputTextAndPhone"}`} >{this.generalUser}</div>

        }

        {this.state.status === "start" ?
          <div className="allInputInRegisterPage" >
            <input id="name" className={`${isBrowser ? "browsername" : "mobilename"}`} type="text" placeholder={"נא להזין שם מלא"} value={this.state.name} onChange={this.handleChange} autoComplete={'off'} />
            <input id="phone" className={`${isBrowser ? "browserphone" : "mobilephone"}`} type="tel" placeholder={"נא להזין מספר טלפון נייד"} value={this.state.phone} onChange={this.handleChange} />
            <div className={`${isBrowser ? "browseralartRegisterPage" : "mobilealartRegisterPage"}`}>{this.state.alart !== null && this.state.alart}</div>
            <button className={`${isBrowser ? "browserbutton1" : "mobilebutton1"}`} onClick={this.handleSubmit}>
              שלחו לי קוד כניסה
                 </button>

          </div>
          : <>
            <div className="allInputInRegisterPage" >
              <input id="key" className={`${isBrowser ? "browserkey" : "mobilekey"}`} type="tel" placeholder={"מה הקוד שקיבלת מאיתנו (בהודעת SMS)?"} value={this.state.key} onChange={this.handleChange} autoComplete={'off'} autoFocus={true} />
              <div className={`${isBrowser ? "browseralartRegisterPage" : "mobilealartRegisterPage"}`}>{this.state.alart !== null && this.state.alart}</div>
              <button className={`${isBrowser ? "browserbutton1" : "mobilebutton1"}`} onClick={this.handleSubmit}> הכניסו אותי </button>
              <button id={`${isBrowser ? "browserbuttonAgn" : "mobilebuttonAgn"}`} onClick={this.sendKey} >
                שלחו לי קוד חדש
                </button>

              <div>
              </div>
            </div></>}
        {/* </div> */}
      </div>
    );
  }
}
export default Register;
