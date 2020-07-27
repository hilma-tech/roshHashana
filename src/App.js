import React, { Component, Suspense } from 'react';
import './App.scss';
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import Auth from "./modules/auth/Auth";
import Login from "./modules/auth/Login";
import Home from './scenes/Home';
import Samples from './modules/samples/Samples';
import { PrivateRoute, MultipleRoute } from './modules/auth/PrivateRoute';
import { HomeRoute } from './modules/auth/PrivateRoute';
import loadable from '@loadable/component';
import ResetPassword from './modules/auth/client/components/ResetPassword';
import SBHomePage from './scenes/shofar_blower_home_page';
import { SBProvider } from './ctx/shofar_blower_context';
import { MainProvider } from './ctx/MainContext';
// import SimpleUserHome from "./scenes/Home";

const Map = loadable(() => import('./components/maps/map'));
const IsolatedForm = loadable(() => import('./scenes/detailsForm/IsolatedForm'));
const BlowerForm = loadable(() => import('./scenes/detailsForm/BlowerForm'));
const IsolatedMainPage = loadable(() => import('./scenes/mainPages/IsolatedPage'));
const IsolatedSettings = loadable(() => import('./scenes/usersSettings/IsolatedSettigns'));
const GeneralUserSettings = loadable(() => import('./scenes/usersSettings/GeneralUserSettings'));
const BlowerSettings = loadable(() => import('./scenes/usersSettings/BlowerSettings'));

// const DashboardMain = loadable(() => import('./modules/dashboard/dashboard-main'));
const SimpleUserHome = loadable(() => import('./scenes/Home'));
const Register = loadable(() => import('./scenes/Register'));


class App extends Component {

    render() {
        const homePages = { SimpleUserHome: (props) => <IsolatedMainPage {...props} /> };

        return (
            <Suspense fallback={<div>Loading...</div>}>
                <Router>
                    <div className="App">
                        <MainProvider>
                                <Switch>
                                    <HomeRoute force exact path="/" component={(props) => <Home {...props} />} comps={homePages} />
                                    {/* <PrivateRoute path="/addDetails/isolated" compName="IsolatedDetailsForm" component={(props => <IsolatedForm {...props} />)} />
                            <PrivateRoute path="/addDetails/shofar-blower" compName="BlowerDetailsForm" component={(props => <BlowerForm {...props} />)} /> */}
                                    <PrivateRoute path="/isolated-main-page" compName="IsolatedMainPage" component={(props => <IsolatedMainPage {...props} />)} />
                                    <PrivateRoute path="/sb-map" compName="SBHomePage" component={props => { return <SBProvider><SBHomePage {...props} /></SBProvider> }} />
                                    <MultipleRoute path="/settings" comps={{ 'IsolatedSettings': IsolatedSettings, 'BlowerSettings': BlowerSettings, 'GeneralUserSettings': GeneralUserSettings }} />
                                    <MultipleRoute path="/addDetails" comps={{ 'IsolatedDetailsForm': IsolatedForm, 'BlowerDetailsForm': BlowerForm }} />
                                    <Route path="/register" component={(props) => <Register {...props} />} />
                                </Switch>
                        </MainProvider>
                    </div>
                </Router>
            </Suspense>
        );
    }
}

//export default inject('ExampleStore')(observer(App));
export default App;