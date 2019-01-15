import React, { Component } from 'react';
import './main.css';

import FlipMove from 'react-flip-move';

import { connect } from 'react-redux';

const image = "https://avatars0.githubusercontent.com/u/40524044?s=460&v=4";

class NotificationRailsPopup extends Component {
	render() {
		return( // DEBUG -D
			<div className="popup_notificationrail-item" onClick={ this.props._onClick }>
				<div className="popup_notificationrail-item-controls">
					<div className="popup_notificationrail-item-controls-info">
						<div className="popup_notificationrail-item-controls-info-avatar">
							<img src={ image } alt="Init user" />
						</div>
						<span className="popup_notificationrail-item-controls-info-name">Oles Odynets</span>
					</div>
					<button className="popup_notificationrail-item-controls-info-close definp">
						<i className="fas fa-times" />
					</button>
				</div>
				<div className="popup_notificationrail-item-content">
					<span className="popup_notificationrail-item-content-title">Oles Odynets liked your post</span>
					<span className="popup_notificationrail-item-content-content">Today was a great day...</span>
				</div>
			</div>
		);
	}
}

class Hero extends Component {
	constructor(props) {
		super(props);

		this.state = {
			num: [ // DEBUG
				0,
				1
			]
		}
	}

	componentDidMount() {
		setTimeout(() => {this.setState(({num}) => ({ num: [...num, num.length] }));}, 500) // DEBUG
	}

	render() {
		return(
			<div className="popup_notificationrail">
				<FlipMove
					enterAnimation="fade"
					leaveAnimation="fade"
					duration="400">
					{
						this.state.num.map((session, index) => ( // DEBUG
							<NotificationRailsPopup
								key={ session }
								_onClick={ () => {let a=Array.from(this.state.num);a=a.filter(io => io !== session);this.setState({num:a})} } // DEBUG
							/>
						))
					}
				</FlipMove>
			</div>
		);
	}
}

const mapStateToProps = () => ({});

const mapActionsToProps = {}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(Hero);