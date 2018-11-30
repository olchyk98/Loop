import React, { Component } from 'react';
import './main.css';

import { Link } from 'react-router-dom';

import links from '../../links';

class DockBtn extends Component {
	render() {
		return(
			<Link
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
			<div className="gl-dock">
				<span className="gl-dock-title">Menu</span>
				<div className="gl-dock-title-navigation">
					{
						[
							{
								title: "Home",
								link: links["HOME_PAGE"].absolute
							}
						].map(({ title, link }, index) => (
							<DockBtn
								key={ index }
								title={ title }
								active={ '/'+window.location.href.split("/")[3].toLowerCase() === link }
								_to={ link }
							/>
						))
					}
				</div>
			</div>
		);
	}
}

export default App;