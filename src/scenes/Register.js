
import React from 'react';
import Auth from "../modules/auth/Auth";
import './Register.scss';
import { BrowserView, isBrowser } from "react-device-detect";
const errKey = "קוד שגוי"
const timeOut = "זמן הקוד פג"
const SomethingMissing = "חסר שם או מספר טלפון לא תקין"

class Register extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      // type: this.props.location.state.type === 'blower' ? blower : isolator,
      status: "start",
      role: this.props.location.state.type === 'blower' ? 2 : this.props.location.state.type === 'isolator' ? 1 : 3,
      phone: "",
      name: "",
      key: "",
      alart: null,
      sendKey: false,
      imgLoadedNum: 0
    };
    this.generalUser = `אני רוצה להשתתף במפגש תקיעת שופר ציבורי`;
    this.isolator1 = "אני רוצה לשמוע";
    this.isolator2 = "תקיעת שופר";
    this.blower = "אני רוצה לתקוע בשופר";
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ alart: null })
    if (event.target.id === "phone" && event.target.value.length < 11 && !isNaN(event.target.value) && event.target.value != "." ||
      event.target.id === "name" && event.target.value.length < 20 ||
      event.target.id === "key" && event.target.value.length < 5 && !isNaN(event.target.value) && event.target.value != ".") {

      this.setState({ [event.target.id]: event.target.value });

    }

  }

  async handleSubmit() {
    if (this.state.status == "start" && this.state.phone.length == 10 && this.state.name.length > 1 && this.state.phone[0] == 0) {
      let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/createUser`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ "name": this.state.name, "phone": this.state.phone, "role": this.state.role })
      });
      if (err) {
        console.log("ERR", err);
      }
      if (res) {
        this.setState({ status: "stepTwo" })
        return

      }
    } else if (this.state.phone.length < 10 || this.state.name.length < 2 || this.state.phone && this.state.phone[0] != 0) {
      this.setState({ alart: SomethingMissing })
    }
    if (this.state.status == "stepTwo" && this.state.key.length == 4) {
      //TODO id for generalUser this.props.location.state.meetingInfo
      let meetingId = this.props.location.state.meetingInfo ? this.props.location.state.meetingInfo.id : null
      let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/authenticationKey?key=${this.state.key}&&meetingId=${meetingId}`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "get",
      });
      if (err) {
        console.log("ERR", err);
      }
      if (res && res.ok) {
        switch (res.ok) {
          case "err key":
            this.setState({ alart: errKey })
            break;
          case "time out":
            this.setState({ alart: timeOut });

            break;
          case "blower new":
            console.log("קרוא לדף של רעות להרשמת תוקע בשופר ", res.data.name);
            this.props.history.push('/addDetails', { name: res.data.name });

            break;
          case "blower with data":
            this.props.history.push('/sb-map');

            break;
          case "isolator new":
            this.props.history.push('/addDetails', { name: res.data.name });
            break;
          case "isolator with data":
            console.log("להציג למבודד שנירשם כבר את הסטטוס שלו");
            this.props.history.push('/', { name: res.data.name, address: res.data.address });

            break;
          case "isolated with new public meeting":
            console.log("להודיע לו שהוא נרשם");
            //TODO להודיע לו שהוא נרשם 
            this.props.history.push('/', { meetingInfo: this.props.location.state.meetingInfo, name: res.data.name });


            break;
          case "isolated with public meeting":
            console.log("להכניס אותו שוב לאיפה שהוא נירשם");
            //TODO להכניס אותו שוב לאיפה שהוא נירשם
            this.props.history.push('/', { meetingInfo: res.data.meetingInfo, name: res.data.name });


            break;
          case "public meeting already exists":
            console.log("להגיד לו שהוא לא יכול להרשם פעמיים לפגישה ציבורית");
            //TODO "להגיד לו שהוא לא יכול להרשם פעמיים לפגישה ציבורית"

            break;
          default:
            this.setState({ status: "start", })
            break;
        }

      }

    } else if (this.state.status == "stepTwo" && this.state.key.length < 4) {
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

    return (
      <div className={`${isBrowser ? "browserRegisterPage" : "mobileRegisterPage"} fade-in`} style={{ display: this.state.imgLoadedNum !== 0 ? 'block' : 'none' }}  >
        {this.state.status === "start" ?
          <img id="go-back" className="clickAble" src="/icons/go-back.svg" onClick={() => this.props.history.push('/')} />
          :
          <img id="go-back" className="clickAble" src="/icons/go-back.svg" onClick={() => { this.setState({ status: "start" }) }} />
        }

        <div className=""><img style={{ width: isBrowser ? '26vw' : '50vw', marginTop: isBrowser ? "2%" : "6%" }} src="/images/header.svg" onLoad={this.updateImgLoadedNum} /></div>
        {this.props.location.state.type === 'blower' ?
          <div className={`${isBrowser ? "browserinputTextAndPhone" : "mobileinputTextAndPhone"}`} >{this.blower}</div>
          :
          this.props.location.state.type === 'isolator' ?
            <div className={`${isBrowser ? "browserinputTextAndPhone" : "mobileinputTextAndPhone"}`} >{this.isolator1}<br></br>{this.isolator2}</div>
            :
            <div className={`${isBrowser ? "browserinputTextAndPhone" : "mobileinputTextAndPhone"}`} >{this.generalUser}</div>

        }

        {this.state.status === "start" ?
          <div className="allInputInRegisterPage" >
            <input id="name" className={`${isBrowser ? "browsername" : "mobilename"}`} type="text" placeholder={"שם מלא"} value={this.state.name} onChange={this.handleChange} autoComplete={'off'} />
            <input id="phone" className={`${isBrowser ? "browserphone" : "mobilephone"}`} type="tel" placeholder={"טלפון"} value={this.state.phone} onChange={this.handleChange} />
            <div className={`${isBrowser ? "browseralartRegisterPage" : "mobilealartRegisterPage"}`}>{this.state.alart != null && this.state.alart}</div>
            <button className={`${isBrowser ? "browserbutton1" : "mobilebutton1"}`} onClick={this.handleSubmit}>
              שלח לי קוד
                 </button>

          </div>
          : <>
            <div className="allInputInRegisterPage" >
              <input id="key" className={`${isBrowser ? "browserkey" : "mobilekey"}`} type="tel" placeholder={"הכנס את הקוד שקבלת"} value={this.state.key} onChange={this.handleChange} autoComplete={'off'} />
              <div className={`${isBrowser ? "browseralartRegisterPage" : "mobilealartRegisterPage"}`}>{this.state.alart != null && this.state.alart}</div>
              <button className={`${isBrowser ? "browserbutton1" : "mobilebutton1"}`} onClick={this.handleSubmit}> התחבר </button>
              <button id={`${isBrowser ? "browserbuttonAgn" : "mobilebuttonAgn"}`} onClick={this.sendKey} >
                שלח לי קוד מחדש
                </button>

              <div>
              </div>
            </div></>}
      </div>
    );
  }
}
export default Register;
