import React, { Component, Fragment } from 'react';
import './main.css';

import NewGridPhoto from '../gridphoto';

import { connect } from 'react-redux';
import { gql } from 'apollo-boost';

import client from '../../../apollo';
import api from '../../../api';
import { cookieControl, convertTime } from '../../../swissKnife';

class FeedItemCollageImage extends Component {
	componentDidMount() {
		this.forceUpdate();
	}

	render() {
		return(
			<div onClick={ () => this.props._onClick } className={ `rn-feed-mat-item-collage-image${ (!this.props.isOld) ? "" : " old" }${ (!this.props.isActive) ? "" : " active" }${ (!this.props.isNew) ? "" : " new" }` }>
				<img src={ api.storage + this.props.image } alt="in" title="Image" />
			</div>
		);
	}
}

class FeedItemCollage extends Component {
	constructor(props) {
		super(props)

		this.state = {
			collageCursor: 0,
			touchCursorPos: null
		}
	}

	handleSlideCollage = a => {
		let pos = this.state.touchCursorPos;
		if(!pos) return;

		let b = 10, // for x
			e = 15, // for y
			c = this.props.images.length - 1,
			d = d => this.setState(({ collageCursor: d1 }) => ({
				collageCursor: d1 + d < 0 ? 0 : d1 + d > c ? c : d1 + d,
				touchCursorPos: null
			}));

		if(
			(a.y < pos.x && pos.x - a.y > e) || // top
			(a.y > pos.x && a.y - pos.x > e) // bottom
		) return;
		if(a > pos.x + b) {
			d(-1);
		} else if(a + b < pos.x) {
			d(1);
		}
	}

	render() {
		return(
			<div className="rn-feed-mat-item-collage_control">
				<div
					className="rn-feed-mat-item-collage"
					onTouchStart={ ({ nativeEvent: { touches } }) => this.setState({ touchCursorPos: { x: touches[0].clientX, y: touches[0].clientY } }) }
					onTouchMove={ ({ nativeEvent: { touches } }) => this.handleSlideCollage(touches[0].clientX, touches[0].clientY) }
					onTouchEnd={ () => this.setState({ touchCursorPos: null }) }>
					<div className="rn-feed-mat-item-collage-controlscc">
						{
							(this.state.collageCursor !== 0) ? (
								<div
									className="rn-feed-mat-item-collage-controls left"
									onClick={ () => this.setState(({ collageCursor: a }) => ({ collageCursor: a - 1 })) }>
									<i className="fas fa-angle-left" />
								</div>
							) : null
						}
						{
							(this.state.collageCursor !== this.props.images.length - 1) ? (
								<div
									className="rn-feed-mat-item-collage-controls right"
									onClick={ () => this.setState(({ collageCursor: a }) => ({ collageCursor: a + 1 })) }>
									<i className="fas fa-angle-right" />
								</div>
							) : null
						}
					</div>
					{
						this.props.images.map(({ url, id }, index) => (
							<FeedItemCollageImage
								key={ index }
								image={ url }
								isNew={ this.state.collageCursor < index }
								isActive={ this.state.collageCursor === index }
								isOld={ this.state.collageCursor > index }
								_onClick={ () => id } // open
							/>
						))
					}
				</div>
				<div className="rn-feed-mat-item-collage_control-progress">
					{
						this.props.images.map((_, index) => (
							<div
								key={ index }
								className="rn-feed-mat-item-collage_control-progress-dot"
								active={ (this.state.collageCursor === index).toString() }
								onClick={ () => this.setState({ collageCursor: index }) }
							/>
						))
					}
				</div>
			</div>
		);
	}
}

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

class FeedItemComment extends Component {
	render() {
		return(
			<div className="rn-feed-mat-item-comments-comment">
				<div className="rn-feed-mat-item-comments-comment-avatar">
					<img src={ ((this.props.creator.avatar && api.storage + this.props.creator.avatar) || "") } alt="creator" title="Creator's avatar" />
				</div>
				<div className="rn-feed-mat-item-comments-comment-content">
					<span className="rn-feed-mat-item-comments-comment-content-mat">
						{ this.props.content }
					</span>
					<div className="rn-feed-mat-item-comments-comment-content-controls">
						<button className="rn-feed-mat-item-comments-comment-content-controls-like definp">
							Like ({ this.props.likesInt })
						</button>
						<span className="rn-feed-mat-item-comments-comment-content-controls-space">·</span>
						<span className="rn-feed-mat-item-comments-comment-content-controls-time">{ convertTime(this.props.time, "ago") }</span>
					</div>
				</div>
			</div>
		);
	}
}

class FeedItemCommentinput extends Component {
	constructor(props) {
		super(props);

		this.state = {
			text: "",
			images: [],
			imagesPreview: []
		}

		this.lastPhotoErrorUrl = "";
	}

	componentWillUnmount() {
		this.state.imagesPreview.forEach(io => {
			URL.revokeObjectURL(io);
		});
	}

	setCommentValue = (field, value) => {
		if(field === 'images') {
			if(!value || !value.length) return;

			let a = [],
				b = [],
				c = this.state.images.length;

			for(let ma = 0; ma < value.length; ma++) {
				let io = value[ma];
				a.push({
					file: io,
					id: c + ma
				});
				b.push({
					url: URL.createObjectURL(io),
					id: c + ma
				});
			}

			return this.setState(({ images, imagesPreview }) => ({
				images: [
					...a,
					...images
				],
				imagesPreview: [
					...b,
					...imagesPreview
				]
			}));
		}

		this.setState(({ comment }) => ({
			comment: {
				...comment,
				[field]: value
			}
		}));
	}

