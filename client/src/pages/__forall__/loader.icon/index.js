import React, { Component } from 'react';
import './main.css';

class App extends Component {
	render() {
		return(
			<div
				className="coi-loadericon"
				style={ this.props.style || null }
			/>
		);
	}
}

export default App;