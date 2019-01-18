import React, { Component, Fragment } from 'react';
import './main.css';

import Loadericon from '../loader.icon';
import FeedItemComment from '../postComment';
import FeedItemCommentinput from '../postCommentInput';
import FeedItemCollage from './FeedItemCollage';
import SelectionList from '../selection.list'

import { connect } from 'react-redux';
import { gql } from 'apollo-boost';
import { Link } from 'react-router-dom';

import client from '../../../apollo';
import api from '../../../api';
import links from '../../../links';
import { cookieControl, convertTime } from '../../../utils';

class FeedItemFeedbackButton extends Component {
	render() {
		return(
			<button className={ `rn-feed-mat-item-feedback-btn definp${ (!this.props.isActive) ? "" : " active" }` } onClick={ this.props._onClick }>
				<div className="rn-feed-mat-item-feedback-btn-icon" key={ (!this.props.isActive) ? 'A' : 'B' }>
					{ (!this.props.isActive) ? this.props.icon : this.props.activeIcon || this.props.icon }
				</div>
				<div className="rn-feed-mat-item-feedback-btn-counter">
					<span>{ this.props.counter }</span>
				</div>
			</button>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			likesInt: null,
			isLiked: null,
			commentsInt: null,
			comments: null,
			isCommenting: false
		}

		this.updateInt = null;
		this.commentInputRef = React.createRef();
	}

	componentDidMount() {
		this.updateInt = setInterval(() => this.forceUpdate(), 50000); // every 50s (50000ms)
	}

	componentWillUnmount() {
		clearInterval(this.updateInt);
	}

