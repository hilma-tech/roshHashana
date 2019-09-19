import React from 'react';
import './App.scss';

export default function Home() {
  return (
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          ברוכות הבאות לאפליקציית <code>carmel6000</code> חדשה.
        </p>

        <a
          className="App-link"
          href="/admin"
          target="_blank"
          rel="noopener noreferrer"
        >
          עבור לצד אדמין
        </a>
      </header>
  );
}