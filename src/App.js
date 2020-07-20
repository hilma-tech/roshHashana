import React, { Component, Suspense } from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import Auth from "./modules/auth/Auth";
import Login from "./modules/auth/Login";
import Home from './scenes/Home';
import Samples from './modules/samples/Samples';
import { PrivateRoute } from './modules/auth/PrivateRoute';
import { HomeRoute } from './modules/auth/PrivateRoute';
import loadable from '@loadable/component';
import ResetPassword from './modules/auth/client/components/ResetPassword';
// import SimpleUserHome from "./scenes/Home";

const Map = loadable(() => import('./scenes/maps/map'));
const IsolatedForm = loadable(() => import('./scenes/detailsForm/IsolatedForm'));
const BlowerForm = loadable(() => import('./scenes/detailsForm/BlowerForm'));

// const DashboardMain = loadable(() => import('./modules/dashboard/dashboard-main'));
const SimpleUserHome = loadable(() => import('./scenes/Home'));
const Register = loadable(() => import('./scenes/Register'));


class App extends Component {

    constructor(props) {
        super(props);
        this.state = { isAuth: false };

    }

    async componentDidMount() {

        this.isAuth = await Auth.isAuthenticated();
        this.setState({ isAuth: this.isAuth });
    }

    render() {

        const homePages = { SimpleUserHome: (props) => <SimpleUserHome {...props} /> };

        return (
            <Suspense fallback={<div>Loading...</div>}>
                <Router>
                    <div className="App">
                        <Switch>
                            <HomeRoute force exact path="/" component={(props) => <Home {...props} />} comps={homePages} />
                            <Route path="/register" component={(props) => <Register {...props} />} />
                            <Route path="/addDetails/isolated" compName="IsolatedDetailsForm" component={(props => <IsolatedForm {...props} />)} />
                            <Route path="/addDetails/shofar-blower" compName="BlowerDetailsForm" component={(props => <BlowerForm {...props} />)} />
                            <Route path="/public-map" component={(props) => <Map {...props} publicMap />} />
                        </Switch>
                    </div>
                </Router>
            </Suspense>
        );
    }
}

//export default inject('ExampleStore')(observer(App));
export default App;