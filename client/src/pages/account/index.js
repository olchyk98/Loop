import React, { Component, Fragment } from 'react';
import './main.css';

import TimelineItem from '../__forall__/post';
import Loadericon from '../__forall__/loader.icon';
import PhotoModal from '../__forall__/photo.modal';

import { connect } from 'react-redux';
import { gql } from 'apollo-boost';

import api from '../../api';
import client from '../../apollo';
import { cookieControl } from '../../utils';

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
			<div className="rn-account-display-gallery-grid-photo">
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
				<div className="rn-account-display-friends-nav-grid-user-avatar">
					<img src={ image } alt="User" title="User's avatar" />
				</div>
				<div className="rn-account-display-friends-nav-grid-user-info">
					<span className="rn-account-display-friends-nav-grid-user-info-name">Oles Odynets</span>
					<span className="rn-account-display-friends-nav-grid-user-info-info">15 mutual friends</span>
				</div>
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
			user: null
		}
	}

	componentDidMount() {
		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't load the profile. Please, try later.";

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
			if(!user) return this.props.castError(errorTxt);

			this.setState(() => ({
				user
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	setGlobalStage = stage => {
		if(stage === "GALLERY_STAGE") {
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
		}

		this.setState(() => ({
			stage
		}));
	}

	render() {
		if(!this.state.user) return(
			<div className="rn rn-account">
				<Loadericon />
			</div>
		);

		return(
			<Fragment>
				<PhotoModal
					active={ false }
				/>
				<div className="rn rn-account">
					<div className="rn-account-thumb">
						<div className="rn-account-thumb-cover">
							<img
								className="rn-account-thumb-cover-img"
								title="User's cover"
								src={ api.storage + this.state.user.cover }
								alt="Cover"
							/>
							<input type="file" className="hidden" id="rn-account-thumb-cover-edit" />
							<label htmlFor="rn-account-thumb-cover-edit" className="rn-account-thumb-cover-edit definp">
								<i className="fas fa-camera-retro" />
								<span>Edit Cover</span>
							</label>
						</div>
						<div className="rn-account-thumb-nav">
							<div className="rn-account-thumb-nav-img">
								<img src={ api.storage + this.state.user.avatar } alt="User" title="User's avatar" />
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
										_onClick={ () => this.setState({ friendsStage: "MAIN_STAGE" }) }
									/>
									{
										(!cookieControl.get("authdata")) ? null : (
											<ThumbNavButton
												title="Friend Requests"
												counter="2"
												active={ this.state.friendsStage === "REQUESTS_STAGE" }
												ei={ true }
												_onClick={ () => this.setState({ friendsStage: "REQUESTS_STAGE" }) }
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
								<FriendsGridFriend />
								<FriendsGridFriend />
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
											onChange={ ({ target: { files } }) => null }
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
												/>
											))
										) : (
											<p className="rn-account-display-gallery-grid-alertion">Nothing here :|</p>
										)
									)
								}
							</div>
						</div>
					</div>
				</div>
			</Fragment>
		);
	}
}

const mapStateToProps = ({ user: { userdata } }) => ({
	userdata
});

const mapActionsToProps = {
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(App);