import React, { Component } from 'react';
import './main.css';

import links from '../../../links';

import { Link } from 'react-router-dom';

class App extends Component {
	render() {
		return(
			<Link onClick={ () => this.props._onClick && this.props._onClick() } to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.userID }` } className={ `rn-settings-account${ (!this.props.active) ? "" : " active" }` } >
				<span className="rn-settings-account-title">{ this.props.label }:</span>
				<span className="rn-settings-account-name">{ this.props.name }</span>
				<span className="rn-settings-account-login">{ this.props.login }</span>
			</Link>
		);
	}
}

export default App;