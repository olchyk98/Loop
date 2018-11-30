// Some stuff
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import './libs/fontawesome'; // fontawesome library
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
serviceWorker.unregister();
