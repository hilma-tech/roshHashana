import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
//boostrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
//font awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
//rtl material
import { create } from 'jss';
import rtl from 'jss-rtl';
import { StylesProvider, jssPreset } from '@material-ui/styles';
import { Provider } from 'mobx-react';
import stores from './stores';

import { SocketProvider } from "@hilma/socket.io-react";

const jss = create({ plugins: [...jssPreset().plugins, rtl()] });

library.add(fas)

//ReactDOM.render(<App />, document.getElementById('root'));
console.log('uri: ', `https://${process.env.REACT_APP_SOCKET_IO_URI}`);
ReactDOM.render(
    <StylesProvider jss={jss}>
        <SocketProvider
            uri={process.env.REACT_APP_SOCKET_IO_URI}
            options={{ transports: ['websocket'] }}
        >
            <App />
        </SocketProvider>
    </StylesProvider>
    , document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();