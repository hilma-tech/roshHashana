import React, { Fragment, useState, useEffect } from 'react';
import { Switch, Route } from "react-router-dom";
import { AdminMainProvider } from './ctx/AdminMainContext';
import { PrivateRoute } from './../../modules/auth/PrivateRoute';
import AdminHome from './AdminHome'
import AdminLogin from './AdminLogin.jsx'
import IsolatedsPage from './IsolatedsPage'
import ShofarBlowersPage from './ShofarBlowersPage'
import BlastsPage from './BlastsPage.jsx'
import BlowerFormAdmin from './BlowerFormAdmin'
import './styles/generalAdminStyle.scss'

const AdminRouter = (props) => {

    return (
        <div>
            <Fragment>
                <AdminMainProvider>
                    <Switch>
                        <Route exact path={`/login`} compName="AdminLogin" component={(props) => <AdminLogin {...props} />} />
                        <PrivateRoute exact path={`/blasts`} compName="BlastsPage" component={(props) => <BlastsPage {...props} />} />
                        <PrivateRoute exact path={`/home`} compName="AdminHome" component={(props) => <AdminHome {...props} />} />
                        <PrivateRoute exact path={`/searchings`} compName="IsolatedTable" component={(props) => <IsolatedsPage {...props} />} />
                        <PrivateRoute exact path={`/shofar-blowers`} compName="ShofarBlowersTable" component={(props) => <ShofarBlowersPage {...props} />} />
                        <PrivateRoute exact path={`/add-shofar-blower`} compName="BlowerFormAdmin" component={(props) => <BlowerFormAdmin {...props} />} />
                    </Switch>
                </AdminMainProvider>
            </Fragment>
        </div>
    );
}

export default AdminRouter;