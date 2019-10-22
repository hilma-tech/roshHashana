import React, { Component } from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Auth from "./modules/auth/Auth";
import DashboardMain from "./modules/dashboard/dashboard-main";
import Login from "./modules/auth/Login";
import Home from './scenes/Home'
import Samples from './modules/samples/Samples';
import PrivateRoute from './modules/auth/PrivateRoute';

class App extends Component {

    constructor(props) {
        super(props);
        this.state={isAuth:false};
        
    }

    async componentDidMount(){
        
        this.isAuth=await Auth.isAuthenticated();
        this.setState({isAuth:this.isAuth});

        
    }

    render() {
        //console.log("hello mobx",this.props.ExampleStore.first); //an example to access mobx!

        
        if (!this.state.isAuth){
            return(
            <Router>
                <div className="App">
                    <Route exact path="/" component={Home} />                    
                    <Route path="*" render={(props) => <Login {...props} />} />
                </div>
            </Router>
            );
        }

        

        return (
          <Router>
            <div className="App">
              <Route exact path="/" component={Home} />
              <PrivateRoute path="/admin" component={DashboardMain} />
              <Route path="/login" render={(props) => <Login {...props} />} />
              <Route path="/samples" component={Samples} />         
            </div>
          </Router>

        );

    }
}

//export default inject('TextStore')(observer(App));
export default App;