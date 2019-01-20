import React, { Component, Fragment } from 'react';
import './main.css';

import Loadericon from '../__forall__/loader.icon';

import { gql } from 'apollo-boost';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import api from '../../api';
import client from '../../apollo';
import { cookieControl, convertTime } from '../../utils';
import links from '../../links';

import placeholderGIF from '../__forall__/placeholder.gif';

const stickers = {
	"CLOCK_LABEL": require('../__forall__/mg_stickers/alarm-clock.svg'),
	"FOOTBALL_LABEL": require('../__forall__/mg_stickers/american-football.svg'),
	"BACKPACK_LABEL": require('../__forall__/mg_stickers/backpack.svg'),
	"BELL_LABEL": require('../__forall__/mg_stickers/bell.svg'),
	"BLACKBOARD_LABEL": require('../__forall__/mg_stickers/blackboard-1.svg'),
	"BLACKBOARD_SQUARE_LABEL": require('../__forall__/mg_stickers/blackboard.svg'),
	"BOOKS_STAND_LABEL": require('../__forall__/mg_stickers/books-1.svg'),
	"COMPASS_LABEL": require('../__forall__/mg_stickers/compass.svg'),
	"COMPUTER_MOUSE_LABEL": require('../__forall__/mg_stickers/computer-mouse.svg'),
	"DIPLOMA_LABEL": require('../__forall__/mg_stickers/diploma-1.svg'),
	"DIPLOMA_CLOSED_LABEL": require('../__forall__/mg_stickers/diploma.svg'),
	"GLOBE_LABEL": require('../__forall__/mg_stickers/earth-globe.svg'),
	"CYMA_FLASK_LABEL": require('../__forall__/mg_stickers/flask.svg'),
	"GLASSES_LABEL": require('../__forall__/mg_stickers/glasses.svg'),
	"LAMP_LABEL": require('../__forall__/mg_stickers/light-bulb.svg'),
	"MEDAL_LABEL": require('../__forall__/mg_stickers/medal.svg'),
	"NOTEBOOK_LABEL": require('../__forall__/mg_stickers/notebook.svg'),
	"OWL_LABEL": require('../__forall__/mg_stickers/owl.svg'),
	"BRUSH_LABEL": require('../__forall__/mg_stickers/paint-brush.svg'),
	"PALETTE_LABEL": require('../__forall__/mg_stickers/palette.svg'),
	"PHYSICS_LABEL": require('../__forall__/mg_stickers/physics.svg'),
	"SCHOOL_LABEL": require('../__forall__/mg_stickers/school.svg'),
	"SAX_LABEL": require('../__forall__/mg_stickers/scissors.svg'),
	"TUBES_LABEL": require('../__forall__/mg_stickers/test-tubes.svg'),
	"PROV_LABEL": require('../__forall__/mg_stickers/test.svg')
}

const fileTypes = {
	"default": require('../__forall__/mg_filetypes/default.svg'),
	"ai":      require('../__forall__/mg_filetypes/ai.svg'),
	"avi":     require('../__forall__/mg_filetypes/avi.svg'),
	"css":     require('../__forall__/mg_filetypes/css.svg'),
	"csv":     require('../__forall__/mg_filetypes/csv.svg'),
	"dbf":     require('../__forall__/mg_filetypes/dbf.svg'),
	"doc":     require('../__forall__/mg_filetypes/doc.svg'),
	"dwg":     require('../__forall__/mg_filetypes/dwg.svg'),
	"exe":     require('../__forall__/mg_filetypes/exe.svg'),
	"fla":     require('../__forall__/mg_filetypes/fla.svg'),
	"html":    require('../__forall__/mg_filetypes/html.svg'),
	"iso":     require('../__forall__/mg_filetypes/iso.svg'),
	"jpg":     require('../__forall__/mg_filetypes/jpg.svg'),
	"js":      require('../__forall__/mg_filetypes/js.svg'),
	"json":    require('../__forall__/mg_filetypes/json.svg'),
	"mp3":     require('../__forall__/mg_filetypes/mp3.svg'),
	"mp4":     require('../__forall__/mg_filetypes/mp4.svg'),
	"pdf":     require('../__forall__/mg_filetypes/pdf.svg'),
	"png":     require('../__forall__/mg_filetypes/png.svg'),
	"ppt":     require('../__forall__/mg_filetypes/ppt.svg'),
	"psd":     require('../__forall__/mg_filetypes/psd.svg'),
	"rtf":     require('../__forall__/mg_filetypes/rtf.svg'),
	"svg":     require('../__forall__/mg_filetypes/svg.svg'),
	"txt":     require('../__forall__/mg_filetypes/txt.svg'),
	"xls":     require('../__forall__/mg_filetypes/xls.svg'),
	"xml":     require('../__forall__/mg_filetypes/xml.svg'),
	"zip":     require('../__forall__/mg_filetypes/zip.svg')
}

const options = {
	messagesLimit: 20
}

class ConversationMember extends Component {
	static defaultProps = {
		isMoreTrack: false,
		moreInt: 1
	}

	render() {
		return(
			<article className="rn-chat-conversations-item-content-members-item">
				{
					(!this.props.isMoreTrack) ? (
						<img
							className="rn-chat-conversations-item-content-members-item-mg"
							src={ api.storage + this.props.avatar }
							alt="member"
							title="Conversation member"
						/>
					) : (
						<span className="rn-chat-conversations-item-content-members-item-mr">{ this.props.moreInt }+</span>
					)
				}
			</article>
		);
	}
}

class Conversation extends Component {
	static defaultProps = {
		color: "white"
	}