	deleteImage = id => {
		let a = Array.from(this.state.images),
			b = Array.from(this.state.imagesPreview);

		a.splice(a.findIndex(io => io.id === id), 1);

		let c = b.findIndex(io => io.id === id);
		URL.revokeObjectURL(b[c].url);
		b.splice(c, 1);

		this.setState(() => ({
			images: a,
			imagesPreview: b
		}));
	}

	recordImageError = (id, url) => {
		if(this.lastPhotoErrorUrl === url) return;
		this.lastPhotoErrorUrl = url;

		let a = Array.from(this.state.images);
		a.splice(a.findIndex(io => io.id === id), 1);
		{
			let b = this.state.imagesPreview;
			URL.revokeObjectURL(b[b.findIndex(io => io.id === id)].url);
		}
		this.setState(() => ({ images: a }));
	}

	render() {
		return(
			<form className="rn-feed-mat-item-commentinput" onSubmit={ e => e.preventDefault() }>
				<div className="rn-feed-mat-item-commentinput-avatar">
					{
						(!this.state.imagesPreview.length) ? null : (
							<div className="rn-feed-mat-item-commentinput-avatar-photospreview">
								{
									this.state.imagesPreview.slice(0, 4).map(({ id, url }, index) => (
										<NewGridPhoto
											key={ index }
											image={ url }
											id={ id }
											inSphere={ true }
											onDelete={ () => this.deleteImage(id, url) }
											_onError={ () => this.recordImageError(id) }
										/>
									))
								}
							</div>
						)
					}
					<img src={ this.props.uavatar } alt="you" title="Your avatar" />
				</div>
				<input
					className="rn-feed-mat-item-commentinput-input definp"
					placeholder="Write a comment..."
					title="Leave your comment"
					ref={ ref => this.props._onRef(ref) }
					onChange={ ({ target: { value } }) => this.setCommentValue('text', value) }
				/>
				<div className="rn-feed-mat-item-commentinput-controls">
					<input
						type="file"
						id={ `rn-feed-mat-item-commentinput-controls-file-${ this.props.rootId }` } // ARE YOU FUCKEN SRSLY??? I HATE MYSELF
						className="hidden"
						accept="image/*"
						multiple
						onChange={ ({ target: { files } }) => {
							this.setCommentValue('images', files);
						} }
					/>
					<label htmlFor={ `rn-feed-mat-item-commentinput-controls-file-${ this.props.rootId }` } className="rn-feed-mat-item-commentinput-controls-btn definp">
						<i className="fas fa-camera-retro" />
					</label>
				</div>
			</form>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			likesInt: null,
			isLiked: null,
			commentsInt: null
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

	sendFeedback = event => {
		switch(event) {
			case 'LIKE_ACTION': {
				if(this.state.fetchingLike) return;

				this.setState(({ likesInt: a, isLiked: b }, { isLiked: c, likesInt: d }) => ({
					likesInt: (Number.isInteger(a)) ? (!b) ? a + 1 : a - 1 : (!c) ? d + 1 : d - 1,
					isLiked: (typeof b === 'boolean') ? !b : !c,
					fetchingLike: true
				}));

				let { id, authToken } = cookieControl.get("authdata"),
					errorTxt = "We couldn't like this tweet. Please, try again."

				client.mutate({
					mutation: gql`
						mutation($id: ID!, $authToken: String!, $targetID: ID!) {
						  likePost(
						    id: $id,
						    authToken: $authToken,
						    targetID: $targetID
						  ) {
						    id,
						    likesInt,
						    isLiked(id: $id)
						  }
						}
					`,
					variables: {
						id, authToken,
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
			case 'COMMENT_ACTION':break;
			default:break;
		}
	}

	render() {
		return(
			<div className="rn-feed-mat-item rn-feed-item">
				<div className="rn-feed-mat-item-head">
					<div className="rn-feed-mat-item-head-info">
						<div className="rn-feed-mat-item-head-info-avatar">
							<img src={ ((this.props.creator.avatar && api.storage + this.props.creator.avatar) || "") } alt="creator" title="Creator's avatar" />
						</div>
						<div className="rn-feed-mat-item-head-info-mat">
							<div className="rn-feed-mat-item-head-info-mat-name">
								{ this.props.creator.name }
							</div>
							<p className="rn-feed-mat-item-head-info-mat-date">{ convertTime(this.props.time, "ago") }</p>
						</div>
					</div>
				</div>
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
									this.props.parentScreen.scrollTo({
										top: this.commentInputRef.getBoundingClientRect().top,
										behavior: 'smooth'
									});
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
						this.props.comments.map(({ id, content, creator, likesInt, time }) => (
							<FeedItemComment
								key={ id }
								id={ id }
								content={ content }
								creator={ creator }
								time={ time }
								likesInt={ likesInt }
							/>
						))
					}
					<button className="rn-feed-mat-item-comments-loadmore definp">
						Load more (limit as notificator)
					</button>
				</div>
				<FeedItemCommentinput
					uavatar={ ((this.props.userdata && Object.keys(this.props.userdata).length && api.storage + this.props.userdata.avatar) || "") }
					_onRef={ ref => this.commentInputRef = ref }
					_onSubmit={ () => this.sendFeedback('COMMENT_ACTION') }
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
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(App);