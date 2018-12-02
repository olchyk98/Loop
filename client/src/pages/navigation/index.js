import React, { Component, Fragment } from 'react';
import './main.css';

import { cookieControl } from '../../swissKnife';
import links from '../../links';

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
			visibleSearch: false
		}

		this.searchInt = null
	}

	logout = () => {
		cookieControl.delete("authdata");
		window.location.href = links["PRESENTATION_PAGE"].absolute;
	}

	search = value => {
		 clearTimeout(this.searchInt);
		 let a = !value.replace(/ /g, "").length;
		 this.setState(() => ({
		 	visibleSearch: !a
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
						<span>MyLoop</span>
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
						<button onClick={ () => this.setState({ visibleNotifications: true }) } className="gl-nav-account-spc definp">
							<i className="far fa-bell" />
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
						<div className="gl-nav-account-img">
							<img src={ image } alt="" title="Your avatar" />
						</div>
						<button onClick={ this.logout } className="gl-nav-account-spc definp">
							<i className="fas fa-sign-out-alt" />
						</button>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default App;