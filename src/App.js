import React from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Auth from "./modules/auth/Auth";
import DashboardMain from "./modules/dashboard/dashboard-main";
import Login from "./modules/auth/Login.jsx.js";
import Home from './scenes/Home'

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    Auth.isAuthenticated() ? <Component auth={Auth} {...props} /> : <Redirect to='/login' />
  )} />
)

function App() {
  [login, setLogin] = React.useState( Auth.isAuthenticated() ? true : false )

  updateNav = () => {
    this.setState({ navHeader: true })
  }

  return (
    <Router>
      <div className="App">
        <PrivateRoute path="/" component={Home} />
        <PrivateRoute path="/admin" component={DashboardMain} />
        <Route path="/login" render={(props) => <Login {...props} navHeader={this.updateNav} />} />
      </div>
    </Router>

  );
}

export default App;
