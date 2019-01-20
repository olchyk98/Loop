import React, { Component, Fragment } from 'react';
import './main.css';

class Hero extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isOpened: false
		}
	}

	render() {
		if(!this.props.values) return null;

		return(
			<Fragment>
				<div className="coi-selectionlist">
					<button className="coi-selectionlist_call definp" onClick={ () => this.setState(({ isOpened: a }) => ({ isOpened: !a })) }>
						<i className="fas fa-cog" />
					</button>
					<div className="coi-selectionlist-mat">
						{
							this.props.values.map((session, index) => (
								<button key={ index } className="coi-selectionlist-item definp" onClick={ session.action }>{ session.name }</button>
							))
						}
					</div>
				</div>
				<div className={ `coi-selectionlist_bg${ (!this.state.isOpened) ? "" : " opened" }` } />
			</Fragment>
		);
	}
}

export default Hero;