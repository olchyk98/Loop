import React, { Component, Fragment } from 'react';
import './main.css';

import { connect } from 'react-redux';
import { gql } from 'apollo-boost';
import { Link } from 'react-router-dom';

import { cookieControl, convertTime } from '../../utils';
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
			<Link className="gl-nav-search-dock-section-user" to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.id }` } onClick={ this.props.onRoute }>
				<div className="gl-nav-search-dock-section-user-avatar">
					<img src={ api.storage + this.props.avatar } alt="user" title="User's avatar" />
				</div>
				<span className="gl-nav-search-dock-section-user-name">{ this.props.name }</span>
				<div className="gl-nav-search-dock-section-user-arrow">
					<i className="fas fa-angle-right" />
				</div>
			</Link>
		);
	}
}

class SearchDockPost extends Component {
	render() {
		return(
			<div className="gl-nav-search-dock-section-post">
				<Link className="gl-nav-search-dock-section-post-avatar" to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.creator.id }` } onClick={ this.props.onRoute }>
					<img src={ api.storage + this.props.creator.avatar } alt="User" title="User's avatar" />
				</Link>
				<Link className="gl-nav-search-dock-section-post-content" to={ links["POSTDISPLAY_PAGE"].absolute + this.props.id } onClick={ this.props.onRoute }>
					<p className="gl-nav-search-dock-section-post-content-mat">
						{ this.props.content }
					</p>
					<div className="gl-nav-search-dock-section-post-content-info">
						<span className="gl-nav-search-dock-section-post-content-info-time">{ convertTime(this.props.time, "ago") }</span>
					</div>
				</Link>
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
			validatedSearch: false,
			searchingData: null,
			searchingFlip: { // flips visibility
				users: true, // false
				posts: true // false
			}
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
			// TODO: Hide/Show flip titles

			this.setState(() => ({
				searchingData: false
			}));

			// Getter/Setter? No.
			let _export = {},
				vap = () => {
					if(_export.users && _export.posts) {
						this.setState(() => ({
							searchingData: {..._export}
						}))
					}
				}

			// client.query({ // Search users
			// 	query: gql`
			// 		query($query: String!) {
			// 			glSearchUsers(query: $query) {

			// 			}
			// 		}		
			// 	`,
			// 	variables: {
			// 		query: value
			// 	}
			// }).then(({ data: { glSearchUsers: a } }) => {
			// 	if(!a) return this.props.castError("Something went wrong. Please, restart the page");

			// 	_export.users = a;
			// 	vap();
			// });

			Promise.all([
				(
					client.query({ // Search users
						query: gql`
							query($query: String!) {
								glSearchUsers(query: $query) {
									id,
									avatar,
									name
								}
							}		
						`,
						variables: {
							query: value
						}
					})
				),
				(
					client.query({ // Search posts
						query: gql`
							query($query: String!) {
								glSearchPosts(query: $query) {
									id,
									content(limit: 45),
									time,
									creator {
										id,
										avatar
									}
								}
							}		
						`,
						variables: {
							query: value
						}
					})
				)
			]).then(([{ data: { glSearchUsers: users } }, { data: { glSearchPosts: posts } } ]) => {
				if(!users || !posts) return this.props.castError("Something went wrong. Please, restart the page");

				_export.users = users;
				_export.posts = posts;

				vap();
			})
		}, 100);
	}

	toggleSearchingFlip = field => {
		this.setState(({ searchingFlip: a }) => ({
			searchingFlip: {
				...a,
				[field]: !a[field]
			}
		}));
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
							{
								(!this.state.searchingData) ? (
									(this.state.searchingData !== false) ? null : (
										<Loadericon />
									)
								) : (
									<Fragment>
										<div className="gl-nav-search-dock-title" onClick={ () => this.toggleSearchingFlip("users") }>
											<span>
												Users
											</span>
											<div key={ (this.state.searchingFlip.users) ? "A" : "B" }>
												{
													(this.state.searchingFlip.users) ? (
														<i className="fas fa-caret-down" />
													) : (
														<i className="fas fa-caret-up" />
													)
												}
											</div>
										</div>
											{
												(this.state.searchingFlip.users) ? (
													<div className="gl-nav-search-dock-section">
														{
															this.state.searchingData.users.map(({ id, name, avatar }) => (
																<SearchDockUser
																	key={ id }
																	id={ id }
																	name={ name }
																	avatar={ avatar }
																	onRoute={() => {
																		this.props.refreshDock();
																		this.setState(() => ({
																			visibleSearch: false
																		}));
																	}}
																/>
															))
														}
													</div>
												) : null
											}
										<div className="gl-nav-search-dock-title" onClick={ () => this.toggleSearchingFlip("posts") }>
											<span>
												Posts
											</span>
											<div key={ (this.state.searchingFlip.posts) ? "A" : "B" }>
												{
													(this.state.searchingFlip.posts) ? (
														<i className="fas fa-caret-down" />
													) : (
														<i className="fas fa-caret-up" />
													)
												}
											</div>
										</div>
										<div className="gl-nav-search-dock-section">
											{
												(this.state.searchingFlip.posts) ? (
													<div className="gl-nav-search-dock-section">
														{
															this.state.searchingData.posts.map(({ id, time, creator, content }) => (
																<SearchDockPost
																	key={ id }
																	id={ id }
																	creator={ creator }
																	time={ time }
																	content={ content }
																	onRoute={() => {
																		this.props.refreshDock();
																		this.setState(() => ({
																			visibleSearch: false
																		}));
																	}}
																/>
															))
														}
													</div>
												) : null
											}
										</div>
									</Fragment>
								)
							}
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