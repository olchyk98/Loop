import React, { Component } from 'react';
import './main.css';

class Hero extends Component {
	constructor(props) {
		super(props);

		this.state = {
			active: false
		}
	}

	render() {
		return(
			<div
				className={ `gl-assets-switch-ii${ (!this.state.active) ? "" : " active" }` }
				onClick={ () => this.setState(({ active: a }) => ({ active: !a }), () => this.props._onChange(this.state.active)) }>
				<div>
					<div />
				</div>
			</div>
		);
	}
}

export default Hero;