	render() {
		return(
			<div className={ `rn-chat-conversations-item ${ this.props.color || "white" }` }>
				<div onClick={ this.props._onClick } className="rn-chat-conversations-item-previewimg">
					<div className="rn-chat-conversations-item-previewimg-image">
						<img className="rn-chat-conversations-item-previewimg-img" alt="member" src={ (this.props.avatar && api.storage + this.props.avatar) || placeholderGIF } title="Conversation member" />
						{
							(this.props.isSeen) ? null : (
								<div className="rn-chat-conversations-item-previewimg-not" />
							)
						}
					</div>
				</div>
				<div className="rn-chat-conversations-item-content">
					<div className="rn-chat-conversations-item-content-title">
						<div onClick={ this.props._onClick }>
							<span className="rn-chat-conversations-item-content-title-name">{ this.props.name }</span>
							<span className="rn-chat-conversations-item-content-title-placeholder">•</span>
							<span className="rn-chat-conversations-item-content-title-time">{ (this.props.preview && convertTime(this.props.preview.time, "ago", true, true)) || "" }</span>
						</div>
						{
							(!this.props.canLeave) ? null : (
								<div className="rn-chat-conversations-item-content-controls">
									<button className="rn-chat-conversations-item-content-controls-btn definp" onClick={ this.props.leaveConversation }>
										<i className="fas fa-sign-out-alt" />
									</button>
								</div>
							)
						}
					</div>
					<div onClick={ this.props._onClick } className={ `rn-chat-conversations-item-content-last${ (+this.props.contInt > 1) ? "" : " lastinrow" }` }>
						<span className="rn-chat-conversations-item-content-last-name">{ this.props.preview && this.props.preview.creator.name }</span>
						<span className="rn-chat-conversations-item-content-last-content">
							{ this.props.preview && this.props.preview.content }
						</span>
					</div>
					{
						(+this.props.contInt <= 1) ? null : (
							<div className="rn-chat-conversations-item-content-members">
								{
									<ConversationMember
										isMoreTrack={ true }
										moreInt={ this.props.contInt }
									/>
								}
								<ConversationMember
									avatar={ this.props.clientAvatar }
								/>
							</div>
						)
					}
				</div>
			</div>
		);
	}
}

class DisplayMessage extends Component {
	constructor(props) {
		super(props);

		this.refreshInt = null;
	}

	componentDidMount() {
		this.refreshInt = setInterval(() => this.forceUpdate(), 15000);
	}

	componentWillUnmount() {
		clearInterval(this.refreshInt);
	}

	render() {
		if(this.props.type === "STICKER_TYPE") {
			return(
				<article className={ `rn-chat-display-mat-item ${ (!this.props.isClients) ? "contributor" : "client" }` }>
					<div className="rn-chat-display-mat-item-avatar">
						<Link onClick={ this.props.refreshDock } className="rn-chat-display-mat-item-avatar-mat" to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.creator && this.props.creator.id }` }>
							<img src={ (this.props.creator && api.storage + this.props.creator.avatar) || placeholderGIF } alt="contributor's avatar" />
						</Link>
					</div>
					<div className="rn-chat-display-mat-item-content">
						<div><img className="rn-chat-display-mat-item-stickermg" alt="sticker" src={ stickers[this.props.content] } /></div>
						<div className="rn-chat-display-mat-item-content-info">
							{
								(!this.props.isNew) ? null : (
									<Fragment>
										{
											(this.props.isSent) ? (
												<span>Sent</span>
											) : (
												<span>Sending...</span>
											)
										}
										<span className="space">•</span>
									</Fragment>
								)
							}
							<span>{ this.props.creator && this.props.creator.name }</span>
							<span className="space">•</span>
							<span>{ convertTime(this.props.time) }</span>
						</div>
					</div>
				</article>
			);
		} else if(this.props.type === "FILE_TYPE") {
			return(
				<article className={ `rn-chat-display-mat-item file ${ (!this.props.isClients) ? "contributor" : "client" }` }>
					<div className="rn-chat-display-mat-item-avatar">
						<Link onClick={ this.props.refreshDock } className="rn-chat-display-mat-item-avatar-mat" to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.creator && this.props.creator.id }` }>
							<img src={ (this.props.creator && api.storage + this.props.creator.avatar) || placeholderGIF } alt="contributor's avatar" />
						</Link>
					</div>
					<div className="rn-chat-display-mat-item-content">
						<div className="rn-chat-display-mat-item-content-mat" onClick={() => { // download image
							let a = document.createElement("a");
							a.download = "File";
							a.target = "_blank";
							a.href = api.storage + this.props.content;
							a.click();
						}}>
							<div className="rn-chat-display-mat-item-content-fileflash-img">
								<img alt="type" src={(() => {
									let a = this.props.content.match(/[^\\]*\.(\w+)$/),
										b = fileTypes;
									return (a && b[a[1]]) ? b[a[1]] : b.default;
								})()} />
							</div>
						</div>
						<div className="rn-chat-display-mat-item-content-info">
							{
								(!this.props.isNew) ? null : (
									<Fragment>
										{
											(this.props.isSent) ? (
												<span>Sent</span>
											) : (
												<span>Sending...</span>
											)
										}
										<span className="space">•</span>
									</Fragment>
								)
							}
							<span>{ this.props.creator && this.props.creator.name }</span>
							<span className="space">•</span>
							{
								(() => {
									let a = this.props.content.match(/[^\\]*\.(\w+)$/);
									if(a && a[1]) {
										return(
											<Fragment>
												<span>{ a[1].toUpperCase() } file</span>
												<span className="space">•</span>
											</Fragment>
										);
									} else {
										return null;
									}
								})()
							}
							<span>{ convertTime(this.props.time) }</span>
						</div>
					</div>
				</article>
			);
		} else if(this.props.type === "SYSTEM_MESSAGE") {
			return(
				<article className="rn-chat-display-mat-item sys">
					<strong>{ this.props.content }</strong>
				</article>
			);
		} else {
			return(
				<article className={ `rn-chat-display-mat-item ${ (this.props.isClients) ? "client" : "contibutor" }` }>
					<div className="rn-chat-display-mat-item-avatar">
						<Link onClick={ this.props.refreshDock } className="rn-chat-display-mat-item-avatar-mat" to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.creator && this.props.creator.id }` }>
							<img src={ (this.props.creator && api.storage + this.props.creator.avatar) || placeholderGIF } alt="contributor's avatar" />
						</Link>
					</div>
					<div className="rn-chat-display-mat-item-content">
						<div className="rn-chat-display-mat-item-content-mat">
							<span className="rn-chat-display-mat-item-content-mat-text">
								{ this.props.content }
							</span>
							<div className="rn-chat-display-mat-item-content-mat-imgblock">
								{
									this.props.images.map(({ id, url }) => (
										<div className="rn-chat-display-mat-item-content-mat-image" key={ id } onClick={ () => this.props.openPhoto(id) }>
											<img alt="attachment" src={ (url && api.storage + url) || placeholderGIF } />
										</div>
									))
								}
							</div>
						</div>
						<div className="rn-chat-display-mat-item-content-info">
							{
								(!this.props.isNew) ? null : (
									<Fragment>
										{
											(this.props.isSent) ? (
												<span>Sent</span>
											) : (
												<span>Sending...</span>
											)
										}
										<span className="space">•</span>
									</Fragment>
								)
							}
							<span>{ this.props.creator && this.props.creator.name }</span>
							<span className="space">•</span>
							<span>{ convertTime(this.props.time) }</span>
						</div>
					</div>
				</article>
			);
		}
	}
}

class ContUser extends Component {
	render() {
		return(
			<article className="rn-chat-display-contuser">
				<Link to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.id }` } onClick={ this.props.refreshDock }>
					<div className="rn-chat-display-contuser-avatar">
						<img src={ api.storage + this.props.avatar } alt="contributor's avatar" />
					</div>
					<span className="rn-chat-display-contuser-name">{ this.props.name }</span>
				</Link>
				<div>
					{
						(this.props.control) ? (
							(!this.props.isLoading) ? (
								(this.props.isAdd) ? (
									<button className="rn-chat-display-contuser-btn green definp" onClick={ this.props.onAction }>
										<i className="fas fa-plus" />
									</button>
								) : (
									<button className="rn-chat-display-contuser-btn red definp" onClick={ this.props.onAction }>
										<i className="fas fa-trash" />
									</button>
								)
							) : (
								<div className="rn-chat-display-contuser-statusload" />
							)
						) : null
					}
				</div>
			</article>
		);
	}
}

