import React, { Component, Fragment } from 'react';
import './main.css';

import AccountCard from '../__forall__/accountCard';
import Loadericon from '../__forall__/loader.icon';

import { gql } from 'apollo-boost';
import { connect } from 'react-redux';

import api from '../../api';
import client from '../../apollo';
import { cookieControl, convertTime } from '../../utils';

import placeholderGIF from '../__forall__/placeholder.gif';

const image = "https://lolstatic-a.akamaihd.net/frontpage/apps/prod/LolGameInfo-Harbinger/en_US/8588e206d560a23f4d6dd0faab1663e13e84e21d/assets/assets/images/gi-landing-top.jpg";

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
			<div className={ `rn-chat-conversations-item ${ this.props.color || "white" }` } onClick={ () => this.props._onClick(this.props.id) }>
				<div className="rn-chat-conversations-item-previewimg">
					<div className="rn-chat-conversations-item-previewimg-image">
					<img className="rn-chat-conversations-item-previewimg-img" alt="member" src={ api.storage + this.props.avatar } title="Conversation member" />
						<div className="rn-chat-conversations-item-previewimg-not" />
					</div>
				</div>
				<div className="rn-chat-conversations-item-content">
					<div className="rn-chat-conversations-item-content-title">
						<div>
							<span className="rn-chat-conversations-item-content-title-name">{ this.props.name }</span>
							<span className="rn-chat-conversations-item-content-title-placeholder">•</span>
							<span className="rn-chat-conversations-item-content-title-time">{ (this.props.preview && convertTime(this.props.preview.time, "ago", true, true)) || "" }</span>
						</div>
						<div className="rn-chat-conversations-item-content-controls">
							<button className="rn-chat-conversations-item-content-controls-btn definp">
								<i className="fas fa-sign-out-alt" />
							</button>
						</div>
					</div>
					<div className="rn-chat-conversations-item-content-last" onClick={ () => null }> {/* className: lastinrow */}
						<span className="rn-chat-conversations-item-content-last-name">{ this.props.preview && this.props.preview.creator.name }</span>
						<span className="rn-chat-conversations-item-content-last-content">
							{ this.props.preview && this.props.preview.content }
						</span>
					</div>
					<div className="rn-chat-conversations-item-content-members">
						{
							(parseInt(this.props.contInt) > 0) ? (
								<ConversationMember
									isMoreTrack={ true }
									moreInt={ this.props.contInt }
								/>
							) : null
						}
						<ConversationMember
							avatar={ this.props.clientAvatar }
						/>
					</div>
				</div>
			</div>
		);
	}
}

class DisplayMessageTimerNumber extends Component {
	render() {
		return(
			<div className="rn-chat-display-mat-item-content-timer-display-number">
				{
					(!this.props.isEditable) ? (
						<p className="rn-chat-display-mat-item-content-timer-display-number-mat">{ this.props.value }</p>
					) : (
						<p
						className="rn-chat-display-mat-item-content-timer-display-number-mat definp"
						contentEditable={ this.props.isEditable }
						suppressContentEditableWarning={ true }
						defaultValue={ this.props.value }
						onInput={ ({ target }) => {
							if(!target.textContent.replace(/|s|\n/g, "").length) {
								target.textContent = "0";
							}

							let a = target.textContent;

							if(a === "0") { // match(/0\d$/)
								target.textContent = a.replace("0", "");
							}

							this.props._onChange(parseInt(a));
						} }
						onKeyPress={ e => {
							if(e.target.textContent.length >= 10 || !e.key.match(/\d/)) e.preventDefault();
						} }>{ this.props.value }</p>
					)
				}
				<p className="rn-chat-display-mat-item-content-timer-display-number-title">{ this.props.title }</p>
			</div>
		);
	}
}

