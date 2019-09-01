/* our App.js fire (renamed) */

import React from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Auth from "./modules/auth/Auth";
import DashboardMain from "./modules/dashboard/DashboardMain";
import Login from "./modules/auth/Login.jsx";
import { observer, inject } from 'mobx-react';
// import { observe,observable,autorun,intercept,when } from 'mobx';



const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    Auth.isAuthenticated() === true ? <Component auth={Auth} {...props} /> : <Redirect to='/login' />
  )} />
)


class Routing extends React.Component {
  constructor(props) {
    super(props)
    this.state = { navHeader: Auth.isAuthenticated() ? true : false }
  }

  updateNav = () => {
    this.setState({ navHeader: true })
  }

  render() {
    return (
        <Router>
          <div>
            <PrivateRoute path="/admin" component={DashboardMain} />
            <Route path="/login" render={(props) => <Login {...props} navHeader={this.updateNav} />} />
          </div>
        </Router>
    );
  }
}

export default inject('ConfigStore') (observer (Routing));
