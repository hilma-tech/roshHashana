import React, { Component } from 'react';
import { isBrowser } from "react-device-detect";
import Map from '../../components/maps/map';
import './MainPage.scss';

export default class IsolatedPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openMap: false
        }
    }

    closeOrOpenMap = () => {
        this.setState({ openMap: !this.state.openMap });
    }

    openSettings = () => {
        this.props.history.push('/settings');
    }

    //cancel the request and delete the user
    cancelRequest = () => {

    }

    render() {
        console.log('this.props.location', this.props.location);

        let name = '', address = '';
        if (this.props.location && this.props.location.state) {
            if (this.props.location.state.name)
                name = this.props.location.state.name;
            if (this.props.location.state.address)
                address = this.props.location.state.address;
        }
        return (
            <>
                <div id="isolated-page-container" className={`${this.state.openMap ? 'slide-out-top' : 'slide-in-top'}`} >
                    <div className="settings clickAble" onClick={this.openSettings}><img src="/icons/settings.svg" /></div>
                    <div className="content-container">
                        <div>{`שלום ${name}`}</div>
                        <div id="thank-you-msg">ותודה על התעניינותך במפגש תקיעת שופר.</div>
                        <div>אנו מחפשים עבורך בעל תוקע שיגיע עד אליך</div>
                        <div>לכתובת:</div>
                        <div id="address" style={{ marginBottom: isBrowser ? '2%' : '50%' }}>{address}</div>
                        <div id="cancel-request" onClick={this.cancelRequest} style={{ marginBottom: isBrowser ? '0%' : '40%' }} className="clickAble">לביטול בקשה לאיתור בעל תוקע</div>
                        <div id="see-map" className="clickAble" onClick={this.closeOrOpenMap}>
                            צפייה במפה
                            <img src='/images/map.svg' />
                        </div>
                    </div>

                </div>
                {this.state.openMap && <Map closeMap={this.closeOrOpenMap} isolated />}
            </>
        );
    }
}