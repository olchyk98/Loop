import React, { Component, Fragment } from 'react';
import './main.css';

import TimelineItem from '../__forall__/post';
import Loadericon from '../__forall__/loader.icon';

import FlipMove from 'react-flip-move';

import { connect } from 'react-redux';
import { gql } from 'apollo-boost';
import { Link } from 'react-router-dom';

import api from '../../api';
import client from '../../apollo';
import { cookieControl } from '../../utils';
import links from '../../links';

const image = 'https://d2v9y0dukr6mq2.cloudfront.net/video/thumbnail/VnxYrY1ux/young-blonde-beautiful-girl-fashion-looks-at-blue-neon-light-portrait-at-night_sujtbljwx_thumbnail-full03.png';

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
			settingsVisible: false,
			settingsMoreINCV: false
		}

		this.settingsRef = React.createRef();
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
					onClick={ () => this.setState(({ settingsVisible: a }) => ({ settingsVisible: !a })) }>
					<i className="fas fa-ellipsis-h" />
					<div
						className={ `rn-account-display-friends-nav-grid-user-set-list${ (this.state.settingsMoreINCV) ? "" : " hidgrad" }${ (!this.state.settingsVisible) ? "" : " visible" }` }
						ref={ ref => this.settingsRef = ref }
						onScroll={ () => this.setState({ settingsMoreINCV: this.settingsRef.scrollTop > 0 }) }>
						<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp">Something</button>
						<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp">Something</button>
						<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp">Something</button>
						<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp">Something</button>
						<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp">Something</button>
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
			stage: "TIMELINE_STAGE", // TIMELINE_STAGE, FRIENDS_STAGE, GALLERY_STAGE
			friendsStage: "MAIN_STAGE",
			user: null,
			friendsDisplay: [],
			friendsLoading: false
		}
	}

	componentDidMount() {
		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "Ehm... Looks like the account is not exists :(";

		client.query({
			query: gql`
				query($id: ID!, $authToken: String!, $targetID: String) {
					user(id: $id, authToken: $authToken, targetID: $targetID) {
						id,
						avatar,
						cover,
						name,
						postsInt,
						galleryImages,
						posts {
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
							comments {
								id,
								content,
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
				id, authToken,
				targetID: this.props.match.params.id || ""
			}
		}).then(({ data: { user } }) => {
			if(!user) {
				this.props.history.push(links["HOME_PAGE"].absolute);
				this.props.refreshDock();
				return this.props.castError(errorTxt);
			}

			this.setState(() => ({
				user
			}));
		}).catch(() => {
			this.props.history.push(links["HOME_PAGE"].absolute);
			this.props.refreshDock();
			this.props.castError(errorTxt);
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

			const { id, authToken } = cookieControl.get("authdata"),
				  errorTxt = "We couldn't load user's gallery. Please, try again."

			client.query({
				query: gql`
					query($id: ID!, $authToken: String!) {
						user(id: $id, authToken: $authToken) {
							id,
							gallery {
								id,
								url
							}
						}
					}
				`,
				variables: {
					id, authToken
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
		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't upload an new avatar. Please, try later.";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $authToken: String!, $avatar: Upload!) {
					setUserAvatar(id: $id, authToken: $authToken, avatar: $avatar) {
						id,
						avatar
					}
				}
			`,
			variables: {
				id, authToken, avatar
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
		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't update your image. Please try again."

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $authToken: String!, $avatar: Upload!) {
					uploadImage(id: $id, authToken: $authToken, avatar: $avatar) {
						id,
						url
					}
				}
			`,
			variables: {
				id, authToken,
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
		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't upload a new cover image. Please, try again.";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $authToken: String!, $cover: Upload!) {
					setUserCover(id: $id, authToken: $authToken, cover: $cover) {
						id,
						cover
					}
				}
			`,
			variables: {
				id, authToken,
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
				const { id, authToken } = cookieControl.get("authdata"),
					  errorTxt = "";

				this.setState(() => ({
					friendsLoading: true
				}));

				client.query({
					query: gql`
						query($id: ID!, $authToken: String!) {
						  user(
						    id: $id,
						    authToken: $authToken
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
						authToken
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
				const { id, authToken } = cookieControl.get("authdata"),
					  errorTxt = "We couldn't load friend requests list. Sorry about that :(";

				this.setState(() => ({
					friendsLoading: true
				}));

				client.query({
					query: gql`
						query($id: ID!, $authToken: String!) {
						  user(
						    id: $id,
						    authToken: $authToken
						  ) {
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
						id, authToken
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

	render() {
		if(!this.state.user) return(
			<div className="rn rn-account">
				<Loadericon />
			</div>
		);

		return(
			<div className="rn rn-account">
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
												title: "Subscribe",
												active: true,
												blocked: false,
												action: () => null
											},
											{
												title: "Add friend",
												active: false,
												blocked: false,
												action: () => null
											}
										].map(({ title, active, action, blocked }, index) => (
											<button
												key={ index }
												onClick={ action }
												className={ `rn-account-thumb-cover-subfr-btn definp${ (!active) ? "" : " active" }${ (!blocked) ? "" : " blocked" }` }>
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
							<span className="rn-account-thumb-nav-name">{ this.state.user.name }</span>
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
							counter="0"
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
					</div>
					<div className={ `rn-account-display-item rn-account-display-friends${ (this.state.stage !== "FRIENDS_STAGE") ? "" : " visible" }` }>
						<div className="rn-account-display-item-title">
							Friends
						</div>
						<div className="rn-account-display-friends-nav">
							<div className="rn-account-display-friends-nav-mat">
								<ThumbNavButton
									title="All Friends"
									counter="238"
									active={ this.state.friendsStage === "MAIN_STAGE" }
									ei={ true }
									_onClick={ () => this.setFriendsStage("MAIN_STAGE") }
								/>
								{
									(this.state.user.id !== this.props.userdata.id) ? null : (
										<ThumbNavButton
											title="Friend Requests"
											counter="2"
											active={ this.state.friendsStage === "REQUESTS_STAGE" }
											ei={ true }
											_onClick={ () => this.setFriendsStage("REQUESTS_STAGE") }
										/>
									)
								}
							</div>
							<div className="rn-account-display-friends-nav-ss">
								<div className="rn-account-display-friends-nav-search">
									<input
										placeholder="Search..."
										type="text"
										className="rn-account-display-friends-nav-search-field definp"
									/>
									<div className="rn-account-display-friends-nav-search-icon">
										<i className="fas fa-search" />
									</div>
								</div>
							</div>
						</div>
						<div className="rn-account-display-friends-nav-grid">
							{
								(!this.state.friendsLoading) ? (
									this.state.friendsDisplay.map(({ name, avatar, id, mutualFriendsInt: a }) => (
										<FriendsGridFriend
											key={ id }
											id={ id }
											name={ name }
											avatar={ avatar }
											mutualFriends={ (Number.isInteger(a)) ? a : null }
										/>
									))
								) : (
									<Loadericon />
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
						<FlipMove className="rn-account-display-gallery-grid">
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
										<p className="rn-account-display-gallery-grid-alertion">Nothing here :|</p>
									)
								)
							}
						</FlipMove>
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