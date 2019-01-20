import React, { Component, Fragment } from 'react';
import './main.css';

import TimelineItem from '../__forall__/post';
import Loadericon from '../__forall__/loader.icon';
import placeholderGIF from '../__forall__/placeholder.gif';
import Switch from '../__forall__/switcher';
import BandsRail from '../__forall__/bandsRail';

import { connect } from 'react-redux';
import { gql } from 'apollo-boost';
import { Link } from 'react-router-dom';

import api from '../../api';
import client from '../../apollo';
import { cookieControl } from '../../utils';
import links from '../../links';

const options = {
	postsTimelineLimit: 5,
	postsCommentsLimit: 5
}

class ThumbNavButton extends Component {
	render() {
		return(
			<button className={ `rn-account-thumb-nav-btn definp${ (!this.props.active) ? "" : " active" }${ (!this.props.ei) ? "" : " ei" }` } onClick={ this.props._onClick }>
				<span className="rn-account-thumb-nav-btn-title">{ this.props.title }</span>
				{
					(!parseInt(this.props.counter)) ? null : (
						<span className="rn-account-thumb-nav-btn-counter">{ this.props.counter }</span>
					)
				}
			</button>
		);
	}
}

class GalleryItem extends Component {
	render() {
		return(
			<div className="rn-account-display-gallery-grid-photo" onClick={ this.props._onClick }>
				<img src={ api.storage + this.props.url } alt="In" title="User's photo" />
			</div>
		);
	}
}

class FriendsGridFriend extends Component {
	constructor(props) {
		super(props);

		this.state = {
			settingsVisible: false
		}
	}

	render() {
		return(
			<div className="rn-account-display-friends-nav-grid-user">
				<Link to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.id }` } className="rn-account-display-friends-nav-grid-user-avatar">
					<img src={ this.props.avatar && api.storage + this.props.avatar } alt="User" title="User's avatar" />
				</Link>
				<Link to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.id }` } className="rn-account-display-friends-nav-grid-user-info">
					<span className="rn-account-display-friends-nav-grid-user-info-name">{ this.props.name }</span>
					{
						(this.props.mutualFriends === null) ? null : (
							<span className="rn-account-display-friends-nav-grid-user-info-info">{ this.props.mutualFriends } mutual friends</span>
						)
					}
				</Link>
				<div
					className="rn-account-display-friends-nav-grid-user-set definp"
					onClick={ () => this.setState(({ settingsVisible: a }) => ({
							settingsVisible: !a
					})) }>
					<i className="fas fa-ellipsis-h" />
					<div
						className={ `rn-account-display-friends-nav-grid-user-set-list${ (!this.state.settingsVisible) ? "" : " visible" }` }>
						{
							(this.props.currentStage === "MAIN_STAGE") ? (
								<Fragment>
									{
										(this.props.userID !== this.props.clientID) ? null : (
											<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp" onClick={ () => this.props.submitAction("REMOVE_ACTION") }>Remove friend</button>
										)
									}
									<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp" onClick={ () => this.props.submitAction("OPEN_PROFILE") }>Open profile</button>
								</Fragment>
							) : (
								<Fragment>
									<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp" onClick={ () => this.props.submitAction("ACCEPT_ACTION") }>Accept request</button>
									<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp" onClick={ () => this.props.submitAction("DECLINE_ACTION") }>Decline request</button>
								</Fragment>
							)
						}
					</div>
				</div>
			</div>
		);
	}
}

class FriendsSearch extends Component {
	constructor(props) {
		super(props);


		this.searchInt = null;
		this.matRef = React.createRef();
	}

	submitValue = value => {
		clearTimeout(this.searchInt);
		this.searchInt = setTimeout(() => {
			this.props.submitValue(value);
		}, 400);
	}