class PortableModal extends Component {
	render() {
		if(this.props.stage === "STICKERS_STAGE") {
			return(
				<Fragment>
					<div className="rn-chat-mm-modalbg" onClick={ this.props.onClose } />
					<div className="rn-chat-mm-modal stickers">
						{
							Object.keys(stickers).map((session, index) => (
								<div
									key={ index }
									onClick={ () => { this.props._onSubmit("STICKER_TYPE", session); this.props.onClose() } }
									className="rn-chat-mm-modal-sticker">
									<img alt="sticker item" src={ stickers[session] } />
								</div>
							))
						}
					</div>
				</Fragment>
			);
		} else {
			return null;
		}
	}
}

class ChatDisplaySettingsPaleteColor extends Component {
	render() {
		return(
			<div
				className={ `rn-chat-display-settings-palete-color${ (!this.props.isActive) ? "" : " active" } ${ (this.props.color) }` }
				onClick={ () => this.props._onClick(this.props.color) }
			/>
		);
	}
}

class ChatDisplayDialogInput extends Component {
	constructor(props) {
		super(props);

		this.state = {
			message: ""
		}

		this.inputRef = React.createRef();
	}

	submitMessage = () => {
		this.props._onSubmit(this.inputRef.value);
		this.inputRef.value = ""
	}

	render() {
		return(
			<form className="rn-chat-display-header-input-field" onSubmit={ e => { e.preventDefault(); this.submitMessage() } }>
				<input
					placeholder="Start typing..."
					className="rn-chat-display-header-field-mat definp"
					ref={ ref => this.inputRef = ref }
				/>
				<div className="rn-chat-display-header-field-send">
					<button type="submit" className="definp">
						<i className="fas fa-fighter-jet" />
					</button>
				</div>
			</form>
		);
	}
}

class PhotoGridImage extends Component {
	render() {
		return(
			<div className={ `rn-chat__in__-photogrid-mat-img${ (!this.props.isActive) ? "" : " selected" }` } onClick={ this.props._onClick }>
				<div className="rn-chat__in__-photogrid-mat-img-check">
					<div>
						<i className="fas fa-check" />
					</div>
				</div>
				<img className="rn-chat__in__-photogrid-mat-img-mat" alt="item" src={ api.storage + this.props.url } />
			</div>
		);
	}
}

class PhotoGrid extends Component {
	constructor(props) {
		super(props);

		this.state = {
			images: false,
			selectedID: []
		}
	}

	componentDidMount() {
		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't fetch your images. Please, try again."

		client.query({
			query: gql`
				query($id: ID!) {
				  user(id: $id) {
				    id,
				    gallery {
				      id,
				      url
				    }
				  }
				}
			`,
			variables: {
				id
			}
		}).then(({ data: { user: { gallery: a } } }) => {
			if(!a) return this.props.castError(errorTxt);

			this.setState(() => ({
				images: a
			}))
		}).catch(() => this.props.castError(errorTxt));
	}