class DisplayMessageTimer extends Component {
	constructor(props) {
		super(props);

		if(!this.props.isProduction) {
			this.state = {
				customHours: 0,
				customMinutes: 0,
				customSeconds: 0
			}
		} else {
			this.state = {
				currentSeconds: 0,
				currentMinutes: 0,
				currentHours: 0
			}

			this.timerInt = null;
		}
	}

	static defaultProps = {
		isProduction: true
	}

	componentDidMount() {
		if(this.props.isProduction) {
			let { start, time } = JSON.parse(this.props.data);
			// (time - (now - time)) / 1000

			let set = () => {
				let a = (time - (+new Date() - start)) / 1000,
					f = f => {
						let ff = Math.floor(f);

						return (ff.toString().length === 1) ? "0" + ff : ff;
					},
					b = f(a / 60), // m
					c = a % 60,
					d = f(c / 60000), //  h
					e = f(c % 60000); // s

				this.setState(() => ({
					currentSeconds: (e > 0) ? e : 0,
					currentMinutes: (b > 0) ? b : 0,
					currentHours: (d > 0) ? d : 0
				}));
			}

			set();
			this.timerInt = setInterval(set, 1000);
		}
	}

	componentWillUnmount() {
		if(this.props.isProduction) clearInterval(this.timerInt);
	}

	render() {
		return(
			<div className="rn-chat-display-mat-item-content-timer">
				<section className="rn-chat-display-mat-item-content-timer-display">
					<DisplayMessageTimerNumber
						title="Hours"
						value={ (this.props.isProduction) ? this.state.currentHours : 0 }
						isEditable={ !this.props.isProduction }
						_onChange={ value => this.setState({ customHours: value }) }
					/>
					<span className="rn-chat-display-mat-item-content-timer-display-space">:</span>
					<DisplayMessageTimerNumber
						title="Minutes"
						value={ (this.props.isProduction) ? this.state.currentMinutes : 0 }
						isEditable={ !this.props.isProduction }
						_onChange={ value => this.setState({ customMinutes: value }) }
					/>
					<span className="rn-chat-display-mat-item-content-timer-display-space">:</span>
					<DisplayMessageTimerNumber
						title="Seconds"
						value={ (this.props.isProduction) ? this.state.currentSeconds : 0 }
						isEditable={ !this.props.isProduction }
						_onChange={ value => this.setState({ customSeconds: value }) }
					/>
				</section>
				<section className="rn-chat-display-mat-item-content-timer-controls">
					{
						(this.props.isProduction) ? (
							<Fragment>
								<button className="rn-chat-display-mat-item-content-timer-controls-btn definp">
									<i className="fas fa-stop" />
								</button>
								<button className="rn-chat-display-mat-item-content-timer-controls-btn definp">
									<i className="fas fa-play" />
								</button>
								<button className="rn-chat-display-mat-item-content-timer-controls-btn definp">
									<i className="fas fa-undo" />
								</button>
							</Fragment>
						) : ( // in the edit modal
							<button className="rn-chat-display-mat-item-content-timer-controls-btn definp" onClick={ () => this.props.submit({
								s: this.state.customSeconds,
								m: this.state.customMinutes,
								h: this.state.customHours
							}) }>
								<i className="fas fa-play" />
							</button>
						)
					}
				</section>
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
						<div className="rn-chat-display-mat-item-avatar-mat">
							<img src={ (this.props.creator && api.storage + this.props.creator.avatar) || placeholderGIF } alt="contributor's avatar" />
						</div>
					</div>
					<div className="rn-chat-display-mat-item-content">
						<div><img className="rn-chat-display-mat-item-stickermg" alt="sticker" src={ stickers[this.props.content] } /></div>
						<div className="rn-chat-display-mat-item-content-info">
							<span>{ this.props.creator && this.props.creator.name }</span>
							<span className="space">•</span>
							<span>{ convertTime(this.props.time) }</span>
						</div>
					</div>
				</article>
			);
		} else if(this.props.type === "TIMER_TYPE") {
			return(
				<article className={ `rn-chat-display-mat-item ${ (this.props.isClients) ? "client" : "contibutor" }` }>
					<div className="rn-chat-display-mat-item-avatar">
						<div className="rn-chat-display-mat-item-avatar-mat">
							<img src={ (this.props.creator && api.storage + this.props.creator.avatar) || placeholderGIF } alt="contributor's avatar" />
						</div>
					</div>
					<div className="rn-chat-display-mat-item-content">
						<DisplayMessageTimer
							isProduction={ true }
							data={ this.props.content }
						/>
						<div className="rn-chat-display-mat-item-content-info">
							<span>{ this.props.creator && this.props.creator.name }</span>
							<span className="space">•</span>
							<span>{ convertTime(this.props.time) }</span>
						</div>
					</div>
				</article>
			);
		} else {
			return(
				<article className={ `rn-chat-display-mat-item ${ (this.props.isClients) ? "client" : "contibutor" }` }>
					<div className="rn-chat-display-mat-item-avatar">
						<div className="rn-chat-display-mat-item-avatar-mat">
							<img src={ (this.props.creator && api.storage + this.props.creator.avatar) || placeholderGIF } alt="contributor's avatar" />
						</div>
					</div>
					<div className="rn-chat-display-mat-item-content">
						<div className="rn-chat-display-mat-item-content-mat">
							<span className="rn-chat-display-mat-item-content-mat-text">
								{ this.props.content }
							</span>
							<div className="rn-chat-display-mat-item-content-mat-imgblock">
								{
									this.props.images.map(({ id, url }) => (
										<div className="rn-chat-display-mat-item-content-mat-image" key={ id }>
											<img alt="attachment" src={ (url && api.storage + url) || placeholderGIF } />
										</div>
									))
								}
							</div>
						</div>
						<div className="rn-chat-display-mat-item-content-info">
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
				<div>
					<div className="rn-chat-display-contuser-avatar">
						<img src={ image } alt="contributor's avatar" />
					</div>
					<span className="rn-chat-display-contuser-name">Oles Odynets</span>
				</div>
				<div>
					<button className="rn-chat-display-contuser-btn definp">
						<i className="fas fa-plus" />
					</button>
				</div>
			</article>
		);
	}
}

