import React, { Component } from 'react';
import './main.css';

import FlipMove from 'react-flip-move';

import { gql } from 'apollo-boost';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import client from '../../../apollo';
import { cookieControl } from '../../../utils';
import api from '../../../api';
import links from '../../../links';

const image = "https://avatars0.githubusercontent.com/u/40524044?s=460&v=4";

class NotificationRailsPopup extends Component {
	render() {
		const link = {
			"POST_TYPE": links["POSTDISPLAY_PAGE"].absolute + this.props.path,
			"COMMENT_TYPE": `${ links["POSTDISPLAY_PAGE"].absolute }${ this.props.path }?stc=true`
		}[this.props.ptype];

		return(
			<div className="popup_notificationrail-item">
				<div className="popup_notificationrail-item-controls">
					<Link className="popup_notificationrail-item-controls-info" to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.initD }` } onClick={ () => { this.props.onRoute(); this.props.onClose(); } }>
						<div className="popup_notificationrail-item-controls-info-avatar">
							<img src={ api.storage + this.props.image } alt="Init user" />
						</div>
						<span className="popup_notificationrail-item-controls-info-name">{ this.props.initName }</span>
					</Link>
					<button className="popup_notificationrail-item-controls-info-close definp" onClick={ this.props.onClose }>
						<i className="fas fa-times" />
					</button>
				</div>
				<Link className="popup_notificationrail-item-content" to={ link } onClick={ () => { this.props.onRoute(); this.props.onClose(); } }>
					<span className="popup_notificationrail-item-content-title">{ this.props.content }</span>
					<span className="popup_notificationrail-item-content-content">{ this.props.subContent }...</span>
				</Link>
			</div>
		);
	}
}

class Hero extends Component {
	constructor(props) {
		super(props);

		this.state = {
			notifications: []
		}
	}

	componentDidMount() {
		const { id } = cookieControl.get("authdata");

		client.subscribe({
			query: gql`
				subscription($id: ID!) {
					listenNotifications(id: $id) {
						id,
						urlID,
						content,
						subContent,
						init {
							id,
							avatar,
							name
						},
						pathType
					}
				}
			`,
			variables: {
				id
			}
		}).subscribe({
			next: ({ data: { listenNotifications: a } }) => {
				if(!a) return;

				this.setState(({ notifications }) => ({
					notifications: [
						...notifications,
						a
					]
				}));
			}
		});
	}

	declineNotification = id => {
		let a = Array.from(this.state.notifications);
		a.splice(a.findIndex(io => io.id === id), 1);
		this.setState(() => ({
			notifications: a
		}))
	}

	render() {
		return(
			<div className="popup_notificationrail">
				<FlipMove
					enterAnimation="fade"
					leaveAnimation="fade"
					duration="400">
					{
						this.state.notifications.map(({ id, urlID, content, subContent, init, pathType }) => (
							<NotificationRailsPopup
								key={ id }
								id={ id }
								path={ urlID }
								content={ content }
								ptype={ pathType }
								subContent={ subContent }
								initID={ init.id }
								image={ init.avatar }
								initName={ init.name }
								onClose={ () => this.declineNotification(id) }
								onRoute={() => {
									this.props.refreshDock();
								}}
							/>
						))
					}
				</FlipMove>
			</div>
		);
	}
}

const mapStateToProps = () => ({});

const mapActionsToProps = {
	refreshDock: () => ({ type: "REFRESH_DOCK", payload: null })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(Hero);