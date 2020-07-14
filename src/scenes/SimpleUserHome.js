import React from 'react';
import { observer,inject } from 'mobx-react';

class Register extends React.Component { 
    constructor(props) {
        super(props);
        this.state = { isAuth: false };

    }

    render() {

        return (
           <div>
              <div className="isolator">אני רוצה לשמוע תקיעת שופר</div>
              <div className="blower">אני רוצה לתקוע בשפור</div>
           </div>
        );
    }
}


export default Register;