import React, { Component, Fragment } from 'react';
import './main.css';

import { gql } from 'apollo-boost';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Comment from '../postComment';
import CommentInput from '../postCommentInput';
import Loadericon from '../loader.icon';

import api from '../../../api';
import client from '../../../apollo';
import { convertTime, cookieControl } from '../../../utils';
import links from '../../../links';

class ControlsBtn extends Component {
	render() {
		return(
			<button className="gl-photomodal-mg-controls-btn definp" onClick={ this.props._onClick }>
				<div>
					{ this.props.icon }
				</div>
				<span>{ this.props.title }</span>
			</button>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isActive: false,
			waitID: null,
			data: null,
			isCommenting: false,
			isLiking: false,
			targetLoading: false,
			sm_CommentsOpened: false
		}

		this.unsubscribe = null;
		this.lastImageUrl = "";
		this.commentInputRef = this.commentsDRef = React.createRef();
	}

	componentDidMount() {
		this.unsubscribe = this.props.store.subscribe(() => {
			const { photoModalW: a } = this.props.store.getState().session;

			if(a === this.state.waitID) return;

			this.setState(() => ({
				isActive: !!a,
				waitID: a,
				isCommenting: false,
				targetLoading: true
			}), () => (a) ? this.fetchData() : null);
		});
	}

	componentWillUnMount() {
		(this.unsubscribe && this.unsubscribe());
	}

	fetchData = () => {
		 const a = this.state.waitID,
			   errorTxt = "",
			   { id } = cookieControl.get("authdata");

		 client.query({
		 	query: gql`
				query($id: ID!, $targetID: ID!) {
					image(targetID: $targetID) {
						id,
						url,
						likesInt,
						isLiked(id: $id),
						creator {
							id,
							name,
							avatar
						},
						time,
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
						},
						commentsInt
					}
				}
		 	`,
		 	variables: {
		 		id,
		 		targetID: a
		 	}
		 }).then(({ data: { image } }) => {
		 	if(!image) return this.props.castError(errorTxt);

		 	if(this.lastImageUrl === image.url) {
		 		this.setState(() => ({
		 			targetLoading: false
		 		}));
		 	}

		 	this.lastImageUrl = image.url;

		 	this.setState(() => ({
		 		data: image
		 	}));

		 }).catch((error) => console.log(error) || this.props.castError(errorTxt));
	}

