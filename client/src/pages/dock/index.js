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
	render() {
		return(
			<div className={ `gl-dock${ (!this.props.showDock) ? "" : " show" }` }>
				<span className="gl-dock-title">Menu</span>
				<div className="gl-dock-title-navigation">
					{
						Object.values(links).map(({ absolute: link, navTitle }, index) => ((navTitle) ? (
							<DockBtn
								key={ index }
								title={ navTitle }
								active={ '/'+window.location.href.split("/")[3].toLowerCase() === link }
								_to={ link }
								_onClick={ () => this.forceUpdate() }
							/>
						) : null))
					}
				</div>
			</div>
		);
	}
}

export default connect(
	({ session: { showDock } }) => ({
		showDock
	})
)(App);