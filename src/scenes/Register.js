
import React from 'react';
import { observer, inject } from 'mobx-react';
import Auth from "../modules/auth/Auth";

let isolator = "אני רוצה לשמוע תקיעת שופר"
let blower = "אני רוצה לתקוע בשפור"
class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: this.props.location.state.type === 'blower' ? blower : isolator,
      status: "start",
      role: this.props.location.state.type === 'blower' ? 2 : this.props.location.state.type === 'isolator' ? 1 : 3,
      phone: "",
      name: "",
      key: "",
      alart: null,
    };
    console.log("!!!",this.props.location.state.type,this.state.role)
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    if (event.target.id === "phone" && event.target.value.length < 11 && !isNaN(event.target.value) && event.target.value != "." ||
      event.target.id === "name" && event.target.value.length < 20 ||
      event.target.id === "key" && event.target.value.length < 5 && !isNaN(event.target.value) && event.target.value != ".") {

      this.setState({ [event.target.id]: event.target.value });

    }

  }

  async handleSubmit() {
    if (this.state.status == "start") {
      let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/createNewShofarBlower`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ "name": this.state.name, "phone": this.state.phone, "role": this.state.role })
      });
      if (err) {
        console.log("ERR", err);
      }
      if (res) {
        this.setState({ status: "stepTwo" })

      }
    } else {
      let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/authenticationKey?key=${this.state.key}`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "get",
      });
      if (err) {
        console.log("ERR", err);
      }
      if (res && res.ok) {
        switch (res.ok) {
          case "err key":
            this.setState({ alart: "קוד שגוי" })
            break;
          case "time out":
            this.setState({ alart: "זמן הקוד פג"});

            break;
          case "blower new":
            console.log("קרוא לדף של רעות להרשמת תוקע בשופר ");
           //TODO לקרוא לדף של רעות להרשמת תוקע בשופר 

            break;
          case "blower with data":
            console.log("ללכת למפה של תוקע בשופר ");
            //TODO ללכת למפה של תוקע בשופר 

            break;
            case "isolator new":
              console.log("לקרוא לדף של רעות להרשמת  של מבודד");
              //TODO לקרוא לדף של רעות להרשמת  של מבודד
          

            break;
            case "isolator with data":
              console.log("להציג למבודד שנירשם כבר את הסטטוס שלו");
              //TODO להציג למבודד שנירשם כבר את הסטטוס שלו

            break;
            case "isolated with public meeting":
              console.log("להודיע לו שהוא נרשם");
              //TODO להודיע לו שהוא נרשם 

            break;
          default:
            this.setState({status: "start",})
        }

      }

    }


  }

  render() {


    return (
      <div>
        {this.state.status === "start" ?
          <div>
            <div>{this.state.type}</div>
            <input id="name" type="text" placeholder={"שם מלא"} value={this.state.name} onChange={this.handleChange} />
            <input id="phone" type="tel" placeholder={"טלפון"} value={this.state.phone} onChange={this.handleChange} />

            <button onClick={this.handleSubmit}>
              שלח לי קוד
                 </button>

          </div>
          : <>
            <input id="key" type="tel" placeholder={"הכנס את הקוד שקבלת"} value={this.state.key} onChange={this.handleChange} />
            <button onClick={this.handleSubmit}> התחבר </button>
            <button >
              שלח לי קוד מחדש
                </button>
            <div>{this.state.alart != null && this.state.alart}</div>
            <div>
            </div></>
        }

      </div>
    );
  }
}
export default Register;
