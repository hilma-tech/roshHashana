import React from 'react';
import { observer, inject } from 'mobx-react';
import { Link } from "react-router-dom";
import Register from "./Register";



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
            <div>
                <div> <img src="/images/shoparForStart.png" />
                    <div>תוקעים בבית?</div>
                    <div>אנחנו נדאג לכם לתקיעת שופר</div>

                    <button className="RegisterIsolator" value="isolator" onClick={(e) => this.onClickRegister(e.target.value)}>
                        אני רוצה לשמוע תקיעת שופר
              </button>
                    <button className="RegisterBlower" value="blower" onClick={(e) => this.onClickRegister(e.target.value)}>
                        אני רוצה לתקוע שופר
              </button>
                </div>

            </div>
        );
    }
}


export default Home;

//         <a className="App-link" href="/RegisterIsolator" rel="noopener noreferrer">הרשמה של מבודד</a>
//         <a className="App-link" href="/RegisterShofar" rel="noopener noreferrer">הרשם כבעל תוקע</a>
