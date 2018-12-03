import React, { Component, Fragment } from 'react';
import './main.css';

class NewGridPhoto extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoaded: false,
			isError: false
		}
	}

	render() {
		return(
			<Fragment>
				{
					(!this.state.isLoaded) ? (
						<div className={ `rn-feed-new-main-photos-photoplaceholder${ (!this.props.inSphere) ? "" : " sphere" }` } />
					) : null
				}
				<div className={ `rn-feed-new-main-photos-photo${ (!this.props.inSphere) ? "" : " sphere" }${ (this.state.isLoaded) ? "" : " off" }${ (!this.state.isError) ? "" : " error" }` } onClick={ this.props.onDelete }>
					<div className="rn-feed-new-main-photos-photo-delete">
						<i className="fas fa-times" />
					</div>
					<div className="rn-feed-new-main-photos-photo-error">
						<i className="fas fa-exclamation-triangle" />
					</div>
					<img
						src={ this.props.image }
						alt="Grid item"
						title="Photo that you added to this post"
						onLoad={ () => this.setState({ isLoaded: true, isError: false }) }
						onError={ () => this.setState({ isLoaded: true, isError: true }, this.props._onError) }
					/>
				</div>
			</Fragment>
		);
	}
}

export default NewGridPhoto;