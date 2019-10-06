import React from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Auth from "./modules/auth/Auth";
import DashboardMain from "./modules/dashboard/dashboard-main";
import Login from "./modules/auth/Login";
import Home from './scenes/Home'
import Samples from './modules/samples/Samples';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    Auth.isAuthenticated() ? <Component auth={Auth} {...props} /> : <Redirect to='/login' />
  )} />
)

function App() {
  let [login, setLogin] = React.useState( Auth.isAuthenticated() ? true : false )

 const updateNav = () => {
    setLogin(true)
  }

  return (
    <Router>
      <div className="App">
        <PrivateRoute exact path="/" component={Home} />
        { <PrivateRoute path="/admin" component={DashboardMain} /> }
        <Route path="/login" render={(props) => <Login {...props} navHeader={updateNav} />} />
        <Route path="/samples" component={Samples} />
        
      </div>
    </Router>

  );
}

export default App;
