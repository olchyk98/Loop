import React, { Component, Fragment } from 'react';
import './main.css';

import { connect } from 'react-redux';
import { gql } from 'apollo-boost';
import { Link } from 'react-router-dom';

import { cookieControl } from '../../utils';
import links from '../../links';
import client from '../../apollo';
import api from '../../api';

import Loadericon from '../__forall__/loader.icon/';
const image = 'https://lolstatic-a.akamaihd.net/frontpage/apps/prod/LolGameInfo-Harbinger/en_US/8588e206d560a23f4d6dd0faab1663e13e84e21d/assets/assets/images/gi-landing-top.jpg';

class NotificationsDockItem extends Component {
	render() {
		return(
			// <Loadericon />
			<div className="gl-nav-account-notifications-dock-item">
				<div className="gl-nav-account-notifications-dock-item-avatar">
					<img src={ image } alt="user" title="Contributor" />
				</div>
				<div className="gl-nav-account-notifications-dock-item-content">
					<span className="gl-nav-account-notifications-dock-item-content-event">Oles Odynets created new post</span>
					<span className="gl-nav-account-notifications-dock-item-content-content">Create something with me. I'll be proud of you.</span>
				</div>
				<div className="gl-nav-account-notifications-dock-item-time">
					<span className="gl-nav-account-notifications-dock-item-time-default">8h</span>
					<div className="gl-nav-account-notifications-dock-item-time-arrow">
						View
						<i className="fas fa-angle-right" />
					</div>
				</div>
			</div>
		);
	}
}

class SearchDockUser extends Component {
	render() {
		return(
			<div className="gl-nav-search-dock-section-user">
				<div className="gl-nav-search-dock-section-user-avatar">
					<img src={ image } alt="user" title="User's avatar" />
				</div>
				<span className="gl-nav-search-dock-section-user-name">Oles Odynets</span>
				<div className="gl-nav-search-dock-section-user-arrow">
					<i className="fas fa-angle-right" />
				</div>
			</div>
		);
	}
}

class SearchDockPost extends Component {
	render() {
		return(
			<div className="gl-nav-search-dock-section-post">
				<div className="gl-nav-search-dock-section-post-avatar">
					<img src={ image } alt="User" title="User's avatar" />
				</div>
				<div className="gl-nav-search-dock-section-post-content">
					<p className="gl-nav-search-dock-section-post-content-mat">
						LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd 
						LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd 
						LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd 
						LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd 
						LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd 
						LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd 
						LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd LoremInptakd 
					</p>
					<div className="gl-nav-search-dock-section-post-content-info">
						<span className="gl-nav-search-dock-section-post-content-info-time">8h</span>
					</div>
				</div>
			</div>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			visibleNotifications: false,
			visibleSearch: false,
			validatedSearch: false
		}

		this.searchInt = null
	}

	componentDidMount() {
		this.fetchAPI();
	}

	fetchAPI = () => {
		let { id } = cookieControl.get("authdata"),
			errorTxt = "This application was loaded incorrectly. Please, restart the page."

		client.query({
			query: gql`
				query($id: ID!) {
					user(id: $id) {
						id,
						avatar,
						name
					}
				}
			`,
			variables: {
				id
			}
		}).then(({ data: { user } }) => {
			if(!user) return this.props.castError(errorTxt);

			this.props.setUserData(user);
		}).catch(() => this.props.castError(errorTxt))
	}

	logout = () => {
		cookieControl.delete("authdata");
		window.location.href = links["PRESENTATION_PAGE"].absolute;
	}

	search = value => {
		if(value === false) {
			return this.setState(({ validatedSearch: a }) => ({
				visibleSearch: a
			}));
		}

		let a = !value.replace(/ /g, "").length;
		clearTimeout(this.searchInt);
		this.setState(() => ({
			visibleSearch: !a,
			validatedSearch: !a
		}));
		if(a) return;

		this.searchInt = setTimeout(() => {
			console.log("REQUEST SENDED!");
		}, 400);
	}

	render() {
		return(
			<Fragment>
				<div
					className={ `gl-navtgbg${ (!this.state.visibleNotifications && !this.state.visibleSearch) ? "" : " visible" }` }
					onClick={ () => this.setState({ visibleNotifications: false, visibleSearch: false }) }
				/>
				<div className="gl-nav">
					<div className="gl-nav-logo">
						<span>TunaConnect</span>
						<div onClick={ this.props.toggleSmallDock }>
							<i className="fas fa-bars" />
						</div>
					</div>
					<div className="gl-nav-search">
						<div className="gl-nav-search-icon">
							<i className="fas fa-search" />
						</div>
						<input
							className="gl-nav-search-input definp"
							placeholder="Search..."
							title="Here you can find something"
							onChange={ ({ target: { value } }) => this.search(value) }
							onClick={ () => this.search(false) }
						/>
						<div className={ `gl-nav-search-dock${ (!this.state.visibleSearch) ? "" : " visible" }` }>
							{/* <Loadericon /> */}
							<span className="gl-nav-search-dock-title">Users</span>
							<div className="gl-nav-search-dock-section">
								<SearchDockUser />
								<SearchDockUser />
								<SearchDockUser />
								<SearchDockUser />
							</div>
							<span className="gl-nav-search-dock-title">Posts</span>
							<div className="gl-nav-search-dock-section">
								<SearchDockPost />
								<SearchDockPost />
								<SearchDockPost />
								<SearchDockPost />
								<SearchDockPost />
								<SearchDockPost />
								<SearchDockPost />
							</div>
						</div>
					</div>
					<div className="gl-nav-account">
						<button onClick={ () => this.setState(({ visibleNotifications: a }) => ({ visibleNotifications: !a })) } className="gl-nav-account-spc definp">
							<i className="far fa-bell" />
							<div className="gl-nav-account-spc-dot"></div>
							<div className={ `gl-nav-account-notifications-dock${ (!this.state.visibleNotifications) ? "" : " visible" }` }>
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
								<NotificationsDockItem />
							</div>
						</button>
						<Link className="gl-nav-account-img" to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.user && this.props.user.id }` } onClick={ this.props.refreshDock }>
							<img src={ ((this.props.user && this.props.user.avatar && api.storage + this.props.user.avatar) || "") } alt="" title="Your avatar" />
						</Link>
						<button onClick={ this.logout } className="gl-nav-account-spc definp">
							<i className="fas fa-sign-out-alt" />
						</button>
					</div>
				</div>
			</Fragment>
		);
	}
}

const mapStateToProps = ({ user: { userdata: user }, session: { dockRefresher } }) => ({
	user,
	refreshDock: dockRefresher
});

const mapActionsToProps = {
	toggleSmallDock: () => ({ type: 'TOGGLE_SMALL_DOCK', payload: '' }),
	setUserData: payload => ({ type: 'SET_USER_DATA', payload }),
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(App);