import React from 'react';
import { observer,inject } from 'mobx-react';

function Home(props) {
  return (
      <header className="App-header">
        <img src="favicon.ico" className="App-logo" alt="logo" />
        <p>
          Welcome to Carmel 6000's Proffesional Updated Main Boilerplate App
        </p>
        <p>{props.ExampleStore.first} from ExampleStore</p>
        <a className="App-link" href="/admin" rel="noopener noreferrer">Access Dashboard</a>
        <a className="App-link" href="/samples" rel="noopener noreferrer">View Samples</a>

      </header>
  );
}

export default inject('ExampleStore')(observer(Home));