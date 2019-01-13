import React, { Component, Fragment } from 'react';
import './main.css';

import { connect } from 'react-redux';
import { gql } from 'apollo-boost';
import { Link } from 'react-router-dom';

import client from '../../apollo';
import { cookieControl } from '../../utils';
import api from '../../api';
import links from '../../links';

import LoadingIcon from '../__forall__/loader.icon';
import FeedItem from '../__forall__/post';
import NewGridPhoto from '../__forall__/gridphoto';

class NewAddonsBtn extends Component {
	render() {
		if(this.props._type === 'photo') {
			return(
				<Fragment>
					<input
						type="file"
						className="hidden"
						accept="image/*"
						multiple
						onChange={ ({ target: { files } }) => this.props.onUpload(files) }
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
		this.inputRef = React.createRef();
	}

	componentWillUnmount() {
		this.state.previewPhotos.forEach(io => {
			URL.revokeObjectURL(io.url);
		});
	}

	setValue = (field, value) => {
		if(field === 'photos') {
			if(!value || !value.length) return;

			let pics = [],
				picsPrev = [],
				id = this.state.photos.length;
				
			for(let ma = 0; ma < value.length; ma++) {
				let io = value[ma];
				pics.push({
					file: io,
					id: id + ma
				});
				picsPrev.push({
					url: URL.createObjectURL(io),
					id: id + ma
				});
			}

			return this.setState(({ photos, previewPhotos }) => ({
				photos: [
					...pics,
					...photos
				],
				previewPhotos: [
					...picsPrev,
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
			This function can be called when the item doesn't exist in the photo array.
			You may not find an item in the main photo array,
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

	publish = () => {
		// Send to main component
			// Get data
		const { text, photos } = this.state;
			// Push all images to array
		let images = [];
		photos.forEach(io => {
			let a = io.file;
			if(a) images.push(a);
			else console.err("Image was not loaded correctly! NEW POST |COMPONENT : PUBLISH |FUNCTION!PRIMARY", a); // debug
		})
			// Send
		this.props.onPublish(text, images);

		// Set to default
		this.inputRef.value = this.lastPhotoErrorUrl = "";
		this.setState(() => ({
			text: "",
			photos: [],
			previewPhotos: []
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
						<Link className="rn-feed-new-main-image-overlay" to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.userID }` } onClick={ this.props.onOpenAccount }>
							<img alt="you" title="Your photo" src={ this.props.uavatar } />
						</Link>
					</div>
					<div className="rn-feed-new-main-field_control">
						<textarea
							className="rn-feed-new-main-field definp"
							placeholder="How is your day going?"
							ref={ ref => this.inputRef = ref }
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
					<button className="rn-feed-new-addons-submit definp" onClick={ this.publish }>Post</button>
				</div>
			</div>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			posts: false,
			isPosting: false
		}

		this.screenRef = React.createRef();
	}

	componentDidMount() {
		// Fetch data from the API
		let { id } = cookieControl.get("authdata"),
			errorTxt = "Sorry, we couldn't load your feed. Please, restart the page.";

		client.query({
			query: gql`
				query($id: ID!) {
					getFeed(id: $id) {
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
			`,
			variables: {
				id
			}
		}).then(({ data: { getFeed } }) => {
			if(!getFeed) return this.props.castError(errorTxt);

			this.setState(() => ({
				posts: getFeed
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	publishPost = (text, images) => {
		if((!text || !text.replace(/\s|\n/g, "").length) && (!images || !images.length)) return;

		let { id } = cookieControl.get("authdata"),
			errorTxt = "We couldn't publish your post. Please, try later.";

		let sQr = pl => this.setState(() => ({ isPosting: pl }));
		sQr(true);

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $content: String, $images: [Upload!]) {
				  publishPost(
				    id: $id,
				    content: $content,
				    images: $images
				  ) {
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
			`,
			variables: {
				id, images,
				content: text
			}
		}).then(({ data: { publishPost: post } }) => {
			sQr(false);
			if(!post) return this.props.castError(errorTxt);

			this.setState(({ posts }) => ({
				posts: (posts) ? ([ post, ...posts ]) : [post]
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	render() {
		return(
			<div className="rn rn-feed" ref={ ref => this.screenRef = ref }>
				<New
					uavatar={
						((this.props.userdata &&
							Object.keys(this.props.userdata).length &&
							api.storage + this.props.userdata.avatar)
						|| "")
					}
					onPublish={ this.publishPost }
					onOpenAccount={ this.props.refreshDock }
					userID={ (this.props.userdata && this.props.userdata.id) || undefined }
				/>
				{
					(!this.state.isPosting) ? null : (
						<LoadingIcon
							style={{
								marginTop: "0px",
								marginBottom: "10px",
								marginLeft: "inherit"
							}}
						/>
					)
				}
				{
					(this.state.posts !== false) ? (
						this.state.posts.map(({ id, content, isLiked, creator, time, commentsInt, likesInt, images, comments }) => (
							<FeedItem
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
					) : (
						<LoadingIcon
							style={{
								marginLeft: "inherit"
							}}
						/>
					)
				}
			</div>
		);
	}
}

const mapStateToProps = ({ user: { userdata }, session: { dockRefresher } }) => ({
	userdata,
	refreshDock: dockRefresher
});

const mapActionsToProps = {
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(App);