	sendFeedback = (event, rsdata = {}) => {
		switch(event) {
			case 'LIKE_ACTION': {
				if(this.state.fetchingLike) return;

				this.setState(({ likesInt: a, isLiked: b }, { isLiked: c, likesInt: d }) => ({
					likesInt: (Number.isInteger(a)) ? (!b) ? a + 1 : a - 1 : (!c) ? d + 1 : d - 1,
					isLiked: (typeof b === 'boolean') ? !b : !c,
					fetchingLike: true
				}));

				const { id } = cookieControl.get("authdata"),
					errorTxt = "We couldn't like this tweet. Please, try again."

				client.mutate({
					mutation: gql`
						mutation($id: ID!, $targetID: ID!) {
						  likePost(
						    id: $id,
						    targetID: $targetID
						  ) {
						    id,
						    likesInt,
						    isLiked(id: $id)
						  }
						}
					`,
					variables: {
						id,
						targetID: this.props.id
					}
				}).then(({ data: { likePost } }) => {
					this.setState(() => ({ fetchingLike: false }));
					if(!likePost) return this.props.castError(errorTxt);

					this.setState(() => ({
						likesInt: likePost.likesInt,
						isLiked: likePost.isLiked
					}));
				}).catch(() => this.props.castError(errorTxt));
			}
			break;
			case 'COMMENT_ACTION': {
				let { content, image } = rsdata;

				if(!content.replace(/\s|\n/g, "").length && !image) return;	

				const { id } = cookieControl.get("authdata"),
					  errorTxt = "We couldn't publish your comment. Please, try again.";

				this.setState(({ commentsInt: a }, { commentsInt: b }) => ({
					isCommenting: true,
					commentsInt: (a) ? a + 1 : b + 1
				}));

				client.mutate({ // *CommentType
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
						targetID: this.props.id,
						content,
						image
					}
				}).then(({ data: { commentItem } }) => {
					this.setState(() => ({
						isCommenting: false
					}));
					if(!commentItem) return this.props.castError(errorTxt);

					this.setState(({ comments: a }, { comments: b }) => ({
						comments: (a) ? [
							...a,
							commentItem
						] : [
							...b,
							commentItem
						]
					}));
				}).catch(() => this.props.castError(errorTxt));
			}
			// eslint-disable-next-line
			break;
			default:break; // isCommenting!!!
		}
	}

	render() {
		return(
			<div className="rn-feed-mat-item rn-feed-item" ref={ ref => (this.props.onRef) ? this.props.onRef(ref) : null }>
				<div className="rn-feed-mat-item-head">
					<div className="rn-feed-mat-item-head-info">
						<Link className="rn-feed-mat-item-head-info-avatar" to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.creator.id }` } onClick={ this.props.refreshDock }>
							<img src={ ((this.props.creator.avatar && api.storage + this.props.creator.avatar) || "") } alt="creator" title="Creator's avatar" />
						</Link>
						<Link className="rn-feed-mat-item-head-info-mat" to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.creator.id }` } onClick={ this.props.refreshDock }>
							<div className="rn-feed-mat-item-head-info-mat-name">
								{ this.props.creator.name }
							</div>
							<p className="rn-feed-mat-item-head-info-mat-date">{ convertTime(this.props.time, "ago") }</p>
						</Link>
						<SelectionList
							values={[
								{
									name: "Delete post",
									action: () => console.log("DELETE POST")
								}
							]}
						/>
					</div>
				</div>
				{
					(this.props.content.replace(/\s|\n/g, "").length) ? (
						<p className={ `rn-feed-mat-item-content${ (!this.props.images || !this.props.images.length) ? " single" : ""  }` }>
							{
								this.props.content.split(' ').map((session, index) => {
									if(!session.match(/#[A-Za-z]+/g)) {
										return session + ' ';
									} else {
										return <Fragment key={ index }><span className="rn-feed-mat-item-content-tag">{ session }</span> </Fragment>;
									}
								})
							}
							
						</p>
					) : null
				}
				{
					(!this.props.images || !this.props.images.length) ? null : (
						<FeedItemCollage
							images={ this.props.images }
						/>
					)
				}
				<div className="rn-feed-mat-item-feedback">
					{
						[
							{
								icon: <i className="far fa-heart" />,
								activeIcon: <i className="fas fa-heart" />,
								counter: (Number.isInteger(this.state.likesInt)) ? this.state.likesInt : this.props.likesInt,
								action: () => this.sendFeedback('LIKE_ACTION'),
								active: (typeof this.state.isLiked === 'boolean') ? this.state.isLiked : this.props.isLiked
							},
							{
								icon: <i className="far fa-comment" />,
								counter: (Number.isInteger(this.state.commentsInt)) ? this.state.commentsInt : this.props.commentsInt,
								action: () => {
									this.commentInputRef.focus();

									if(this.props.parentScreen) {
										this.props.parentScreen.scrollTo({
											top: this.commentInputRef.getBoundingClientRect().top,
											behavior: 'smooth'
										});
									}
								},
								active: false
							}
						].map(({ icon, counter, action, active, activeIcon }, index) => (
							<FeedItemFeedbackButton
								key={ index }
								icon={ icon }
								counter={ counter }
								isActive={ active }
								activeIcon={ activeIcon }
								_onClick={ action }
							/>
						))
					}
				</div>
				<div className="rn-feed-mat-item-comments">
					{
						(this.state.comments || this.props.comments || []).map(({ id, image, content, creator, likesInt, isLiked, time }) => (
							<FeedItemComment
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
					{
						(!this.state.isCommenting) ? null : (
							<Loadericon
								style={{
									height: "15px",
									width: "15px",
									borderWidth: "2px"
								}}
							/>	
						)
					}
					<button className="rn-feed-mat-item-comments-loadmore definp">
						Load more (limit as notificator)
					</button>
				</div>
				<FeedItemCommentinput
					uavatar={ ((this.props.userdata && Object.keys(this.props.userdata).length && api.storage + this.props.userdata.avatar) || "") }
					_onRef={ ref => this.commentInputRef = ref }
					_onSubmit={ data => this.sendFeedback('COMMENT_ACTION', data) }
					rootId={ this.props.id }
				/>
			</div>
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