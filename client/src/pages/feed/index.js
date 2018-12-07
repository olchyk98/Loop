import React, { Component, Fragment } from 'react';
import './main.css';

import { connect } from 'react-redux';
import { gql } from 'apollo-boost';

import client from '../../apollo';
import { cookieControl } from '../../swissKnife';
import api from '../../api';

import LoadingIcon from '../__forall__/loader.icon'
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
							<img alt="you" title="Your photo" src={ this.props.uavatar } />
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

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			posts: false
		}
	}

	componentDidMount() {
		// Fetch data from an API
		let { id, authToken } = cookieControl.get("authdata"),
			errorTxt = "Sorry, we couldn't load your feed. Please, restart the page.";

		client.query({
			query: gql`
				query($id: ID!, $authToken: String!) {
					getFeed(id: $id, authToken: $authToken) {
						id,
						content,
						time,
						likesInt,
						commentsInt,
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
							likesInt
						}
					}
				}
			`,
			variables: {
				id, authToken
			}
		}).then(({ data: { getFeed } }) => {
			if(!getFeed) this.props.castError(errorTxt);


			this.setState(() => ({
				posts: getFeed
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	render() {
		return(
			<div className="rn rn-feed">
				<New
					uavatar={
						((this.props.userdata &&
							Object.keys(this.props.userdata).length &&
							api.storage + this.props.userdata.avatar)
						|| "")
					}
				/>
				{
					(this.state.posts !== false) ? (
						this.state.posts.map(({ id, content, creator, time, commentsInt, likesInt, images, comments }) => (
							<FeedItem
								key={ id }
								id={ id }
								content={ content }
								creator={ creator }
								time={ time }
								likesInt={ likesInt }
								commentsInt={ commentsInt }
								images={ images }
								comments={ comments }
							/>
						))
					) : (
						<LoadingIcon />
					)
				}
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