	publishComment = tosend => {
		let { content, image } = tosend;

		if(!content.replace(/\s|\n/g, "").length && !image) return;	

		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't publish your comment. Please, try again.";

		this.setState(() => ({
			isCommenting: true
		}));

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $targetID: ID!, $content: String, $image: Upload) {
					commentItem(id: $id, targetID: $targetID, content: $content, image: $image) {
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
			`,
			variables: {
				id,
				targetID: this.state.data.id,
				content,
				image
			}
		}).then(({ data: { commentItem } }) => {
			this.setState(() => ({
				isCommenting: false
			}));
			if(!commentItem) return this.props.castError(errorTxt);

			this.setState(({ data, data: { commentsInt: a, comments } }) => ({
				data: {
					...data,
					commentsInt: a + 1,
					comments: [
						...comments,
						commentItem
					]
				},
				isCommenting: false
			}), () => {
				this.commentsDRef.scrollTop = this.commentsDRef.scrollHeight;
			});
		}).catch(() => this.props.castError(errorTxt));
	}

	closeModal = () => {
		this.props.store.dispatch({ type: 'TOGGLE_PHOTO_MODAL', payload: null });
		// this.setState(() => ({
		// 	data: null
		// }));
	}

	likeImage = () => {
		if(this.state.isLiking) return;

		this.setState(({ data, data: { isLiked: a, likesInt: b } }) => ({
			data: {
				...data,
				isLiked: !a,
				likesInt: (!a) ? b + 1 : b - 1
			},
			isLiking: true
		}));

		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't submit your like. Please try again."

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $targetID: ID!) {
					likeImage(id: $id, targetID: $targetID) {
						id,
						likesInt,
						isLiked(id: $id)
					}
				}
			`,
			variables: {
				id,
				targetID: this.state.data.id
			}
		}).then(({ data: { likeImage } }) => {
			this.setState(() => ({
				isLiking: false
			}));
			if(!likeImage) return this.props.castError(errorTxt);

			this.setState(({ data }) => ({
				data: {
					...data,
					likesInt: likeImage.likesInt,
					isLiked: likeImage.isLiked
				}
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	render() {
		return(
			<Fragment>
				<div className={ `gl-photomodal_bg${ (!this.state.isActive) ? "" : " active" }` } onClick={ this.closeModal } />
				<div className={ `gl-photomodal${ (!this.state.isActive) ? "" : " active" }` }>
					<section className={ `gl-photomodal-mg${ (!this.state.sm_CommentsOpened) ? "" : " active" }` }>
						<div className="gl-photomodal-mg-mat">
							<img
								onLoad={ () => this.setState({ targetLoading: false }) }
								onError={ () => this.props.castError("We couldn't load this image. Please, try later.") }
								src={ (this.state.data && api.storage + this.state.data.url) }
								alt="modal"
								className={ (!this.state.targetLoading) ? "" : "hidden" }
							/>
							{
								(!this.state.waitID || !this.state.targetLoading) ? null : (
									<Loadericon />
								)
							}
						</div>
						<div className="gl-photomodal-mg-controls">
							{
								[
									{
										title: "Like",
										icon: <div key={ (this.state.data && this.state.data.isLiked) ? "A" : "B" }>
											{
												(this.state.data && this.state.data.isLiked) ? (
													<i className="fas fa-heart" />
												) : (
													<i className="far fa-heart" />
												)
											}
										</div>,
										action: () => (this.state.waitID) ? this.likeImage() : null
									},
									{
										title: "Comment",
										icon: <i className="far fa-comment-alt" />,
										action: (this.state.waitID) ? () => {
											this.commentInputRef.focus();
											this.setState(() => ({
												sm_CommentsOpened: true
											}));
										} : null
									},
									{
										title: "Download",
										icon: <i className="far fa-arrow-alt-circle-down" />,
										action: () => {
											if(!this.state.waitID) return;

											let a = document.createElement("a");
											a.download = "Direct Image";
											a.href = api.storage + this.state.data.url;
											a.click();
										}
									}
								].map(({ title, icon, action }, index) => (
									<ControlsBtn
										key={ index }
										_onClick={ action }
										title={ title }
										icon={ icon }
									/>
								))
							}
						</div>
					</section>
					<section className="gl-photomodal-infoc">
						<div className="gl-photomodal-infoc-account">
							<Link to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.state.data && this.state.data.creator.id }` } onClick={ this.props.refreshDock } className="gl-photomodal-infoc-account-img">
								<img src={ this.state.data && api.storage + this.state.data.creator.avatar } alt="profile user" />
							</Link>
							<Link to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.state.data && this.state.data.creator.id }` } onClick={ this.props.refreshDock } className="gl-photomodal-infoc-account-info">
								<p className="gl-photomodal-infoc-account-info-name">{ this.state.data && this.state.data.creator.name }</p>
								<p className="gl-photomodal-infoc-account-info-date">{ this.state.data && convertTime(this.state.data.time, "ago") }</p>
							</Link>
							<button className="gl-photomodal-infoc-account-closesm definp" onClick={ () => this.setState({ sm_CommentsOpened: false }) }>
								<i className="fas fa-times" />
							</button>
						</div>
						<div className="gl-photomodal-infoc-controls">
							{
								[
									{
										icon: <div key={ (this.state.data && this.state.data.isLiked) ? "A" : "B" }>
											{
												(this.state.data && this.state.data.isLiked) ? (
													<i className="fas fa-heart" />
												) : (
													<i className="far fa-heart" />
												)
											}
										</div>,
										value: (this.state.data && this.state.data.likesInt) || 0,
										action: this.likeImage
									},
									{
										icon: <i className="far fa-comment" />,
										value: (this.state.data && this.state.data.commentsInt) || 0,
										action: () => this.commentInputRef.focus()
									}
								].map(({ icon, value, action }, index) => (
									<button key={ index } className="gl-photomodal-infoc-controls-btn definp" onClick={ action }>
										<div>{ icon }</div>
										<span>{ value }</span>
									</button>
								))
							}
						</div>
						<div className="gl-photomodal-infoc-comments" ref={ ref => this.commentsDRef = ref }>
							{
								((this.state.data && this.state.data.comments) || []).map(({ id, content, creator, time, likesInt, isLiked, image }) => (
									<Comment
										key={ id }
										id={ id }
										content={ content }
										creator={ creator }
										time={ time }
										likesInt={ likesInt }
										isLiked={ isLiked }
										image={ image }
										castError={ this.props.castError }
									/>
								))
							}
						</div>
						{
							(!this.state.isCommenting) ? null : (
								<Loadericon />
							)
						}
						{
							(!this.state.data) ? null : (
								<CommentInput
									uavatar={ ((this.props.userdata && Object.keys(this.props.userdata).length && api.storage + this.props.userdata.avatar) || "") }
									_onRef={ ref => this.commentInputRef = ref }
									_onSubmit={ this.publishComment }
									rootId={ this.state.data.id }
								/>
							)
						}
					</section>
				</div>
			</Fragment>
		);
	}
}

const mapStateToProps = ({ user: { userdata } }) => ({
	userdata
});

const mapActionsToProps = {
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } }),
	refreshDock: () => ({ type: "REFRESH_DOCK", payload: null })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(App);