import React from 'react';
import { observer,inject } from 'mobx-react';

function Home(props) {
  return (
      <header className="App-header">
        <p>
         מערכת להתאמת בעל תוקע לאנשים אשר מבודדים ואינם יכולים ללכת לשמוע תקיעת שופר
        </p>
        <a className="App-link" href="/RegisterIsolator" rel="noopener noreferrer">הרשמה של מבודד</a>
        <a className="App-link" href="/RegisterShofar" rel="noopener noreferrer">הרשם כבעל תוקע</a>
      </header>
  );
}

export default inject('ExampleStore')(observer(Home));