	toggleSelected = id => {
		let a = Array.from(this.state.selectedID);

		if(!a.includes(id)) a.push(id);
		else a.splice(a.findIndex(io => io === id), 1);

		this.setState(() => ({
			selectedID: a
		}));
	}

	render() {
		return(
			<div className="rn-chat__in__-photogrid">
				<div className="rn-chat__in__-photogrid-title">
					<h3>Choose image(s)</h3>
				</div>
				<div className="rn-chat__in__-photogrid-placeholder">
					{
						(this.state.images) ? (
							<div className="rn-chat__in__-photogrid-mat">
								{
									this.state.images.map(({ id, url }) => ( // dev
		 								<PhotoGridImage
		 									key={ id }
		 									url={ url }
		 									isActive={ this.state.selectedID.includes(id) }
		 									_onClick={ () => this.toggleSelected(id) }
		 								/>
									))
								}
							</div>
						) : (
							<Loadericon />
						)
					}
				</div>
				<div className="rn-chat__in__-photogrid-submit">
					<button className="rn-chat__in__-photogrid-submit-mat definp cancel" onClick={ this.props.onClose }>Cancel</button>
					<button className="rn-chat__in__-photogrid-submit-mat definp submit" onClick={ () => this.props._onSubmit(this.state.selectedID) }>Send</button>
				</div>
			</div>
		);
	}
}

class ConversationSettings extends Component {
	constructor(props) {
		super(props);

		this.state = {
			image: null,
			name: null,
			color: null
		}
	}

	setValue = (field, value) => {
		this.setState(() => ({
			[field]: value
		}));
	}

	render() {
		return(
			<div className="rn-chat-display-settings">
				<input
					type="file"
					className="hidden"
					accept="image/*"
					id="rn-chat-display-settings-avatar"
					onChange={ ({ target, target: { files: [file] } }) => {
						if(!file) return;

						this.setValue("image", file);
						target.value = "";
					} }
				/>
				<label htmlFor="rn-chat-display-settings-avatar" className="rn-chat-display-settings-avatar definp">Change image</label>
				<div className="rn-chat-display-settings-name">
					<input
						type="text"
						className="definp"
						placeholder="Name"
						onChange={ ({ target: { value } }) => this.setValue("name", value) }
					/>
				</div>
				<div className="rn-chat-display-settings-palete">
					{
						[
							{
								color: "purple"
							},
							{
								color: "red"
							},
							{
								color: "pink"
							},
							{
								color: "sea"
							},
							{
								color: "clouds"
							},
							{
								color: "orange"
							},
							{
								color: "white"
							}
						].map((session, index) => (
							<ChatDisplaySettingsPaleteColor
								key={ index }
								color={ session.color }
								isActive={ (this.state.color || this.props.color) === session.color }
								_onClick={ () => this.setValue("color", session.color) }
							/>
						))
					}
				</div>
				<button className="rn-chat-display-settings-submit definp" onClick={ () => this.props._onSubmit(this.state.image, this.state.name, this.state.color) }>Submit</button>
			</div>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			stage: "LIST_STAGE", // LIST_STAGE, CHAT_STAGE
			chatStage: "CONVERSATION_STAGE", // CONVERSATION_STAGE, CONTRIBUTORS_STAGE, SETTINGS_STAGE
			contributorsStage: "MAIN_STAGE", // MAIN_STAGE, INVITATIONS_STAGE
			pModalStage: null, // STOPWATCH_STAGE, STICKERS_STAGE
			conversations: null,
			dialog: null,
			photoGrid: false,
			fetchingDialogMessages: false
		}

		this.dialogDisplayRef = React.createRef();
		this.conversationsUPSubscription = this.dialogSubscription = this.dialogSettingsSubscription = null;

		this.internalMounted = false;
	}

	componentDidMount(a) {
		this.internalMounted = true;
		let b = this.props.match.params.id;

		if(!b) this.loadConversationsList();
		else this.openConversation(b);
	}

	componentWillUnmount() {
		this.internalMounted = false;
		(this.dialogSubscription && this.dialogSubscription.unsubscribe());
		(this.dialogSettingsSubscription && this.dialogSettingsSubscription.unsubscribe());
		(this.conversationsUPSubscription && this.conversationsUPSubscription.unsubscribe());
	}

	loadConversationsList = () => {
		const { id } = cookieControl.get("authdata");
		let errorTxt = "We couldn't load your conversations. Please, try again."

		this.setState(() => ({
			conversations: false
		}));

		client.query({
			query: gql`
				query($id: ID!,) {
					user(id: $id,) {
						id,
						conversations {
							id,
							isSeen(id: $id),
							avatar(id: $id),
							contributorsInt,
							color,
							canLeave,
							name(id: $id),
							lastMessage {
								time,
								type,
								content,
								creator {
									name
								}
							}
						}
					}
				}
			`,
			variables: {
				id
			}
		}).then(({ data: { user } }) => {
			if(!this.internalMounted) return;

			if(!user) return this.props.castError(errorTxt);

			this.setState(() => ({
				conversations: user.conversations
			}));
		}).catch(() => this.props.castError(errorTxt));

		errorTxt = "Wohoo. Something went wrong. We're trying to fix it right now."

		this.conversationsUPSubscription = client.subscribe({
			query: gql`
				subscription($id: ID!,) {
					conversationsGridUpdated(id: $id,) {
						id,
						isSeen(id: $id),
						avatar(id: $id),
						contributorsInt,
						color,
						name(id: $id),
						lastMessage {
							time,
							type,
							content,
							creator {
								name
							}
						}
					}
				}
			`,
			variables: {
				id
			}
		}).subscribe({
			next: ({ data: { conversationsGridUpdated: a } }) => {
				if(!a) return this.props.castError(errorTxt);

				let b = Array.from(this.state.conversations);
				b[b.findIndex(io => io.id === a.id)] = a;

				this.setState(() => ({
					conversations: b
				}));
			},
			error: () => this.props.castError(errorTxt)
		});
	}

