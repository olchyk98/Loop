import React, { Component } from 'react';
import './main.css';

class App extends Component {
	render() {
		return(
			<div className="coi-loadericon" style={ this.props.style || null }>
				<div className="fir" />
				<div className="sec" />
				<div className="thi" />
				<div className="fou" />
				<div className="fiv" />
			</div>
		);
	}
}

export default App;