	render() {
		return(
			<div className="rn-account-display-friends-nav-search">
				<input
					placeholder="Search..."
					type="text"
					className="rn-account-display-friends-nav-search-field definp"
					ref={ ref => this.matRef = ref }
					onChange={ ({ target: { value: a } }) => this.submitValue(a) }
				/>
				<div className="rn-account-display-friends-nav-search-icon">
					<i className="fas fa-search" />
				</div>
			</div>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			stage: "TIMELINE_STAGE", // TIMELINE_STAGE, FRIENDS_STAGE, GALLERY_STAGE, ABOUT_STAGE
			friendsStage: "MAIN_STAGE",
			user: null,
			friendsDisplay: [],
			friendsSearch: null,
			friendsLoading: false,
			friendProcessing: false,
			isSubscribing: false,
			aboutMeEditing: false,
			descriptionLoading: false,
			descriptionStatus: null,
			timelineFetching: false
		}

		this.descriptionNewRef = React.createRef();
		this.screenRef = React.createRef();
		this.screenRefFired = false
		this.fetchableInfPosts = true;
	}

	componentDidMount() {
		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't find a user with that id in our library. Please, try again.";

		client.query({
			query: gql`
				query($id: ID!, $targetID: ID, $limitPosts: Int, $limitComments: Int) {
					user(id: $id, targetID: $targetID) {
						id,
						avatar,
						cover,
						name,
						postsInt,
						friendsInt,
						galleryImages,
						waitingFriendsInt,
						bands,
						hasClientConversation(id: $id),
						isFriend(id: $id),
						isWaitingFriend(id: $id),
						isTrialFriend(id: $id),
						isSubscribed(id: $id),
						posts(limit: $limitPosts) {
							id,
							content,
							time,
							likesInt,
							commentsInt,
							isLiked(id: $id),
							creator {
								id,
								name,
								avatar
							},
							images {
								id,
								url
							},
							comments(limit: $limitComments) {
								id,
								content,
								time,
								creator {
									id,
									avatar,
									name
								},
								likesInt,
								isLiked(id: $id),
								image {
									id,
									url
								}
							}
						}
					}
				}
			`,
			variables: {
				id,
				targetID: this.props.match.params.id || "",
				limitPosts: options.postsTimelineLimit,
				limitComments: options.postsCommentsLimit
			}
		}).then(({ data: { user: a } }) => {
			if(!a) {
				this.props.history.push(links["HOME_PAGE"].absolute);
				this.props.refreshDock();
				return this.props.castError(errorTxt);
			}

			this.setState(() => ({
				user: a
			}));

			this.fetchableInfPosts = a.posts.length === options.postsTimelineLimit;
		}).catch(() => {
			this.props.history.push(links["HOME_PAGE"].absolute);
			this.props.refreshDock();
			this.props.castError(errorTxt);
		});
	}

	fetchTimeline = () => {
		if(!this.state.user || !this.fetchableInfPosts || this.state.stage !== "TIMELINE_STAGE" || this.state.timelineFetching) return;

		this.setState(() => ({
			timelineFetching: true
		}));

		const { id } = cookieControl.get("authdata");
		client.query({
			query: gql`
				query($id: ID!, $targetID: ID, $limitPosts: Int, $offsetIDPosts: ID, $limitComments: Int) {
					user(id: $id, targetID: $targetID) {
						id,
						posts(limit: $limitPosts, offsetID: $offsetIDPosts) {
							id,
							content,
							time,
							likesInt,
							commentsInt,
							isLiked(id: $id),
							creator {
								id,
								name,
								avatar
							},
							images {
								id,
								url
							},
							comments(limit: $limitComments) {
								id,
								content,
								time,
								creator {
									id,
									avatar,
									name
								},
								likesInt,
								isLiked(id: $id),
								image {
									id,
									url
								}
							}
						}
					}
				}
			`,
			variables: {
				id,
				targetID: this.props.match.params.id || "",
				limitPosts: options.postsTimelineLimit,
				offsetIDPosts: this.state.user.posts.slice(-1)[0].id,
				limitComments: options.postsCommentsLimit
			}
		}).then(({ data: { user: a } }) => {
			this.setState(() => ({
				timelineFetching: false
			}));

			if(!a) return;

			this.setState(({ user, user: { posts } }) => ({
				user: {
					...user,
					posts: [
						...posts,
						...a.posts
					]
				}
			}));
			this.fetchableInfPosts = a.posts.length === options.postsTimelineLimit;
		});
	}