	openConversation = targetID => {
		(this.dialogSubscription && this.dialogSubscription.unsubscribe());
		(this.dialogSettingsSubscription && this.dialogSettingsSubscription.unsubscribe());
		(this.conversationsUPSubscription && this.conversationsUPSubscription.unsubscribe());

		this.setState(() => ({
			stage: "CHAT_STAGE",
			dialog: false
		}));

		this.fetchableDialogMessages = true;

		const { id } = cookieControl.get("authdata");
		let errorTxt = "We couldn't load this conversation. Please, try later.";

		// Promise.all([])?
		// Load conversation
		client.mutate({
			mutation: gql`
				mutation($id: ID!, $targetID: ID!, $limit: Int) {
					createConversation(id: $id, targetID: $targetID, seeConversation: true) {
						id,
						name(id: $id),
						avatar(id: $id),
						contributorsInt,
						color,
						messages(limit: $limit) {
							id,
							content,
							time,
							type,
							images {
								id,
								url
							},
							creatorID,
							creator {
								id,
								name,
								avatar
							}
						}
					}
				}
			`,
			variables: {
				id,
				targetID,
				limit: options.messagesLimit
			}
		}).then(({ data: { createConversation: a } }) => {
			if(!this.internalMounted) return;
			
			if(!a) return this.props.castError(errorTxt);

			this.setState(() => ({
				dialog: a
			}), this.scrollEndDialog);
			this.fetchableDialogMessages = a.messages.length === options.messagesLimit;

			window.history.pushState(null, `Conversation: ${ targetID }`, links["CHAT_PAGE"].absolute + '/' + targetID);
		}).then(() => {
			this.dialogSubscription = client.subscribe({
				query: gql`
					subscription($id: ID!, $conversationID: ID!) {
					  hookConversationMessage(id: $id, conversationID: $conversationID) {
					    id,
						content,
						time,
						type,
						images {
							id,
							url
						},
						creatorID,
						creator {
							id,
							name,
							avatar
						}
					  }
					}
				`,
				variables: {
					id,
					conversationID: targetID
				}
			}).subscribe({
				next: ({ data: { hookConversationMessage: a } }) => {
					if(
						!a ||
						!this.state.dialog || // This message will be loaded with open conversation fetch request.
						this.state.dialog.messages.findIndex(io => io.id === a.id) !== -1 // few devices on one account in the same conversation
					) return;

					this.setState(({ dialog, dialog: { messages } }) => ({
						dialog: {
							...dialog,
							messages: [
								a,
								...messages
							]
						}
					}), this.scrollEndDialog);
				},
				error: () => this.props.castError(errorTxt)
			});
		}).then(() => {
			this.dialogSettingsSubscription = client.subscribe({
				query: gql`
					subscription($id: ID!, $conversationID: ID!) {
						conversationSettingsUpdated(id: $id, conversationID: $conversationID) {
							id,
							name(id: $id),
							avatar(id: $id)
						}
					}
				`,
				variables: {
					id,
					conversationID: targetID
				}
			}).subscribe({
				next: ({ data: { conversationSettingsUpdated: a } }) => {
					if(!a) return this.props.castError(errorTxt);

					this.setState(({ dialog }) => ({
						dialog: {
							...dialog,
							...a
						}
					}));
				},
				error: () => this.props.castError(errorTxt)
			});
		}).catch(() => this.props.castError(errorTxt));
	}

	fetchDialogMessages = () => {
		if(!this.fetchableDialogMessages || this.state.fetchingDialogMessages || !this.state.dialog) return;

		this.setState(() => ({
			fetchingDialogMessages: true
		}));

		const { id } = cookieControl.get("authdata");

		{
			const { scrollHeight, offsetHeight, scrollTop } = this.dialogDisplayRef;
			var menusScrollTop = Math.abs(scrollTop - (scrollHeight - offsetHeight));
		}

		client.query({
			query: gql`
				query($id: ID!, $targetID: ID!, $limit: Int, $offsetID: ID) {
					conversation(id: $id, targetID: $targetID) {
						id,
						messages(limit: $limit, offsetID: $offsetID) {
							id,
							content,
							time,
							type,
							images {
								id,
								url
							},
							creatorID,
							creator {
								id,
								name,
								avatar
							}
						}
					}
				}
			`,
			variables: {
				id,
				targetID: this.state.dialog.id,
				limit: options.messagesLimit,
				offsetID: this.state.dialog.messages.slice(-1)[0].id
			}
		}).then(({ data: { conversation: a } }) => {
			if(!this.internalMounted) return;

			this.setState(() => ({
				fetchingDialogMessages: false
			}));
			if(!a) return;

			this.setState(({ dialog, dialog: { messages } }) => ({
				dialog: {
					...dialog,
					messages: [
						...messages,
						...a.messages
					]
				}
			}), () => this.dialogDisplayRef.scrollTop = this.dialogDisplayRef.scrollHeight - this.dialogDisplayRef.offsetHeight - menusScrollTop);
			this.fetchableDialogMessages = a.messages.length === options.messagesLimit;
		});
	}

