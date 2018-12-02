import React, { Component } from 'react';
import './main.css';

import { cookieControl } from '../../swissKnife';
import links from '../../links';

const image = 'https://lolstatic-a.akamaihd.net/frontpage/apps/prod/LolGameInfo-Harbinger/en_US/8588e206d560a23f4d6dd0faab1663e13e84e21d/assets/assets/images/gi-landing-top.jpg';

class App extends Component {
	logout = () => {
		cookieControl.delete("authdata");
		window.location.href = links["PRESENTATION_PAGE"].absolute;
	}

	render() {
		return(
			<div className="gl-nav">
				<div className="gl-nav-logo">
					<span>MyLoop</span>
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
					<button onClick={ this.logout } className="gl-nav-account-logout definp">
						<i className="fas fa-sign-out-alt" />
					</button>
				</div>
			</div>
		);
	}
}

export default App;