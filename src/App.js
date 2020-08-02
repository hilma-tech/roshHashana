import React, { Component, useEffect, Suspense, useState } from 'react';
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

import "./consts/generalStyles.scss"


// import SimpleUserHome from "./scenes/Home";
const Map = loadable(() => import('./components/maps/map'));
const IsolatedForm = loadable(() => import('./scenes/detailsForm/IsolatedForm'));
const BlowerForm = loadable(() => import('./scenes/detailsForm/BlowerForm'));
const IsolatedMainPage = loadable(() => import('./scenes/mainPages/IsolatedPage'));
const GeneralUserPage = loadable(() => import('./scenes/mainPages/GeneralUserPage'));

const IsolatedSettings = loadable(() => import('./scenes/usersSettings/IsolatedSettigns'));
const GeneralUserSettings = loadable(() => import('./scenes/usersSettings/GeneralUserSettings'));
const BlowerSettings = loadable(() => import('./scenes/usersSettings/BlowerSettings'));

// const DashboardMain = loadable(() => import('./modules/dashboard/dashboard-main'));
const SimpleUserHome = loadable(() => import('./scenes/Home'));
const Register = loadable(() => import('./scenes/Register'));


let alertTO = null;


const App = (props) => {
    const [alertVis, setAlertVis] = useState(false)
    const alertRef = React.useRef()

    useEffect(() => {
        window.addEventListener('offline', handleInternetOffline);
        return () => {
            window.removeEventListener('online', handleInternetOnline);
            window.removeEventListener('offline', handleInternetOffline);
        }
    }, [])

    const handleInternetOffline = () => {
        showAlert('אין חיבור לאינטרנט')
        window.addEventListener('online', handleInternetOnline);
    }

    const handleInternetOnline = () => {
        showAlert('החיבור חזר');
    }

    const showAlert = text => {
        if (alertVis) {
            alertTO && clearTimeout(alertTO)
            setAlertVis(false)
        }
        setAlertVis(text)
        alertTO = setTimeout(() => { setAlertVis(false) }, 5000);
    }

    const homePages = { IsolatedHome: (props) => <IsolatedMainPage {...props} />, GeneralUserPage: (props) => <GeneralUserPage {...props} />, SBHomePage: (props) => <SBProvider><SBHomePage {...props} /></SBProvider> };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Router>
                <div className="App">
                    {alertVis ? <div ref={alertRef} className="alertMsg" >{alertVis}</div> : null}
                    <MainProvider>
                        <Switch>
                            <HomeRoute force exact path="/" component={(props) => <Home {...props} />} comps={homePages} />
                            <Route path="/register" compName="Register" component={(props) => <Register {...props} />} />
                            <MultipleRoute path="/settings" comps={{ 'IsolatedSettings': IsolatedSettings, 'BlowerSettings': BlowerSettings, 'GeneralUserSettings': GeneralUserSettings }} />
                            <MultipleRoute path="/addDetails" comps={{ 'IsolatedDetailsForm': IsolatedForm, 'BlowerDetailsForm': BlowerForm }} />
                        </Switch>
                    </MainProvider>
                </div>
            </Router>
        </Suspense>
    );
}

//export default inject('ExampleStore')(observer(App));
export default App;