class PortableModal extends Component {
	render() {
		if(this.props.stage === "STOPWATCH_STAGE") {
			return(
				<Fragment>
					<div className="rn-chat-mm-modalbg" onClick={ this.props.onClose } />
					<div className="rn-chat-mm-modal">
						<DisplayMessageTimer
							isProduction={ false }
							submit={ ({ s, m, h }) => { this.props._onSubmit("TIMER_TYPE", JSON.stringify({
								time: s * 1000 + m * 60000 + h * 3600000, // ms
								start: +new Date() // ms
							})); this.props.onClose() } }
						/>
					</div>
				</Fragment>
			);
		} else if(this.props.stage === "STICKERS_STAGE") {
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

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			stage: "LIST_STAGE", // LIST_STAGE, CHAT_STAGE
			chatStage: "CONVERSATION_STAGE", // CONVERSATION_STAGE, SETTINGS_STAGE, CONTRIBUTORS_STAGE
			contributorsStage: "MAIN_STAGE", // MAIN_STAGE, INVITATIONS_STAGE
			pModalStage: null, // STOPWATCH_STAGE, STICKERS_STAGE
			conversations: null,
			dialog: null,
		}

		this.dialogDisplayRef = React.createRef();
	}

	componentDidMount() {
		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't load your conversations. Please, try again."

		this.setState(() => ({
			conversations: false
		}));

		client.query({
			query: gql`
				query($id: ID!, $authToken: String!) {
					user(id: $id, authToken: $authToken) {
						id,
						conversations {
							id,
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
				}
			`,
			variables: {
				id, authToken
			}
		}).then(({ data: { user } }) => {
			if(!user) return this.props.castError(errorTxt);

			this.setState(() => ({
				conversations: user.conversations
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	openConversation = targetID => {
		this.setState(() => ({
			stage: "CHAT_STAGE",
			dialog: false
		}));

		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't load this conversation. Please, try later.";

		client.query({
			query: gql`
				query($id: ID!, $authToken: String!, $targetID: ID!) {
					conversation(id: $id, authToken: $authToken, targetID: $targetID) {
						id,
						name,
						avatar,
						messages {
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
				id, authToken,
				targetID
			}
		}).then(({ data: { conversation } }) => {
			if(!conversation) return this.props.castError(errorTxt);

			this.setState(() => ({
				dialog: conversation
			}), this.scrollEndDialog);
		}).catch(() => this.props.castError(errorTxt));
	}

	sendDialogMessage = (type, value) => {
		if(!this.state.dialog) return;

		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "An error occured while we tried to send your message. Please, try again."

		let a = this.state.dialog.messages.length;
		this.setState(({ dialog, dialog: { messages } }) => ({
			dialog: {
				...dialog,
				messages: [
					...messages,
					{
						id: a,
						content: value,
						time: +new Date(),
						type,
						images: [],
						creatorID: this.props.userdata.id,
						creator: {
							id: this.props.userdata.id,
							name: this.props.userdata.name,
							avatar: this.props.userdata.avatar,
						}
					}
				]
			}
		}), this.scrollEndDialog);

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $authToken: String!, $content: String!, $type: String!, $conversationID: ID!) {
				  sendMessage(
				    id: $id,
				    authToken: $authToken,
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
				id, authToken,
				content: value,
				type,
				conversationID: this.state.dialog.id
			}
		}).then(({ data: { sendMessage: message } }) => {
			if(!message) return this.props.castError(errorTxt);

			let aa = Array.from(this.state.dialog.messages),
				ab = aa.findIndex( io => io.id.toString() === a.toString() );

			if(ab) {
				aa[ab] = message;
			} else {
				this.setState(({ dialog, dialog: { messages } }) => ({
					dialog: {
						...dialog,
						messages: [
							...messages,
							message
						]
					}
				}), this.scrollEndDialog);
			}
		}).catch(() => this.props.castError(errorTxt));
	}

	scrollEndDialog = () => {
		this.dialogDisplayRef.scrollTop = this.dialogDisplayRef.scrollHeight;
	}

	render() {
		return(
			<div className="rn rn-chat">
				{
					(this.state.stage === "LIST_STAGE") ? (
						<Fragment>
							<div className="rn-chat-search">
								{/* hide, if no conversations */}
								<input
									type="search"
									placeholder="Enter id, date of a last message or name..."
									className="definp rn-chat-search-field"
								/>
							</div>
							<div className="rn-chat-conversations">
								{
									(this.state.conversations === null || this.state.conversations === false) ? (
										(this.state.conversations === null) ? ( // void
											null
										) : ( // loading
											<Loadericon />
										)
									) : (
										(this.state.conversations).map(({ id: a, avatar: b, lastMessage: c, color: d, name: e, contributorsInt: f }) => (
											<Conversation
												key={ a }
												id={ a }
												avatar={ b }
												name={ e }
												color={ d }
												contInt={ f - 1 }
												preview={(c) ? {
													...c,
													content: (c.type !== "STICKER_TYPE" && c.type !== "TIMER_TYPE") ? c.content : (
														(c.type === "STICKER_TYPE") ? "*sticker*" : "*timer*"
													)
												} : null}
												clientAvatar={ (this.props.userdata && this.props.userdata.avatar) || placeholderGIF }
												_onClick={ this.openConversation }
											/>
										))
									)
								}
							</div>
						</Fragment>
					) : (
						<div className="rn-chat-display">
							<section className="rn-chat-display-header">
								<div>
									<div className="rn-chat-display-header-image">
										<img src={ (this.state.dialog && api.storage + this.state.dialog.avatar) || placeholderGIF } alt="conversation preview" />
									</div>
									<span className="rn-chat-display-header-title">{ this.state.dialog && this.state.dialog.name }</span>
								</div>
								<div>
									{
										(this.state.chatStage === "CONVERSATION_STAGE") ? null : (
											<button
												className="rn-chat-display-header-control rn-chat-display-header-adduser definp"
												onClick={ () => this.setState({ chatStage: "CONVERSATION_STAGE" }) }>
												<i className="fas fa-envelope" />
											</button>
										)
									}
									<button
										className="rn-chat-display-header-control rn-chat-display-header-adduser definp"
										onClick={ () => this.setState({ chatStage: "CONTRIBUTORS_STAGE" }) }>
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
										<section className="rn-chat-display-mat" ref={ ref => this.dialogDisplayRef = ref }>
											{
												((this.state.dialog && this.state.dialog.messages) || []).map(({ id, content, time, images, creatorID, creator, type }) => (
													(creatorID !== "SYSTEM_ID") ? (
														<DisplayMessage
															key={ id }
															id={ id }
															type={ type }
															content={ content }
															time={ time }
															images={ images }
															creator={ creator }
															isClients={ creatorID === this.props.userdata.id }
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
										</section>
										<section className="rn-chat-display-header-input">
											<div className="rn-chat-display-header-input-media">
												<button title="Attach file" className="definp">
													<i className="fas fa-paperclip" />
												</button>
												<button title="Select smile" className="definp" onClick={ () => this.setState({ pModalStage: "STICKERS_STAGE" }) }>
													<i className="far fa-smile-wink" />
												</button>
												<button title="Set timer" className="definp" onClick={ () => this.setState({ pModalStage: "STOPWATCH_STAGE" }) }>
													<i className="fas fa-stopwatch" />
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
									<div className="rn-chat-display-settings">
										<div className="rn-chat-display-settings-name">
											<input type="text" className="definp" placeholder="Name" />
										</div>
										<div className="rn-chat-display-settings-palete">
											<ChatDisplaySettingsPaleteColor
												color="purple"
												isActive={ true }
												_onClick={ () => null }
											/>
											<ChatDisplaySettingsPaleteColor
												color="red"
												isActive={ false }
												_onClick={ () => null }
											/>
											<ChatDisplaySettingsPaleteColor
												color="pink"
												isActive={ false }
												_onClick={ () => null }
											/>
											<ChatDisplaySettingsPaleteColor
												color="sea"
												isActive={ false }
												_onClick={ () => null }
											/>
											<ChatDisplaySettingsPaleteColor
												color="clouds"
												isActive={ false }
												_onClick={ () => null }
											/>
											<ChatDisplaySettingsPaleteColor
												color="orange"
												isActive={ false }
												_onClick={ () => null }
											/>
										</div>
									</div>
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
														<AccountCard
															active={ false }
															name="Oles Odynets"
															login="oles"
															userID=""
															label="Contributor"
														/>
														<AccountCard
															active={ false }
															name="Oles Odynets"
															login="oles"
															userID=""
															label="Contributor"
														/>
														<AccountCard
															active={ false }
															name="Oles Odynets"
															login="oles"
															userID=""
															label="Contributor"
														/>
														<AccountCard
															active={ false }
															name="Oles Odynets"
															login="oles"
															userID=""
															label="Contributor"
														/>
														<AccountCard
															active={ false }
															name="Oles Odynets"
															login="oles"
															userID=""
															label="Contributor"
														/>
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
																		// console.log(target.value);
																	}, 400)
																} }
															/>
														</div>
														<ContUser />
														<ContUser />
														<ContUser />
														<ContUser />
													</Fragment>
												)
											}
										</div>
									</Fragment>
								) // see contributors / add friend
							}
						</div>
					)
				}
			</div>
		);
	}
}

const mapStateToProps = ({ user }) => ({
	userdata: user && user.userdata
});

const mapActionsToProps = {
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(App);