import React, { Component } from 'react';
import './main.css';

class New extends Component {
	render() {
		return(
			<div className="rn-feed-new"></div>
		);
	}
}

class App extends Component {
	render() {
		return(
			<div className="rn rn-feed">
				<New />
			</div>
		);
	}
}

export default App;