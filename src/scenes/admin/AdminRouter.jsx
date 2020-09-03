import React, { Fragment, useState, useEffect } from 'react';
import { Switch, Route } from "react-router-dom";
import { AdminMainProvider } from './ctx/AdminMainContext';
import { PrivateRoute } from './../../modules/auth/PrivateRoute';
import AdminHome from './AdminHome' //loadable ?
import AdminLogin from './AdminLogin.jsx' //loadable ?
import IsolatedsPage from './IsolatedsPage' //loadable ?
import ShofarBlowersPage from './ShofarBlowersPage' //loadable ?
import BlastsPage from './BlastsPage.jsx' //loadable ?
import BlowerFormAdmin from './BlowerFormAdmin' //loadable ?
import SingleShofarBlowerPage from './SingleShofarBlowerPage'; //loadable?
import SingleIsolatorPage from './SingleIsolatorPage' //loadable?
import NewAdmin from './NewAdmin' //loadable?
import './styles/generalAdminStyle.scss'

const AdminRouter = (props) => {

    return (
        <div>
            <Fragment>
                <AdminMainProvider>
                    <Switch>
                        <Route exact path={`/a`} compName="AdminLogin" component={(props) => <AdminLogin {...props} />} />
                        <PrivateRoute exact path={`/blasts`} compName="BlastsPage" component={(props) => <BlastsPage {...props} />} />
                        <PrivateRoute exact path={`/home`} compName="AdminHome" component={(props) => <AdminHome {...props} />} />
                        <PrivateRoute exact path={`/searchings`} compName="IsolatedTable" component={(props) => <IsolatedsPage {...props} />} />
                        <PrivateRoute exact path={`/searcher`} compName="SingleIsolator" component={(props) => <SingleIsolatorPage {...props} />} />
                        <PrivateRoute exact path={`/shofar-blowers`} compName="ShofarBlowersTable" component={(props) => <ShofarBlowersPage {...props} />} />
                        <PrivateRoute exact path={`/shofar-blower`} compName="SingleShofarBlowerPage" component={(props) => <SingleShofarBlowerPage {...props} />} />
                        <PrivateRoute exact path={`/add-shofar-blower`} compName="BlowerFormAdmin" component={(props) => <BlowerFormAdmin {...props} />} />
                        <PrivateRoute exact path={`/edit-shofar-blower`} compName="BlowerFormAdmin" component={(props) => <BlowerFormAdmin {...props} />} />
                        <PrivateRoute exact path={`/jdlgtjerwitgeswteswrtwsfsd`} compName="NewAdmin" component={(props) => <NewAdmin {...props} />} />
                    </Switch>
                </AdminMainProvider>
            </Fragment>
        </div>
    );
}

export default AdminRouter;