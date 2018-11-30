import React, { Component, Fragment } from 'react';
import './main.css';

import { Link } from 'react-router-dom';

import links from '../../links';

const image = 'https://lolstatic-a.akamaihd.net/frontpage/apps/prod/LolGameInfo-Harbinger/en_US/8588e206d560a23f4d6dd0faab1663e13e84e21d/assets/assets/images/gi-landing-top.jpg';

class DockBtn extends Component {
	render() {
		return(
			<Link
				to={ this.props._to }
				className="gl-dock-title-navigation-btn definp"
				onClick={ this.props._onClick }>
				{ this.props.title }
			</Link>
		);
	}
}

class App extends Component {
	render() {
		return(
			<Fragment>
				<div className="gl-nav">
					<div className="gl-nav-logo">
						<i className="fas fa-adjust" />
					</div>
					<div className="gl-nav-search">
						<div className="gl-nav-search-icon">
							<i className="fas fa-search" />
						</div>
						<input
							className="gl-nav-search-input definp"
							placeholder="Search..."
						/>
					</div>
					<div className="gl-nav-account">
						<div className="gl-nav-account-img">
							<img src={ image } alt="" title="Your avatar" />
						</div>
						<button className="gl-nav-account-logout definp">
							<i className="fas fa-sign-out-alt" />
						</button>
					</div>
				</div>
				<div className="gl-dock">
					<span className="gl-dock-title">Menu</span>
					<div className="gl-dock-title-navigation">
						<DockBtn
							title="Home"
							_to={ links["HOME_PAGE"].absolute }
							_onClick={ () => null }
						/>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default App;