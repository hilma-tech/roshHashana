import React from 'react';
import { observer,inject } from 'mobx-react';

function SimpleUserHome(props) {
  return (
      <header className="App-header">
        <img src="favicon.ico" className="App-logo" alt="logo" />
        <p>Welcome to Carmel 6000's Proffesional Updated Main Boilerplate App</p>
        <p>Home page example for users with role SimpleUser</p>
      </header>
  );
}

export default inject('ExampleStore')(observer(SimpleUserHome));