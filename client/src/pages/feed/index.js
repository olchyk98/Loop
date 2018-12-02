import React, { Component, Fragment } from 'react';
import './main.css';

const image = 'https://occ-0-726-41.1.nflxso.net/art/c0c0e/af353b54475c9667ac96f986de8003b72edc0c0e.png';

class NewGridPhoto extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoaded: false,
			isError: false
		}
	}

	render() {
		return(
			<Fragment>
				{
					(!this.state.isLoaded) ? (
						<div className={ `rn-feed-new-main-photos-photoplaceholder${ (!this.props.inSphere) ? "" : " sphere" }` } />
					) : null
				}
				<div className={ `rn-feed-new-main-photos-photo${ (!this.props.inSphere) ? "" : " sphere" }${ (this.state.isLoaded) ? "" : " off" }${ (!this.state.isError) ? "" : " error" }` } onClick={ this.props.onDelete }>
					<div className="rn-feed-new-main-photos-photo-delete">
						<i className="fas fa-times" />
					</div>
					<div className="rn-feed-new-main-photos-photo-error">
						<i className="fas fa-exclamation-triangle" />
					</div>
					<img
						src={ this.props.image }
						alt="Grid item"
						title="Photo that you added to this post"
						onLoad={ () => this.setState({ isLoaded: true, isError: false }) }
						onError={ () => this.setState({ isLoaded: true, isError: true }, this.props._onError) }
					/>
				</div>
			</Fragment>
		);
	}
}

class NewAddonsBtn extends Component {
	render() {
		if(this.props._type === 'photo') {
			return(
				<Fragment>
					<input
						type="file"
						className="hidden"
						accept="image/*"
						onChange={ ({ target: { files } }) => this.props.onUpload(files[0]) }
						id={ this.props._id }
					/>
					<label htmlFor={ this.props._id } className="rn-feed-new-btn definp">
						<div>
							<i className="fas fa-camera" />
						</div>
						<span>Photo</span>
					</label>
				</Fragment>
			);
		} else {
			return(
				<button className="rn-feed-new-btn definp">
					<div>
						<i className="fas fa-camera" />
					</div>
					<span>Photo</span>
				</button>
			);
		}
	}
}

class New extends Component {
	constructor(props) {
		super(props);

		this.state = {
			text: "",
			photos: [],
			previewPhotos: []
		}

		this.lastPhotoErrorUrl = "";
	}

	componentWillUnmount() {
		this.state.previewPhotos.forEach(io => {
			URL.revokeObjectURL(io.url);
		});
	}

	setValue = (field, value) => {
		if(field === 'photos') {
			if(!value) return;

			return this.setState(({ photos, previewPhotos }) => ({
				photos: [
					{
						file: value,
						id: photos.length
					},
					...photos
				],
				previewPhotos: [
					{
						url: URL.createObjectURL(value),
						id: photos.length
					},
					...previewPhotos
				]
			}));
		}

		this.setState(() => ({ [field]: value }));
	}

	recordImageError = (id, url) => {
		if(this.lastPhotoErrorUrl === url) return;
		this.lastPhotoErrorUrl = url;

		let a = Array.from(this.state.photos);
		a.splice(a.findIndex(io => io.id === id), 1);
		{
			let b = this.state.previewPhotos;
			URL.revokeObjectURL(b[b.findIndex(io => io.id === id)].url);
		}
		this.setState(() => ({ photos: a }));
	}

	deleteImage = id => {
		/*	--- WARNING ---
			This function can be called when an item doesn't exist in the photo array.
			This means that you may not find an item in the main photo array,
			which can create some kind of problem.
		*/

		let a = Array.from(this.state.photos),
			b = Array.from(this.state.previewPhotos);

		a.splice(a.findIndex(io => io.id === id), 1);

		let c = b.findIndex(io => io.id === id);
		URL.revokeObjectURL(b[c].url);
		b.splice(c, 1);

		this.setState(() => ({
			photos: a,
			previewPhotos: b
		}));
	}

	render() {
		return(
			<div className="rn-feed-new rn-feed-item">
				<div className="rn-feed-new-title">
					<div className="rn-feed-new-title-icon">
						<i className="fas fa-pen-fancy" />
					</div>
					<span className="rn-feed-new-title-mat">
						New Post
					</span>
				</div>
				<div className={ `rn-feed-new-main${ (!this.state.previewPhotos.length) ? "" : " ph-expand" }` }>
					<div className="rn-feed-new-main-image">
						<div className="rn-feed-new-main-image-overlay">
							<img alt="you" title="Your photo" src={ image } />
						</div>
					</div>
					<div className="rn-feed-new-main-field_control">
						<textarea
							className="rn-feed-new-main-field definp"
							placeholder="How is your day going?"
							onChange={ ({ target: { value } }) => this.setValue('text', value) }
						/>
						<div className="rn-feed-new-main-photos">
							{
								this.state.previewPhotos.map(({ url, id }, index) => (
									<NewGridPhoto
										key={ index }
										image={ url }
										id={ id }
										onDelete={ () => this.deleteImage(id) }
										_onError={ () => this.recordImageError(id, url) }
									/>
								))
							}
						</div>
					</div>
				</div>
				<div className="rn-feed-new-addons">
					<div className="rn-feed-new-addons-grid">
						<NewAddonsBtn
							_type="photo"
							_id="rn-feed-new-addons-photo"
							onUpload={ file => this.setValue('photos', file) }
						/>
					</div>
					<button className="rn-feed-new-addons-submit definp">Post</button>
				</div>
			</div>
		);
	}
}

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
			touchCursorX: null
		}
	}

	handleSlideCollage = a => {
		let xpos = this.state.touchCursorX;
		if(!xpos) return;

		let b = 20,
			c = this.props.images.length - 1,
			d = d => this.setState(({ collageCursor: d1 }) => ({
				collageCursor: d1 + d < 0 ? 0 : d1 + d > c ? c : d1 + d,
				touchCursorX: null
			}));

		if(a > xpos + b) {
			d(-1);
		} else if(a + b < xpos) {
			d(1);
		}
	}

	render() {
		return(
			<div className="rn-feed-mat-item-collage_control">
				<div
					className="rn-feed-mat-item-collage"
					onTouchStart={ ({ nativeEvent: { touches } }) => this.setState({ touchCursorX: touches[0].clientX }) }
					onTouchMove={ ({ nativeEvent: { touches } }) => this.handleSlideCollage(touches[0].clientX) }
					onTouchEnd={ () => this.setState({ touchCursorX: null }) }>
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
				<div className="rn-feed-mat-item-collage_control-progress">
					{
						this.props.images.map((_, index) => (
							<div
								key={ index }
								className="rn-feed-mat-item-collage_control-progress-dot"
								active={ (this.state.collageCursor === index).toString() }
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

class FeedItem extends Component {
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

class App extends Component {
	render() {
		return(
			<div className="rn rn-feed">
				<New />
				<FeedItem />
			</div>
		);
	}
}

export default App;