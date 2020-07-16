import React from 'react';
import { observer, inject } from 'mobx-react';
import { Link } from "react-router-dom";
import Register from "./Register";
import './Home.scss'
import { BrowserView, isBrowser } from "react-device-detect";

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.onClickRegister = this.onClickRegister.bind(this);
    }


    onClickRegister(e) {
        console.log(e)
        this.props.history.push("/Register", { type: e });

    }


    render() {

        return (
            <div className="HomePage d-flex justify-content-center align-items-center ">
                <div className="">

                    <img style={{ width: isBrowser ? '28vw' : '70vw' }} src="/images/header.svg" />
                    <div className="d-lg-none d-md-none text-light " style={{ fontSize: "160%", fontWeight: "bold" }} >
                        <div >תקועים בבית? <br></br> אנחנו נדאג לכם לתקיעת שופר</div>
                    </div>
                    <div className="buttonAll justify-content-center align-items-center">
                        <div className={`${isBrowser ? "browserButtonForRegister" : "mobileButtonForRegister"} ` + ' row justify-content-center '} style={{ width: isBrowser && '56vw', marginTop: isBrowser && "3%", margin: !isBrowser && "10% 0% 0 0", }}>
                            <button style={{ marginBottom: !isBrowser && '5%' }} className={`${isBrowser ? "browserRegisterIsolator" : "mobileRegisterIsolator"}`} value="isolator" onClick={(e) => this.onClickRegister(e.target.value)}>
                                אני רוצה לשמוע תקיעת שופר  </button>
                            <button className={`${isBrowser ? "browserRegisterBlower" : "mobileRegisterBlower"}`} value="blower" onClick={(e) => this.onClickRegister(e.target.value)}>
                                אני רוצה לתקוע בשופר </button>
                        </div>
                    </div>
                    {isBrowser ?<>
                        <div className=""><img style={{ width:  '5vw' , marginTop:"6%"  }} src="/images/map.svg" /></div>
                        <div className="text-light" id="text1">מפת תקיעות ארצית</div>
                       </>
                     :<>
                        <div className="text-light" style={{ fontSize: "3vh", fontWeight: 'bold', marginTop: "17%" }}>לכל מפגשי <br></br>תקיעות שופר בארץ</div>
                        <div className=""><img style={{ width: '12vw', marginTop: "7%" }} src="/images/map.svg" /></div></>
                    }
                </div>
            </div>
        );
    }
}


export default Home;
// col-sm-5 col-6 py-1 px-4
//         <a className="App-link" href="/RegisterIsolator" rel="noopener noreferrer">הרשמה של מבודד</a>
//         <a className="App-link" href="/RegisterShofar" rel="noopener noreferrer">הרשם כבעל תוקע</a>
