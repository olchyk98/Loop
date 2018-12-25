import React, { Component, Fragment } from 'react';
import './main.css';

import AccountCard from '../__forall__/accountCard';

import { gql } from 'apollo-boost';
import { connect } from 'react-redux';

import api from '../../api';
import client from '../../apollo';
import { cookieControl, convertTime } from '../../utils';

const image = "https://lolstatic-a.akamaihd.net/frontpage/apps/prod/LolGameInfo-Harbinger/en_US/8588e206d560a23f4d6dd0faab1663e13e84e21d/assets/assets/images/gi-landing-top.jpg";
const imsticker = "https://image.flaticon.com/icons/svg/262/262837.svg";

const stickers = [
	{
		icon: require('../__forall__/mg_stickers/alarm-clock.svg'),
		label: "CLOCK_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/american-football.svg'),
		label: "FOOTBALL_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/backpack.svg'),
		label: "BACKPACK_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/bell.svg'),
		label: "BELL_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/blackboard-1.svg'),
		label: "BLACKBOARD_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/blackboard.svg'),
		label: "BLACKBOARD_SQUARE_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/books-1.svg'),
		label: "BOOKS_STAND_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/compass.svg'),
		label: "COMPASS_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/computer-mouse.svg'),
		label: "COMPUTER_MOUSE_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/diploma-1.svg'),
		label: "DIPLOMA_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/diploma.svg'),
		label: "DIPLOMA_CLOSED_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/earth-globe.svg'),
		label: "GLOBE_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/flask.svg'),
		label: "CYMA_FLASK_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/glasses.svg'),
		label: "GLASSES_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/light-bulb.svg'),
		label: "LAMP_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/medal.svg'),
		label: "MEDAL_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/notebook.svg'),
		label: "NOTEBOOK_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/owl.svg'),
		label: "OWL_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/paint-brush.svg'),
		label: "BRUSH_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/palette.svg'),
		label: "PALETTE_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/physics.svg'),
		label: "PHYSICS_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/school.svg'),
		label: "SCHOOL_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/scissors.svg'),
		label: "SAX_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/test-tubes.svg'),
		label: "TUBES_LABEL"
	},
	{
		icon: require('../__forall__/mg_stickers/test.svg'),
		label: "PROV_LABEL"
	},

]

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
								<i className="fas fa-trash" />
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
						} }
						onKeyPress={ e => {
							if(e.target.textContent.length >= 10 || !e.key.match(/\d/)) e.preventDefault();
							let a = e.target.textContent;

							if(a === "0") { // match(/0\d$/)
								e.target.textContent = a.replace("0", "");
							}

							this.props._onChange(parseInt(a));
						} }>{ this.props.value }</p>
					)
				}
				<p className="rn-chat-display-mat-item-content-timer-display-number-title">{ this.props.title }</p>
			</div>
		);
	}
}

class DisplayMessageTimer extends Component {
	static defaultProps = {
		isProduction: true
	}

	constructor(props) {
		super(props);

		if(!this.props.isProduction) {
			this.state = {
				customHours: 0,
				customMinutes: 0,
				customSeconds: 0
			}
		}
	}