	setGlobalStage = stage => {
		if(stage === "FRIENDS_STAGE") {
			this.setFriendsStage("MAIN_STAGE");
		} else if(stage === "GALLERY_STAGE") {
			this.setState(({ user }) => ({
				user: {
					...user,
					gallery: null
				}
			}));

			const { id } = cookieControl.get("authdata"),
				  errorTxt = "We couldn't load user's gallery. Please, try again."

			client.query({
				query: gql`
					query($id: ID!, $targetID: ID) {
						user(id: $id, targetID: $targetID) {
							id,
							gallery {
								id,
								url
							}
						}
					}
				`,
				variables: {
					id,
					targetID: this.state.user.id
				}
			}).then(({ data: { user } }) => {
				if(!user) return this.props.castError(errorTxt);

				this.setState(({ user: a }) => ({
					user: {
						...a,
						gallery: user.gallery
					}
				}));
			}).catch(() => this.props.castError(errorTxt));
		} else if(stage === "ABOUT_STAGE") {
			const { id } = cookieControl.get("authdata"),
				  errorTxt = "We couldn't load the user's about me section. Please, try again."

			this.setState(() => ({
				descriptionLoading: true
			}));

			client.query({
				query: gql`
					query($id: ID!, $targetID: ID) {
						user(id: $id, targetID: $targetID) {
							id,
							description
						}
					}
				`,
				variables: {
					id,
					targetID: this.state.user.id
				}
			}).then(({ data: { user } }) => {
				this.setState(() => ({
					descriptionLoading: false
				}));
				if(!user) return this.props.castError(errorTxt);

				this.setState(({ user: a }) => ({
					user: {
						...a,
						description: user.description,
					}
				}));
			}).catch(() => this.props.castError(errorTxt));
		} else {
			this.setState(({ user }) => ({
				user: {
					...user,
					gallery: null
				}
			}));
		}

		this.setState(() => ({
			stage
		}));
	}