	sendDialogMessage = (type, value) => {
		if(
			!this.state.dialog ||
			!value ||
			(value.replace && !value.replace(/\s|\n/g, "").length)
		) return;

		const { id } = cookieControl.get("authdata"),
			  errorTxt = "An error occured while we tried to send your message. Please, try again.";

		const genID = () => {
			let a = Math.floor(Math.random() * 1500);
			if(this.state.dialog.messages.findIndex(io => io.id === a) !== -1) return this.genID();
			else return a;
		}

		// TODO: Reverse list

		let a = genID();
		this.setState(({ dialog, dialog: { messages } }) => ({
			dialog: {
				...dialog,
				messages: [
					{
						id: a,
						content: (type !== "FILE_TYPE" && type !== "IMAGES_TYPE") ? value : (type === "FILE_TYPE") ? (
							`filename.${ value.name.match(/[^\\]*\.(\w+)$/)[1] }`
						) : "",
						time: +new Date(),
						type,
						images: [],
						creatorID: this.props.userdata.id,
						creator: {
							id: this.props.userdata.id,
							name: this.props.userdata.name,
							avatar: this.props.userdata.avatar,
						},
						isSent: false
					},
					...messages
				]
			}
		}), this.scrollEndDialog);

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $content: Upload!, $type: String!, $conversationID: ID!) {
				  sendMessage(
				  	id: $id,
				    content: $content,
				    type: $type,
				    conversationID: $conversationID
				  ) {
				    id,
					content,
					time,
					type,
					images {
						id,
						url
					},
					creatorID,
					creator {
						id,
						name,
						avatar
					}
				  }
				}
			`,
			variables: {
				id,
				content: value,
				type,
				conversationID: this.state.dialog.id
			}
		}).then(({ data: { sendMessage: message } }) => {
			if(!message) return this.props.castError(errorTxt);

			let aa = Array.from(this.state.dialog.messages),
				ab = aa.findIndex(io => io.id.toString() === a.toString());

			aa[ab] = {
				...message,
				isSent: true
			}

			this.setState(({ dialog }) => ({
				dialog: {
					...dialog,
					messages: aa
				}
			}), this.scrollEndDialog);
		}).catch(() => this.props.castError(errorTxt));
	}

	scrollEndDialog = () => {
		if(!this.dialogDisplayRef) return;

		this.dialogDisplayRef.scrollTop = this.dialogDisplayRef.scrollHeight;
	}

	inviteToConversation = (targetID, name) => {
		const { id } = cookieControl.get("authdata");

		let aqE = aa => {
			let a = Array.from(this.state.dialog.inviteSuggestions);
			a.find(io => io.id === targetID).isLoading = aa;
			this.setState(({ dialog }) => ({
				dialog: {
					...dialog,
					inviteSuggestions: a
				}
			}));
		}
		aqE(true);

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $conversationID: ID!, $targetID: ID!) {
					addUserToConversation(id: $id, conversationID: $conversationID, targetID: $targetID) {
						id,
						name,
						avatar
					}
				}
			`,
			variables: {
				id, targetID,
				conversationID: this.state.dialog.id
			}
		}).then(({ data: { addUserToConversation: b } }) => {
			if(!b) return;
			aqE(false);

			let a = Array.from(this.state.dialog.inviteSuggestions);
			a.splice(a.findIndex(io => io.id === targetID), 1);

			this.setState(({ dialog, dialog: { contributors, contributorsInt } }) => ({
				dialog: {
					...dialog,
					contributors: [
						...contributors,
						b
					],
					contributorsInt: contributorsInt + 1,
					inviteSuggestions: a
				}
			}));
		});
	}

	settingConversation = (avatar, name, color) => {
		if(!this.state.dialog || (!avatar && !name && !color)) return;

		const { id } = cookieControl.get("authdata"),
			  errorTxt = "Something went wrong. Please, try later.";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $conversationID: ID!, $avatar: Upload!, $name: String!, $color: String!) {
					settingConversation(id: $id, conversationID: $conversationID, avatar: $avatar, name: $name, color: $color) {
						id,
						avatar(id: $id),
						name(id: $id)
					}
				}
			`,
			variables: {
				id,
				conversationID: this.state.dialog.id,
				avatar: avatar || "",
				name: name || "", // String(name)? -- bad for performance
				color: color || ""
			}
		}).then(({ data: { settingConversation: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			this.setState(({ dialog }) => ({
				dialog: {
					...dialog,
					...a
				}
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	getDialogContributors = () => {
		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't load this list."

		client.query({
			query: gql`
				query($id: ID!, $targetID: ID!) {
					conversation(id: $id, targetID: $targetID) {
						id,
						contributorsInt,
						contributors {
							id,
							avatar,
							name
						},
						inviteSuggestions(id: $id,) {
							id,
							name,
							avatar
						}
					}
				}
			`,
			variables: {
				id,
				targetID: this.state.dialog.id
			}
		}).then(({ data: { conversation: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			this.setState(({ dialog }) => ({
				dialog: {
					...dialog,
					contributors: a.contributors,
					inviteSuggestions: a.inviteSuggestions,
					contributorsInt: a.contributorsInt
				}
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	deleteDialogContributor = targetID => {
		if(!this.state.dialog || !this.state.dialog.contributors || !targetID) return null;

		const { id } = cookieControl.get("authdata"),
			  errorTxt = "Something went wrong. Please, try again.";

		let arA = aa => {
			let a = Array.from(this.state.dialog.contributors);
			a.find(io => io.id === targetID).isLoading = aa;
			this.setState(({ dialog }) => ({
				dialog: {
					...dialog,
					contributors: a
				}
			}));
		}
		arA(true);

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $conversationID: ID!, $targetID: ID!) {
					kickDialogContributor(id: $id, conversationID: $conversationID, targetID: $targetID) {
						id
					}
				}
			`,
			variables: {
				id,
				conversationID: this.state.dialog.id,
				targetID
			}
		}).then(({ data: { kickDialogContributor: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			arA(false);
			this.getDialogContributors();
		});
	}

	leaveConversation = targetID => {
		if(!this.state.conversations) return;

		const { id } = cookieControl.get("authdata"),
			  errorTxt = "Something went wrong. Please, try later.";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $conversationID: ID!) {
					leaveConversation(id: $id, conversationID: $conversationID) {
						id
					}
				}
			`,
			variables: {
				id,
				conversationID: targetID
			}
		}).then(({ data: { leaveConversation: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			let b = Array.from(this.state.conversations);
			b.splice(b.findIndex(io => io.id === a.id), 1);
			this.setState(() => ({
				conversations: b
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	render() {
		return(
			<div className="rn rn-chat">
				{
					(this.state.stage === "LIST_STAGE") ? (
						<Fragment>
							<div className="rn-chat-search">
								<input
									type="search"
									placeholder="Here you can search through the named dialogs..." // through / in
									className="definp rn-chat-search-field"
									onChange={ ({ target }) => {
										clearTimeout(target.sendInterval);

										const { id } = cookieControl.get("authdata"),
											  errorTxt = "Something went wrong. Please, restart the page";

										target.sendInterval = setTimeout(() => {
											client.query({
												query: gql`
													query($id: ID!, $query: String!) {
														searchConversations(id: $id, query: $query) {
															id,
															isSeen(id: $id),
															avatar(id: $id),
															contributorsInt,
															color,
															name(id: $id),
															lastMessage {
																time,
																type,
																content,
																creator {
																	name
																}
															}
														}
													}
												`,
												variables: {
													id,
													query: target.value
												}
											}).then(({ data: { searchConversations: a } }) => {
												if(!a) return this.props.castError(errorTxt);

												this.setState(() => ({
													conversations: a
												}));
											}).catch(() => this.props.castError(errorTxt));
										}, 300);
									} }
								/>
							</div>
							{
								(this.state.conversations && !this.state.conversations.length) ? (
									<p className="rn-chat-emptyerr">
										Nothing here...
									</p>
								) : null
							}
							<div className="rn-chat-conversations">
								{
									(this.state.conversations === null || this.state.conversations === false) ? (
										(this.state.conversations === null) ? ( // void
											null
										) : ( // loading
											<Loadericon />
										)
									) : (
										this.state.conversations.map(({ id: a, avatar: b, lastMessage: c, color: d, name: e, contributorsInt: f, isSeen: g, canLeave: h }) => (
											<Conversation
												key={ a }
												id={ a }
												avatar={ b }
												name={ e }
												color={ d }
												isSeen={ g }
												canLeave={ h }
												contInt={ f - 1 }
												preview={(c) ? {
													...c,
													content: (c.type === "MESSAGE_TYPE") ? c.content : ({
														"FILE_TYPE": "FILE",
														"IMAGES_TYPE": "IMAGE",
														"STICKER_TYPE": "STICKER"
													}[c.type])
												} : null}
												clientAvatar={ (this.props.userdata && this.props.userdata.avatar) || placeholderGIF }
												_onClick={ () => this.openConversation(a) }
												leaveConversation={ () => this.leaveConversation(a) }
											/>
										))
									)
								}
							</div>
						</Fragment>
					) : (
						(!this.state.photoGrid) ? (
							<div className="rn-chat-display">
								<section className="rn-chat-display-header">
									<div>
										<div className="rn-chat-display-header-image">
											<img src={ (this.state.dialog && this.state.dialog.avatar && api.storage + this.state.dialog.avatar) || placeholderGIF } alt="conversation preview" />
										</div>
										<span className="rn-chat-display-header-title">{ this.state.dialog && this.state.dialog.name }</span>
									</div>
									<div>
										{
											(this.state.chatStage === "CONVERSATION_STAGE") ? null : (
												<button
													className="rn-chat-display-header-control rn-chat-display-header-adduser definp"
													onClick={ () => this.setState({ chatStage: "CONVERSATION_STAGE" }, this.scrollEndDialog) }>
													<i className="fas fa-envelope" />
												</button>
											)
										}
										<button
											className="rn-chat-display-header-control rn-chat-display-header-adduser definp"
											onClick={ () => {
												if(!this.state.dialog) return;

												this.setState({ chatStage: "CONTRIBUTORS_STAGE" });
												this.getDialogContributors();
											} }>
											<i className="fas fa-user-alt" />
										</button>
										<button
											className="rn-chat-display-header-control rn-chat-display-header-adduser definp"
											onClick={ () => this.setState({ chatStage: "SETTINGS_STAGE" }) }>
											<i className="fas fa-cog" />
										</button>
									</div>
								</section>
								{
									(this.state.chatStage === "CONVERSATION_STAGE") ? (
										<Fragment>
											<section className="rn-chat-display-mat" ref={ ref => this.dialogDisplayRef = ref } onScroll={({ target: { offsetHeight, scrollTop, scrollHeight } }) => {
												if(100 / ((scrollHeight - offsetHeight) / scrollTop) <= 1) this.fetchDialogMessages();
											}}>
												{
													((this.state.dialog && this.state.dialog.messages) || []).map(({ id, content, time, images, creatorID, creator, type, isSent }) => (
														(creatorID !== "SYSTEM_ID") ? (
															<DisplayMessage
																key={ id }
																id={ id }
																type={ type }
																content={ content }
																time={ time }
																images={ images }
																creator={ creator }
																openPhoto={ this.props.openPhotoModal }
																isClients={ creatorID === this.props.userdata.id }
																refreshDock={ this.props.refreshDock }
																isSent={ isSent }
																isNew={ typeof isSent === "boolean" }
															/>
														) : (
															<p
																key={ id }
																id={ id }
																className="rn-chat-display-mat-sysi">
																{ content }
															</p>
														)
													))
												}
												{
													(!this.state.fetchingDialogMessages) ? null : (
														<Loadericon
															style={{
																marginTop: "15px"
															}}
														/>
													)
												}
											</section>
											<section className="rn-chat-display-header-input">
												<div className="rn-chat-display-header-input-media">
													<input
														type="file"
														accept="*"
														id="rn-chat-display-header-input-media-file"
														className="hidden"
														onChange={ ({ target: { files: [file] } }) => (file) ? this.sendDialogMessage("FILE_TYPE", file) : null }
													/>
													{/* open modal with user's image, user can choose images to post, in the modal there is blue submit button */}
													<button title="Select smile" className="definp" onClick={ () => this.setState({ photoGrid: true }) }>
														<i className="far fa-image" />
													</button>
													<label htmlFor="rn-chat-display-header-input-media-file" title="Attach file" className="definp">
														<i className="fas fa-paperclip" />
													</label>
													<button title="Select smile" className="definp" onClick={ () => this.setState({ pModalStage: "STICKERS_STAGE" }) }>
														<i className="far fa-smile-wink" />
													</button>
												</div>
												<ChatDisplayDialogInput
													_onSubmit={ value => this.sendDialogMessage("MESSAGE_TYPE", value) }
												/>
											</section>
											<PortableModal
												stage={ this.state.pModalStage }
												_onSubmit={ this.sendDialogMessage }
												onClose={ () => this.setState({ pModalStage: null }) }
											/>
										</Fragment>
									) : (this.state.chatStage === "SETTINGS_STAGE") ? (
										<ConversationSettings
											color={ this.state.dialog && this.state.dialog.color }
											_onSubmit={ (image, name, color) => this.settingConversation(image, name, color) }
										/>
									) : (
										<Fragment>
											<nav className="rn-chat-display-contnav">
												{
													[
														{
															name: "Contributors",
															stage: "MAIN_STAGE"
														},
														{
															name: "Invite",
															stage: "INVITATIONS_STAGE"
														}
													].map(({ name, stage }, index) => (
														<button
															key={ index }
															className={ `rn-chat-display-contnav-btn definp${ (this.state.contributorsStage !== stage) ? "" : " active" }` }
															onClick={ () => this.setState({ contributorsStage: stage }) }>
															{ name }
														</button>
													))
												}
											</nav>
											<div className="rn-chat-display-contdisplay">
												{
													(this.state.contributorsStage === "MAIN_STAGE") ? (
														<Fragment>
															{
																(this.state.dialog.contributors) ? (
																	this.state.dialog.contributors.map(({ id, avatar, name, isLoading }) => (
																		<ContUser
																			key={ id }
																			id={ id }
																			name={ name }
																			avatar={ avatar }
																			isAdd={ false }
																			control={ this.state.dialog.contributorsInt > 2 && id !== this.props.userdata.id }
																			isLoading={ !!isLoading }
																			refreshDock={ this.props.refreshDock }
																			onAction={ () => this.deleteDialogContributor(id) }
																		/>
																	))
																) : (
																	<Loadericon
																		style={{
																			marginRight: "auto"
																		}}
																	/>
																)
															}
														</Fragment>
													) : (
														<Fragment>
															<div className="rn-chat-display-contdisplay-search">
																<input
																	className="definp"
																	placeholder="Search"
																	onChange={ ({ target }) => {
																		clearTimeout(target.sendInt);
																		target.sendInt = setTimeout(() => {
																			const { id } = cookieControl.get("authdata"),
																				  errorTxt = "Something wrong. Please try restart the page.";

																			client.query({
																				query: gql`
																					query($id: ID!, $conversationID: ID!, $query: String!) {
																						searchInConversationInviteSuggestions(id: $id, conversationID: $conversationID, query: $query) {
																							id,
																							name,
																							avatar
																						}
																					}
																				`,
																				variables: {
																					id,
																					conversationID: this.state.dialog.id,
																					query: target.value
																				}
																			}).then(({ data: { searchInConversationInviteSuggestions: a } }) => {
																				if(!a) return this.props.castError(errorTxt);

																				this.setState(({ dialog }) => ({
																					dialog: {
																						...dialog,
																						inviteSuggestions: a
																					}
																				}));
																			}).catch(() => this.props.castError(errorTxt));
																		}, 150)
																	} }
																/>
															</div>
															{
																(this.state.dialog.inviteSuggestions) ? (
																	this.state.dialog.inviteSuggestions.map(({ id, avatar, name, isLoading }) => (
																		<ContUser
																			key={ id }
																			id={ id }
																			name={ name }
																			avatar={ avatar }
																			isAdd={ true }
																			control={ true }
																			refreshDock={ this.props.refreshDock }
																			isLoading={ !!isLoading }
																			onAction={ () => this.inviteToConversation(id, name) }
																		/>
																	))
																) : (
																	<Loadericon
																		style={{
																			marginRight: "auto"
																		}}
																	/>
																)
															}
														</Fragment>
													)
												}
											</div>
										</Fragment>
									) // see contributors / add friend
								}
							</div>
						) : (
							<PhotoGrid
								castError={ this.props.castError }
								_onSubmit={ images => {
									this.sendDialogMessage("IMAGES_TYPE", images);
									this.setState(() => ({
										photoGrid: false
									}));
								} }
								onClose={ () => this.setState({ photoGrid: false }) }
							/>
						)
					)
				}
			</div>
		);
	}
}

const mapStateToProps = ({ user, session: { dockRefresher } }) => ({
	userdata: user && user.userdata,
	refreshDock: dockRefresher
});

const mapActionsToProps = {
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } }),
	openPhotoModal: payload => ({
		type: "TOGGLE_PHOTO_MODAL",
		payload
	})
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(App);