	render() {
		return(
			<div className="rn-chat-display-mat-item-content-timer">
				<section className="rn-chat-display-mat-item-content-timer-display">
					<DisplayMessageTimerNumber
						title="Hours"
						value={ (this.props.isProduction) ? 212 : 0 }
						isEditable={ !this.props.isProduction }
						_onChange={ value => this.setState({ customHours: value }) }
					/>
					<span className="rn-chat-display-mat-item-content-timer-display-space">:</span>
					<DisplayMessageTimerNumber
						title="Minutes"
						value={ (this.props.isProduction) ? 212 : 0 }
						isEditable={ !this.props.isProduction }
						_onChange={ value => this.setState({ customMinutes: value }) }
					/>
					<span className="rn-chat-display-mat-item-content-timer-display-space">:</span>
					<DisplayMessageTimerNumber
						title="Seconds"
						value={ (this.props.isProduction) ? 212 : 0 }
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
								seconds: this.state.customSeconds,
								minutes: this.state.customMinutes,
								hours: this.state.customHours
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
	render() {
		if(this.props.type === "STICKER_TYPE") {
			return(
				<article className={ `rn-chat-display-mat-item ${ (!this.props.isClients) ? "contibutor" : "client" }` }>
					<div className="rn-chat-display-mat-item-avatar">
						<div className="rn-chat-display-mat-item-avatar-mat">
							<img src={ image } alt="contributor's avatar" />
						</div>
					</div>
					<div className="rn-chat-display-mat-item-content">
						<div><img className="rn-chat-display-mat-item-stickermg" alt="sticker" src={ imsticker } /></div>
						<div className="rn-chat-display-mat-item-content-info">
							<span>Oles Odynets</span>
							<span className="space">•</span>
							<span>12:30</span>
						</div>
					</div>
				</article>
			);
		} else if(this.props.type === "TIMER_TYPE") {
			return(
				<article className={ `rn-chat-display-mat-item ${ (this.props.isClients) ? "client" : "contibutor" }` }>
					<div className="rn-chat-display-mat-item-avatar">
						<div className="rn-chat-display-mat-item-avatar-mat">
							<img src={ image } alt="contributor's avatar" />
						</div>
					</div>
					<div className="rn-chat-display-mat-item-content">
						<DisplayMessageTimer isProduction={ true } />
						<div className="rn-chat-display-mat-item-content-info">
							<span>Oles Odynets</span>
							<span className="space">•</span>
							<span>12:30</span>
						</div>
					</div>
				</article>
			);
		} else {
			return(
				<article className={ `rn-chat-display-mat-item ${ (this.props.isClients) ? "client" : "contibutor" }` }>
					<div className="rn-chat-display-mat-item-avatar">
						<div className="rn-chat-display-mat-item-avatar-mat">
							<img src={ image } alt="contributor's avatar" />
						</div>
					</div>
					<div className="rn-chat-display-mat-item-content">
						<div className="rn-chat-display-mat-item-content-mat">
							<span className="rn-chat-display-mat-item-content-mat-text">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vestibulum tellus mollis, malesuada risus nec, condimentum leo. Donec arcu enim, auctor nec molestie at, dignissim ac eros. Fusce bibendum nulla ullamcorper, fringilla mi vitae, malesuada sem. Pellentesque tristique lobortis leo at porta. Morbi commodo, ligula nec varius tincidunt, leo lectus suscipit ipsum, vitae fermentum erat ex eu odio. Aliquam erat volutpat. Vivamus vitae nibh faucibus, vestibulum ante et, ultrices orci. Cras elit diam, semper non porttitor ut, placerat ac neque. Suspendisse tellus neque, varius id lorem vel, commodo fermentum massa.
							</span>
							<div className="rn-chat-display-mat-item-content-mat-imgblock">
								<div className="rn-chat-display-mat-item-content-mat-image">
									<img alt="attachment" src={ image } />
								</div>
								<div className="rn-chat-display-mat-item-content-mat-image">
									<img alt="attachment" src={ image } />
								</div>
								<div className="rn-chat-display-mat-item-content-mat-image">
									<img alt="attachment" src={ image } />
								</div>
							</div>
						</div>
						<div className="rn-chat-display-mat-item-content-info">
							<span>Oles Odynets</span>
							<span className="space">•</span>
							<span>12:30</span>
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
							submit={ value => { this.props._onSubmit("TIMER_SUBMIT", value); this.props.onClose() } }
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
							stickers.map(({ icon, label }, index) => (
								<div
									key={ index }
									onClick={ () => { this.props._onSubmit("STICKER_SUBMIT", label); this.props.onClose() } }
									className="rn-chat-mm-modal-sticker">
									<img alt="sticker item" src={ icon } />
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

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			stage: "LIST_STAGE", // LIST_STAGE, CHAT_STAGE
			chatStage: "CONVERSATION_STAGE", // CONVERSATION_STAGE, SETTINGS_STAGE, CONTRIBUTORS_STAGE
			contributorsStage: "MAIN_STAGE", // MAIN_STAGE, INVITATIONS_STAGE
			pModalStage: null, // STOPWATCH_STAGE, STICKERS_STAGE
			conversations: []
		}
	}

	componentDidMount() {
		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't load your conversations. Please, try again."

		client.query({
			query: gql`
				query($id: ID!, $authToken: String!) {
					user(id: $id, authToken: $authToken) {
						id,
						conversations {
							id,
							avatar,
							contributorsInt,
							color,
							name,
							lastMessage {
								time,
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
									(this.state.conversations).map(({ id, avatar, lastMessage, color, name, contributorsInt }) => (
										<Conversation
											key={ id }
											id={ id }
											avatar={ avatar }
											name={ name }
											color={ color }
											contInt={ contributorsInt - 1 }
											preview={ lastMessage }
											clientAvatar={ (this.props.userdata && this.props.userdata.avatar) || "" }
											_onClick={ () => null }
										/>
									))
								}
								<Conversation
									content="Hello, World! Hello, World! Hello, World! Hello, World! Hello, World! Hello, World! Hello, World! Hello, World! Hello, World!"
									color="red"
								/>
							</div>
						</Fragment>
					) : (
						<div className="rn-chat-display">
							<section className="rn-chat-display-header">
								<div>
									<div className="rn-chat-display-header-image">
										<img src={ image } alt="conversation preview" />
									</div>
									<span className="rn-chat-display-header-title">Oles Odynets</span>
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
										<section className="rn-chat-display-mat">
											<DisplayMessage
												type="default"
												isClients={ true }
											/>
											<DisplayMessage
												type="STICKER_TYPE"
											/>
											<DisplayMessage
												type="TIMER_TYPE"
											/>
											<p className="rn-chat-display-mat-sysi"><strong>Oles Odynets</strong> has stopped the timer. (32:14:00)</p>
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
											<div className="rn-chat-display-header-input-field">
												<input placeholder="Start typing..." className="rn-chat-display-header-field-mat definp" />
												<div className="rn-chat-display-header-field-send">
													<button className="definp">
														<i className="fas fa-fighter-jet" />
													</button>
												</div>
											</div>
										</section>
										<PortableModal
											stage={ this.state.pModalStage }
											_onSubmit={ console.log }
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
												_onClick={ console.log }
											/>
											<ChatDisplaySettingsPaleteColor
												color="red"
												isActive={ false }
												_onClick={ console.log }
											/>
											<ChatDisplaySettingsPaleteColor
												color="pink"
												isActive={ false }
												_onClick={ console.log }
											/>
											<ChatDisplaySettingsPaleteColor
												color="sea"
												isActive={ false }
												_onClick={ console.log }
											/>
											<ChatDisplaySettingsPaleteColor
												color="clouds"
												isActive={ false }
												_onClick={ console.log }
											/>
											<ChatDisplaySettingsPaleteColor
												color="orange"
												isActive={ false }
												_onClick={ console.log }
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
																		console.log(target.value);
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