	replaceAvatar = avatar => {
		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't upload an new avatar. Please, try later.";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $avatar: Upload!) {
					setUserAvatar(id: $id, avatar: $avatar) {
						id,
						avatar
					}
				}
			`,
			variables: {
				id, avatar
			}
		}).then(({ data: { setUserAvatar: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			this.props.setUserData({
				avatar: a.avatar
			});

			this.componentDidMount(); // Hmmmm... WTF IS THAT?

		}).catch(() => this.props.castError(errorTxt));
	}

	uploadImage = file => {
		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't update your image. Please try again."

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $avatar: Upload!) {
					uploadImage(id: $id, avatar: $avatar) {
						id,
						url
					}
				}
			`,
			variables: {
				id,
				avatar: file
			}
		}).then(({ data: { uploadImage } }) => {
			if(!uploadImage) return this.props.castError(errorTxt);

			this.setState(({ user, user: { gallery } }) => ({
				user: {
					...user,
					gallery: [
						uploadImage,
						...gallery
					]
				}
			}));

		}).catch(() => this.props.castError(errorTxt))
	}

	replaceCover = file => {
		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't upload a new cover image. Please, try again.";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $cover: Upload!) {
					setUserCover(id: $id, cover: $cover) {
						id,
						cover
					}
				}
			`,
			variables: {
				id,
				cover: file
			}
		}).then(({ data: { setUserCover } }) => {
			if(!setUserCover) return this.props.castError(errorTxt);

			this.setState(({ user }) => ({
				user: {
					...user,
					cover: setUserCover.cover
				}
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	setFriendsStage = stage => {
		switch(stage) {
			case 'MAIN_STAGE': {
				const { id } = cookieControl.get("authdata"),
					  errorTxt = "";

				this.setState(() => ({
					friendsLoading: true
				}));

				client.query({
					query: gql`
						query($id: ID!, $targetID: ID!) {
						  user(
						    id: $id,
						    targetID: $targetID
						  ) {
						    id,
						    friends {
						      id,
						      avatar,
						      name
						    }
						  }
						}
					`,
					variables: {
						id,
						targetID: this.state.user.id
					}
				}).then(({ data: { user } }) => {
					this.setState(() => ({
						friendsLoading: false
					}));
					if(!user) return this.props.castError(errorTxt);

					this.setState(() => ({
						friendsDisplay: user.friends
					}));
				}).catch(() => this.props.castError(errorTxt));
			}
			break;
			case 'REQUESTS_STAGE':
				const { id } = cookieControl.get("authdata"),
					  errorTxt = "We couldn't load friend requests list. Sorry about that :(";

				this.setState(() => ({
					friendsLoading: true
				}));

				client.query({
					query: gql`
						query($id: ID!) {
						  user(id: $id) {
						    id,
						    waitingFriends {
						      id,
						      avatar,
						      name,
						      mutualFriendsInt(id: $id)
						    }
						  }
						}
					`,
					variables: {
						id
					}
				}).then(({ data: { user } }) => {
					this.setState(() => ({
						friendsLoading: false
					}));
					if(!user) return this.props.castError(errorTxt);

					this.setState(() => ({
						friendsDisplay: user.waitingFriends
					}));
				}).catch(() => this.props.castError(errorTxt));
			break;
			default:break;
		}

		this.setState(() => ({
			friendsStage: stage
		}));
	}

	toggleFriend = () => {
		if(this.state.friendProcessing) return;
		const { id } = cookieControl.get("authdata");

		this.setState(() => ({
			friendProcessing: true
		}));

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $targetID: ID!) {
					processFriendRequest(id: $id, targetID: $targetID) {
						id,
						isFriend(id: $id),
						isWaitingFriend(id: $id),
						isTrialFriend(id: $id)
					}
				}
			`,
			variables: {
				id,
				targetID: this.state.user.id
			}
		}).then(({ data: { processFriendRequest } }) => {
			this.setState(() => ({
				friendProcessing: false
			}));
			if(!processFriendRequest) return this.props.castError(
				"Something wrong. Please, restart the website."
			);

			delete processFriendRequest.id;
			this.setState(({ user }) => ({
				user: {
					...user,
					...processFriendRequest
				}
			}));
		}).catch(() => this.props.castError(
			"We couldn't connect to the server. Please, check your internet connection."
		));
	}

	toggleSubscription = () => {
		if(this.state.isSubscribing) return;
		const { id } = cookieControl.get("authdata"),
			  errorTxt = "Sorry, we couldn't submit your subscription status. Please, try later.";

		this.setState(({ user, user: { isSubscribed } }) => ({
			isSubscribing: true,
			user: {
				...user,
				isSubscribed: !isSubscribed
			}
		}));

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $targetID: ID!) {
					subscribeUser(id: $id, targetID: $targetID) {
						id,
						isSubscribed(id: $id)
					}
				}
			`,
			variables: {
				id,
				targetID: this.state.user.id
			}
		}).then(({ data: { subscribeUser } }) => {
			this.setState(() => ({
				isSubscribing: false
			}));
			if(!subscribeUser) return this.props.castError(errorTxt);

			this.setState(({ user }) => ({
				user: {
					...user,
					isSubscribed: subscribeUser.isSubscribed
				}
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	addFriendManual = (tid, status) => {
		const { id } = cookieControl.get("authdata"),
			  errorTxt = "Something went wrong. Please, try again.";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $targetID: ID!, $status: String!) {
					declareFriendRequestStatus(id: $id, targetID: $targetID, status: $status) {
						id
					}
				}
			`,
			variables: {
				id, status,
				targetID: tid
			}
		}).then(({ data: { declareFriendRequestStatus: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			if(this.state.friendsStage === "REQUESTS_STAGE" && this.state.friendsDisplay) {
				let b = Array.from(this.state.friendsDisplay);
				b.splice(b.findIndex(io => io.id.toString() === a.id), 1);

				this.setState(({ friendsDisplay, user, user: { waitingFriendsInt: c } }) => ({
					friendsDisplay: b,
					user: {
						...user,
						friendsInt: user.friendsInt + 1,
						waitingFriendsInt: (c - 1 >= 0) ? c - 1 : 0
					}
				}));
			}
		}).catch(() => this.props.castError(errorTxt));
	}

	executeFriend = (tid, action) => {
		switch(action) {
			case 'OPEN_PROFILE':
				this.props.history.push(`${ links["ACCOUNT_PAGE"].absolute }/${ tid }`);
			break;
			case 'REMOVE_ACTION': {
				const { id } = cookieControl.get("authdata"),
					  errorTxt = "Something went wrong. Please, try again.";

				client.mutate({
					mutation: gql`
						mutation($id: ID!, $targetID: ID!, $status: String!) {
							declareFriendRequestStatus(id: $id, targetID: $targetID, status: $status) {
								id
							}
						}
					`,
					variables: {
						id,
						status: action,
						targetID: tid
					}
				}).then(({ data: { declareFriendRequestStatus: a } }) => {
					if(!a) return this.props.castError(errorTxt);

					if(this.state.friendsStage === "MAIN_STAGE" && this.state.friendsDisplay) {
						let b = Array.from(this.state.friendsDisplay);
						b.splice(b.findIndex(io => io.id.toString() === a.id), 1);

						this.setState(({ friendsDisplay, user, user: { friendsInt: c } }) => ({
							friendsDisplay: b,
							user: {
								...user,
								friendsInt: (c - 1 >= 0) ? c - 1 : 0
							}
						}));
					}
				}).catch(() => this.props.castError(errorTxt));
			}
			break;
			default:break;
		}
	}

	searchFriends = value => {
		if(!this.state.user) return;
		if(!value.replace(/\s|\n/g, "").length) {
			return this.setState(() => ({
				friendsSearch: null
			}));
		}

		const { id } = cookieControl.get("authdata"),
			  errorTxt = "Something went wrong. Please, restart the page.";

		this.setState(() => ({
			friendsLoading: true
		}));

		client.query({
			query: gql`
				query($id: ID!, $match: String!, $section: String!, $targetID: ID!) {
					searchFriends(id: $id, match: $match, section: $section, targetID: $targetID) {
						id,
						avatar,
						name
					}
				}
			`,
			variables: {
				id,
				match: value,
				section: {
					"MAIN_STAGE": 'FRIENDS',
					"REQUESTS_STAGE": 'REQUESTS'
				}[this.state.friendsStage],
				targetID: this.state.user.id
			}
		}).then(({ data: { searchFriends } }) => {
			this.setState(() => ({
				friendsLoading: false
			}));
			if(!searchFriends) return this.props.castError(errorTxt);

			this.setState(() => ({
				friendsSearch: searchFriends
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	updateAbout = () => {
		let value = this.descriptionNewRef.textContent || "",
			cll = a => a.replace(/\s|\n/g, "");

		if(!cll(value).length) {
			this.descriptionNewRef.innerHTML = ""
		}

		if(
			this.state.user.id !== this.props.userdata.id ||
			cll(this.state.user.description) === cll(value)
		) return;

		this.setState(({ user }) => ({
			user: {
				...user,
				description: value
			},
			descriptionStatus: "Saving..."
		}));

		const { id } = cookieControl.get("authdata"),
			castError = () => {
			  	this.props.castError(
			  		"We couldn't save the information about you. Please, try again."
			  	);

			  	this.setState(() => ({
			  		descriptionStatus: "Error!"
			  	}));
			}

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $content: String!) {
					updateProfileDescription(id: $id, content: $content) {
						id
					}
				}
			`,
			variables: {
				id,
				content: value
			}
		}).then(({ data: { updateProfileDescription: a } }) => {
			if(!a) return castError();

			this.setState(() => ({
		  		descriptionStatus: "Saved"
		  	}));
		}).catch(castError);
	}

	render() {
		if(!this.state.user) return(
			<div className="rn rn-account">
				<img src={ placeholderGIF } alt="placeholder block" className="__placeholder__ rn-account-placeholder block" />
				<img src={ placeholderGIF } alt="placeholder menu" className="__placeholder__ rn-account-placeholder menu" />
				<img src={ placeholderGIF } alt="placeholder articles" className="__placeholder__ rn-account-placeholder articles" />
				<img src={ placeholderGIF } alt="placeholder articles" className="__placeholder__ rn-account-placeholder articles" />
			</div>
		);

		return(
			<div className="rn rn-account" ref={(ref) => {
				// XXX: Some shit here...

				this.screenRef = ref;
				if(!this.screenRefFired) {
					this.screenRefFired = true;
					this.forceUpdate();
				}
			}} onScroll={({ target: { scrollHeight, offsetHeight, scrollTop } }) => { // XXX: Too high
				if(100 / ( (scrollHeight - offsetHeight) / scrollTop ) >= 99) this.fetchTimeline();
			}}>
				<div className="rn-account-thumb">
					<div className="rn-account-thumb-cover">
						<img
							className="rn-account-thumb-cover-img"
							title="User's cover"
							src={ api.storage + this.state.user.cover }
							alt="Cover"
						/>
						{
							(cookieControl.get("authdata").id === this.state.user.id) ? (
								<Fragment>
									<input
										type="file"
										className="hidden"
										accept="image/*"
										id="rn-account-thumb-cover-edit"
										onChange={ ({ target: { files: [file] } }) => this.replaceCover(file) }
									/>
									<label htmlFor="rn-account-thumb-cover-edit" className="rn-account-thumb-cover-addonplace rn-account-thumb-cover-edit definp">
										<i className="fas fa-camera-retro" />
										<span>Edit Cover</span>
									</label>
								</Fragment>
							) : (
								<div className="rn-account-thumb-cover-addonplace rn-account-thumb-cover-subfr">
									{
										[
											{
												title: (!this.state.user.isSubscribed) ? "Subscribe" : "Subscribed",
												active: this.state.user.isSubscribed,
												blocked: false,
												action: this.toggleSubscription
											},
											{
												title: (this.state.user.isFriend) ? "Friend" : (this.state.user.isWaitingFriend) ? (
													"Accept request"
												) : (this.state.user.isTrialFriend) ? "Cancel request" : "Add friend",
												active: this.state.user.isFriend || this.state.user.isTrialFriend,
												blocked: false,
												loading: this.state.friendProcessing,
												action: this.toggleFriend
											},
											{
												title: <i className="far fa-comment-alt" />,
												active: false,
												blocked: !this.state.user.hasClientConversation && !this.state.user.isFriend,
												loading: false,
												action: () => {
													if(!this.state.user.hasClientConversation && !this.state.user.isFriend) return;

													this.props.history.push(`${ links["CHAT_PAGE"].absolute }/${ this.state.user.id }`);
													this.props.refreshDock();
												}
											}
										].map(({ title, active, action, blocked, loading }, index) => (
											<button
												key={ index }
												onClick={ action }
												className={ `rn-account-thumb-cover-subfr-btn definp${ (!active) ? "" : " active" }${ (!blocked) ? "" : " blocked" }${ (!loading) ? "" : " loading" }` }>
												{ (!loading) ? null : (
													<img src={ placeholderGIF } alt="placeholder" className="__placeholder__ rn-account-thumb-cover-subfr-btn-loader" />
												) }
												{ title }
											</button>
										))
									}
								</div>
							)
						}
					</div>
					<div className="rn-account-thumb-nav">
						<div className="rn-account-thumb-nav-img">
							<div className="rn-account-thumb-nav-img-mat">
								<img src={ api.storage + this.state.user.avatar } alt="User" title="User's avatar" />
								<input
									className="hidden"
									onChange={ ({ target: { files: [main] } }) => this.replaceAvatar(main) }
									id="rn-account-thumb-nav-img-mat-newfile"
									accept="image/*"
									type="file"
								/>
								{
									(this.props.userdata.id === this.state.user.id) ? (
										<div className="rn-account-thumb-nav-img-replace">
											<label htmlFor="rn-account-thumb-nav-img-mat-newfile" className="definp">
												<i className="fas fa-camera" />
											</label>
										</div>
									) : null
								}
							</div>
							<div className="rn-account-thumb-nav-name">
								<span>{ this.state.user.name }</span>
								<BandsRail
									labels={ this.state.user.bands }
								/>
							</div>
						</div>
						<ThumbNavButton
							title="Timeline"
							counter={ this.state.user.postsInt || 0 }
							active={ this.state.stage === "TIMELINE_STAGE" }
							ei={ false }
							_onClick={ () => this.setGlobalStage("TIMELINE_STAGE") }
						/>
						<ThumbNavButton
							title="Friends"
							counter={ this.state.user.friendsInt || 0 }
							active={ this.state.stage === "FRIENDS_STAGE" }
							ei={ false }
							_onClick={ () => this.setGlobalStage("FRIENDS_STAGE") }
						/>
						<ThumbNavButton
							title="Gallery"
							counter={ this.state.user.galleryImages || 0 }
							active={ this.state.stage === "GALLERY_STAGE" }
							ei={ false }
							_onClick={ () => this.setGlobalStage("GALLERY_STAGE") }
						/>
						<ThumbNavButton
							title="About"
							counter={ null }
							active={ this.state.stage === "ABOUT_STAGE" }
							ei={ false }
							_onClick={ () => this.setGlobalStage("ABOUT_STAGE") }
						/>
					</div>
				</div>
				<div className="rn-account-display">
					<div className={ `rn-account-display-item rn-account-display-timeline iostyle${ (this.state.stage !== "TIMELINE_STAGE") ? "" : " visible" }` }>
						{
							(!this.state.user.posts) ? (
								<Loadericon />
							) : (
								this.state.user.posts.map(({ id, content, creator, time, likesInt, isLiked, commentsInt, images, comments, parentScreen }, index) => (
									<TimelineItem
										key={ id }
										id={ id }
										content={ content }
										creator={ creator }
										time={ time }
										likesInt={ likesInt }
										isLiked={ isLiked }
										commentsInt={ commentsInt }
										images={ images }
										comments={ comments }
										parentScreen={ this.screenRef }
									/>
								))
							)
						}
						{
							(!this.state.timelineFetching) ? null : (
								<div>
									<Loadericon
										style={{
											marginTop: "15px",
											marginLeft: "inherit",
										}}
									/>
								</div>
							)
						}
					</div>
					<div className={ `rn-account-display-item rn-account-display-friends${ (this.state.stage !== "FRIENDS_STAGE") ? "" : " visible" }` }>
						<div className="rn-account-display-item-title">
							Friends
						</div>
						<div className="rn-account-display-friends-nav">
							<div className="rn-account-display-friends-nav-mat">
								<ThumbNavButton
									title="All Friends"
									counter={ this.state.user.friendsInt }
									active={ this.state.friendsStage === "MAIN_STAGE" }
									ei={ true }
									_onClick={ () => this.setFriendsStage("MAIN_STAGE") }
								/>
								{
									(this.state.user.id !== this.props.userdata.id) ? null : (
										<ThumbNavButton
											title="Friend Requests"
											counter={ this.state.user.waitingFriendsInt }
											active={ this.state.friendsStage === "REQUESTS_STAGE" }
											ei={ true }
											_onClick={ () => this.setFriendsStage("REQUESTS_STAGE") }
										/>
									)
								}
							</div>
							<div className="rn-account-display-friends-nav-ss">
								<FriendsSearch
									submitValue={ this.searchFriends }
								/>
							</div>
						</div>
						<div className="rn-account-display-friends-nav-grid">
							{
								(!this.state.friendsLoading) ? (
									(this.state.friendsSearch || this.state.friendsDisplay).map(({ name, avatar, id, mutualFriendsInt: a }) => (
										<FriendsGridFriend
											key={ id }
											id={ id }
											name={ name }
											avatar={ avatar }
											userID={ this.state.user.id }
											clientID={ this.props.userdata.id }
											mutualFriends={ (Number.isInteger(a)) ? a : null }
											submitAction={ action => (this.state.friendsStage === "MAIN_STAGE") ? (
												this.executeFriend(id, action)
											) : (
												(this.state.friendsStage === "REQUESTS_STAGE") ? (
													this.addFriendManual(id, action)
												) : null
											) }
											currentStage={ this.state.friendsStage }
										/>
									))
								) : (
									<Loadericon />
								)
							}
							{
								(!this.state.friendsSearch || this.state.friendsSearch.length || this.state.friendsLoading) ? null : (
									<p className="rn-account-display-friends-nav-grid-alertion">
										Nothing here...
										<span role="img" aria-label="Oops smile">😓</span>
									</p>
								)
							}
						</div>
					</div>
					<div className={ `rn-account-display-item rn-account-display-gallery iostyle${ (this.state.stage !== "GALLERY_STAGE") ? "" : " visible" }` }>
						{
							(!cookieControl.get("authdata")) ? null : (
								<div className="rn-account-display-gallery-new">
									<input
										type="file"
										id="rn-account-display-gallery-new-mat"
										className="hidden"
										accept="image/*"
										onChange={ ({ target: { files: [file] } }) => this.uploadImage(file) }
									/>
									<label htmlFor="rn-account-display-gallery-new-mat" className="rn-account-display-gallery-new-mat definp">
										<i className="fas fa-plus" />
									</label>
								</div>
							)
						}
						<div className="rn-account-display-gallery-grid">
							{
								(!this.state.user.gallery) ? (
									<Loadericon />
								) : (
									(this.state.user.gallery.length) ? (
										this.state.user.gallery.map(({ id, url }) => (
											<GalleryItem
												key={ id }
												id={ id }
												url={ url }
												_onClick={ () => this.props.openPhoto(id) }
											/>
										))
									) : (
										<p className="rn-account-display-gallery-grid-alertion">Nothing here</p>
									)
								)
							}
						</div>
					</div>
					<div className={ `rn-account-display-item rn-account-display-about${ (this.state.stage !== "ABOUT_STAGE") ? "" : " visible" }` }>
						{
							(!this.state.descriptionLoading || [null, undefined].includes(this.state.user.description)) ? (
								<Fragment>
									{
										(this.state.user.id !== this.props.userdata.id) ? null : (
											<div className="rn-account-display-about-editsw">
												<span>{ this.state.descriptionStatus || "Edit" }</span>
												<Switch
													_onChange={ value => {
														if(!value) {
															this.setState({ aboutMeEditing: value }, this.updateAbout);
														} else {
															this.setState({
																aboutMeEditing: value,
																descriptionStatus: null
															});
														}
													} }
												/>
											</div>
										)
									}
									<p
										className={ `rn-account-display-about-mat definp${ (this.state.user.id !== this.props.userdata.id) ? "" : " mine" }` }
										ref={ ref => this.descriptionNewRef = ref }
										contentEditable={ (this.state.user.id === this.props.userdata.id && this.state.aboutMeEditing) }
										suppressContentEditableWarning={ true }>
										{ this.state.user.description }
									</p>
								</Fragment>
							) : (
								<Loadericon />
							)
						}
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ({ user: { userdata } }) => ({
	userdata
});

const mapActionsToProps = {
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } }),
	openPhoto: payload => ({ type: 'TOGGLE_PHOTO_MODAL', payload }),
	setUserData: payload => ({ type: 'SET_USER_DATA', payload }),
	refreshDock: () => ({ type: "REFRESH_DOCK", payload: null })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(App);