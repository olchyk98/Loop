import React, { Component } from 'react';
import './main.css';

import NewGridPhoto from '../gridphoto';

class Hero extends Component {
	constructor(props) {
		super(props);

		this.state = {
			text: "",
			image: null,
			imagePreview: null
		}

		this.inputRef = this.fileIRef =  React.createRef();
	}

	componentWillUnmount() {
		URL.revokeObjectURL(this.state.imagePreview);
	}

	setCommentValue = (field, value) => {
		if(field === 'image') {
			if(!value) return;

			return this.setState(() => ({
				image: value,
				imagePreview: URL.createObjectURL(value)
			}));
		}

		this.setState(({ comment }) => ({
			[field]: value
		}));
	}

	deleteImage = () => {
		URL.revokeObjectURL(this.state.imagePreview);
		this.fileIRef.value = [];

		this.setState(() => ({
			image: null,
			imagePreview: null
		}));
	}

	recordImageError = (id, url) => {
		URL.revokeObjectURL(this.state.imagePreview);
		this.fileIRef.value = [];

		this.setState(() => ({
			image: null
		}));
	}

	render() {
		return(
			<form className="rn-feed-mat-item-commentinput" onSubmit={ e => {
				e.preventDefault();

				this.props._onSubmit({
					content: this.state.text,
					image: this.state.image
				});

				this.lastPhotoErrorUrl = this.inputRef.value = "";
				this.fileIRef.value = [];
				this.setState(() => ({
					image: null,
					imagePreview: null,
					text: ""
				}));
			} }>
				<div className="rn-feed-mat-item-commentinput-avatar">
					{
						(!this.state.imagePreview) ? null : (
							<div className="rn-feed-mat-item-commentinput-avatar-photospreview">
								<NewGridPhoto
									image={ this.state.imagePreview }
									inSphere={ true }
									onDelete={ this.deleteImage }
									_onError={ this.recordImageError }
								/>
							</div>
						)
					}
					<img src={ this.props.uavatar } alt="you" title="Your avatar" />
				</div>
				<input
					className="rn-feed-mat-item-commentinput-input definp"
					placeholder="Write a comment..."
					title="Leave your comment"
					ref={ ref => {
						this.inputRef = ref;
						this.props._onRef(ref);
					} }
					onChange={ ({ target: { value } }) => this.setCommentValue('text', value) }
				/>
				<div className="rn-feed-mat-item-commentinput-controls">
					<input
						type="file"
						id={ `rn-feed-mat-item-commentinput-controls-file-${ this.props.rootId }` } // ARE YOU FUCKEN SRSLY??? I HATE MYSELF
						className="hidden"
						accept="image/*"
						ref={ ref => this.fileIRef = ref }
						onChange={ ({ target: { files: [image] } }) => {
							this.setCommentValue('image', image);
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

export default Hero;