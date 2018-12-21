import React, { Component } from 'react';
import './main.css';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import links from '../../links';

class DockBtn extends Component {
	render() {
		return(
			<Link
				onClick={ this.props._onClick }
				to={ this.props._to }
				className={ `gl-dock-title-navigation-btn definp${ (!this.props.active) ? "" : " active" }` }>
				{ this.props.title }
			</Link>
		);
	}
}

class App extends Component {
	componentDidMount() {
		this.props.updateRefresher(() => this.forceUpdate());
	}

	render() {
		return(
			<div className={ `gl-dock${ (!this.props.showDock) ? "" : " show" }` }>
				<span className="gl-dock-title">Menu</span>
				<div className="gl-dock-title-navigation">
					<DockBtn
						title="Home"
						active={ '/'+window.location.href.split("/")[3].toLowerCase() === links["HOME_PAGE"].absolute }
						_to={ links["HOME_PAGE"].absolute }
						_onClick={ () => this.forceUpdate() }
					/>
					<DockBtn
						title="Profile"
						active={ '/'+window.location.href.split("/")[3].toLowerCase() === links["ACCOUNT_PAGE"].absolute }
						_to={ links["ACCOUNT_PAGE"].absolute }
						_onClick={ () => this.forceUpdate() }
					/>
					<DockBtn
						title="Settings"
						active={ '/'+window.location.href.split("/")[3].toLowerCase() === links["SETTINGS_PAGE"].absolute }
						_to={ links["SETTINGS_PAGE"].absolute }
						_onClick={ () => this.forceUpdate() }
					/>
					<DockBtn
						title="Chat"
						active={ '/'+window.location.href.split("/")[3].toLowerCase() === links["CHAT_PAGE"].absolute }
						_to={ links["CHAT_PAGE"].absolute }
						_onClick={ () => this.forceUpdate() }
					/>
				</div>
			</div>
		);
	}
}

export default connect(
	({ session: { showDock } }) => ({
		showDock
	}),
	{
		updateRefresher: payload => ({
			type: "SET_DOCK_REFRESHER",
			payload
		})
	}
)(App);