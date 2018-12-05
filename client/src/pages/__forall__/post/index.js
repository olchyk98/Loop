import React, { Component } from 'react';
import './main.css';

import NewGridPhoto from '../gridphoto';

const image = 'https://occ-0-726-41.1.nflxso.net/art/c0c0e/af353b54475c9667ac96f986de8003b72edc0c0e.png';

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
					<img src={ image } alt="creator" title="Creator's avatar" />
				</div>
				<div className="rn-feed-mat-item-comments-comment-content">
					<span className="rn-feed-mat-item-comments-comment-content-mat">
						Hello, World!
						Hello, World!
						Hello, World!
						Hello, World!
						Hello, World!

						Hello, World!
						Hello, World!
						Hello, World!
						Hello, World!
						Hello, World!
						Hello, World!

						Hello, World!
					</span>
					<div className="rn-feed-mat-item-comments-comment-content-controls">
						<button className="rn-feed-mat-item-comments-comment-content-controls-like definp">
							Like (42)
						</button>
						<span className="rn-feed-mat-item-comments-comment-content-controls-space">·</span>
						<span className="rn-feed-mat-item-comments-comment-content-controls-time">3h</span>
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
					<img src={ image } alt="you" title="Your avatar" />
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
	constructor(props) {
		super(props);

		this.images = ["https://www.tripsavvy.com/thmb/Hmy5XouUohrAdoHHKT2bQe4z5EI=/960x0/filters:no_upscale():max_bytes(150000):strip_icc()/sunset-over-riddarholmen-chruch-in-old-town-stockholm-city--sweden-855564060-5ad546a404d1cf0037fbf9b3.jpg", "https://www.thelocal.se/userdata/images/article/1ed5b7db4dc056882b34f3d5645c25b1b5a77fc83976fdb3bb0c58141cc9c6be.jpg", "https://images.movehub.com/wp-content/uploads/2017/09/14170105/Sweden-things-to-know.jpeg", "https://www.enterprise.se/content/dam/ecom/locations/sweden/town-in-sweden-961x540.jpg"];
	}

	render() {
		return(
			<div className="rn-feed-mat-item rn-feed-item">
				<div className="rn-feed-mat-item-head">
					<div className="rn-feed-mat-item-head-info">
						<div className="rn-feed-mat-item-head-info-avatar">
							<img src={ image } alt="creator" title="Creator's avatar" />
						</div>
						<div className="rn-feed-mat-item-head-info-mat">
							<div className="rn-feed-mat-item-head-info-mat-name">
								<p>Oles Odynets</p>
							</div>
							<p className="rn-feed-mat-item-head-info-mat-date">8 hours ago</p>
						</div>
					</div>
				</div>
				<p className="rn-feed-mat-item-content">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, nibh in vulputate bibendum, augue.
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, nibh in vulputate bibendum, augue.
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, nibh in vulputate bibendum, augue.
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, nibh in vulputate bibendum, augue.
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, nibh in vulputate bibendum, augue.
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum, nibh in vulputate bibendum, augue.
				</p>
				<FeedItemCollage
					images={ this.images }
				/>
				<div className="rn-feed-mat-item-feedback">
					{
						[
							{
								icon: <i className="far fa-heart" />,
								counter: 2
							},
							{
								icon: <i className="far fa-comment" />,
								counter: 6
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
					<FeedItemComment />
					<FeedItemComment />
					<FeedItemComment />
					<FeedItemComment />
					<FeedItemComment />
					<FeedItemComment />
					<button className="rn-feed-mat-item-comments-loadmore definp">
						Load more
					</button>
				</div>
				<FeedItemCommentinput />
			</div>
		);
	}
}

export default App;