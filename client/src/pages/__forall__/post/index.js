import React, { Component } from 'react';
import './main.css';

import NewGridPhoto from '../gridphoto';

import { connect } from 'react-redux';

import api from '../../../api';
import { convertTime } from '../../../swissKnife';

class FeedItemCollageImage extends Component {
	render() {
		return(
			<div className={ `rn-feed-mat-item-collage-image${ (!this.props.isOld) ? "" : " old" }${ (!this.props.isActive) ? "" : " active" }${ (!this.props.isNew) ? "" : " new" }` }>
				<img src={ this.props.image } alt="in" title="Image" />
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
						this.props.images.map((session, index) => (
							<FeedItemCollageImage
								key={ index }
								image={ session }
								isNew={ this.state.collageCursor < index }
								isActive={ this.state.collageCursor === index }
								isOld={ this.state.collageCursor > index }
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
			<button className="rn-feed-mat-item-feedback-btn definp">
				<div className="rn-feed-mat-item-feedback-btn-icon">
					{ this.props.icon }
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

	componentWillUnmount = () => {
		this.state.imagesPreview.forEach(io => {
			URL.revokeObjectURL(io);
		});
	}

	setCommentValue = (field, value) => {
		if(field === 'image') {
			if(!value) return;

			return this.setState(({ images, imagesPreview }) => ({
				images: [
					{
						file: value,
						id: images.length
					},
					...images
				],
				imagesPreview: [
					{
						url: URL.createObjectURL(value),
						id: images.length
					},
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
					onChange={ ({ target: { value } }) => this.setCommentValue('text', value) }
				/>
				<div className="rn-feed-mat-item-commentinput-controls">
					<input
						type="file"
						id="rn-feed-mat-item-commentinput-controls-file"
						className="hidden"
						onChange={ ({ target: { files } }) => this.setCommentValue('image', files[0]) }
					/>
					<label htmlFor="rn-feed-mat-item-commentinput-controls-file" className="rn-feed-mat-item-commentinput-controls-btn definp">
						<i className="fas fa-camera-retro" />
					</label>
				</div>
			</form>
		);
	}
}

class App extends Component {
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
								<p>{ this.props.creator.name }</p>
							</div>
							<p className="rn-feed-mat-item-head-info-mat-date">{ convertTime(this.props.time, "ago") }</p>
						</div>
					</div>
				</div>
				<p className={ `rn-feed-mat-item-content${ (!this.props.images || !this.props.images.length) ? " single" : ""  }` }>
					{ this.props.content }
				</p>
				{
					(this.props.images) ? null : (
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
								counter: this.props.likesInt
							},
							{
								icon: <i className="far fa-comment" />,
								counter: this.props.commentsInt
							}
						].map(({ icon, counter }, index) => (
							<FeedItemFeedbackButton
								key={ index }
								icon={ icon }
								counter={ counter }
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
				/>
			</div>
		);
	}
}

const mapStateToProps = ({ user: { userdata } }) => ({
	userdata
});

export default connect(
	mapStateToProps
)(App);