import React, { Component, Fragment } from 'react';
import './main.css';

import Loadericon from '../__forall__/loader.icon';
import NoteCreatorInput from  './NoteCreatorInput';

import { connect } from 'react-redux';
import { gql } from 'apollo-boost';

import { cookieControl } from '../../utils';
import client from '../../apollo';
import api from '../../api';

class NoteEditorSettingsFriend extends Component {
	render() {
		return(
			<div className="rn-notes-editor-settings-invite-item">
				<div className="rn-notes-editor-settings-invite-item-avatar">
					<div>
						<img src={ api.storage + this.props.avatar } alt="user" />
					</div>
				</div>	
				<div className="rn-notes-editor-settings-invite-item-info">
					<p className="rn-notes-editor-settings-invite-item-info-name">{ this.props.name }</p>
					<p className="rn-notes-editor-settings-invite-item-info-shares">{ this.props.notes } joint notes</p>
				</div>
				<div className="rn-notes-editor-settings-invite-item-join">
					{
						(!this.props.loading) ? (
							(!this.props.added) ? (
								<button key="A" type="button" className="definp rn-notes-editor-settings-invite-item-join-add" onClick={ this.props.onAdd }>
									<i className="fas fa-plus" />
								</button>
							) : (
								<button key="B" type="button" className="definp rn-notes-editor-settings-invite-item-join-add" onClick={ this.props.onAdd }>
									<i className="fas fa-check" />
								</button>
							)
						) : (
							<div className="rn-notes-editor-settings-invite-item-join-load" />
						)
					}
				</div>
			</div>
		);
	}
}

// <Loadericon />
class NoteEditorSettings extends Component {
	constructor(props) {
		super(props);

		this.state = {
			title: "",
			words: "",
			stage: "MAIN_STAGE", // MAIN_STAGE, INVITE_STAGE, CONTRIBUTORS_STAGE
			iFriends: null
		}
	}

	componentDidMount() {
		if(this.props.currentTitle !== undefined && this.props.currentExword !== undefined) {
			this.setState(() => ({
				title: this.props.currentTitle,
				words: this.props.currentExword
			}));
		}
	}

	setStage = stage => {
		if(stage === "INVITE_STAGE") {
			this.setState(() => ({
				iFriends: false
			}));

			const { id, authToken } = cookieControl.get("authdata"),
				  errorTxt = "Something went wrong. Please, restart the page.";

			client.query({
				query: gql`
					query($id: ID!, $authToken: String!, $noteID: ID!) {
						getNoteInviteSuggestions(id: $id, authToken: $authToken, noteID: $noteID) {
							id,
							avatar,
							name,
							jointNotesInt(id: $id)
						}
					}
				`,
				variables: {
					id, authToken,
					noteID: this.props.targetID
				}
			}).then(({ data: { getNoteInviteSuggestions: a } }) => {
				if(!a) return this.props.castError(errorTxt);

				this.setState(() => ({
					iFriends: a
				}));
			}).catch(() => this.props.castError(errorTxt));
		}

		this.setState(() => ({
			stage
		}));
	}

	addContributor = targetID => {
		if(!this.state.iFriends) return;

		let qAr = (aa, ab) => {
			let a = Array.from(this.state.iFriends);
			a.find(io => io.id === ab).isAdded = aa;
			a.find(io => io.id === ab).isLoading = !aa;
			this.setState(() => ({
				iFriends: a
			}));
		}
		qAr(false, targetID);

		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "An error occured while tried to add this user to conversation. Please, try later";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $authToken: String!, $noteID: ID!, $targetID: ID!) {
					addNoteContributor(id: $id, authToken: $authToken, noteID: $noteID, targetID: $targetID) {
						id
					}
				}
			`,
			variables: {
				id, authToken,
				noteID: this.props.targetID,
				targetID 
			}
		}).then(({ data: { addNoteContributor: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			qAr(true, targetID);
		}).catch(() => this.props.castError(errorTxt));
	}

	render() {
		return(
			<form className={ `rn-notes-editor-settings${ (!this.props.active) ? "" : " active" }` } onSubmit={ e => {
				e.preventDefault();
				this.props._onSubmit(this.state.title, this.state.words); 
			} }> {/* XXX */}
				{
					(this.state.stage === "MAIN_STAGE") ? (
						<Fragment>
							<div className="rn-notes-editor-settings-title">
								<button type="button" className="definp" onClick={ this.props.onClose }>
									<i className="fas fa-times" />
								</button>
								<h3 className="text">Settings</h3>
								<div />
							</div>
							{
								[
									{
										title: "Title",
										example: " ", // ...
										pattern: ".+", // everything
										field: "title",
										transporter: value => value
									},
									{
										title: "AN of words",
										example: "160",
										pattern: "[0-9]+", // \d+ doesn't work :( // only numbers
										field: "words",
										transporter: value => parseInt(value)
									}
								].map(({ title, example, pattern, field, transporter }, index) => (
									<NoteCreatorInput
										key={ index }
										title={ title }
										example={ example }
										valid={ pattern }
										value={ this.state[field] }
										_style={{
											maxWidth: "195px"
										}}
										_onChange={ value => this.setState(() => {
											let a = transporter(value);

											return {
												[field]: (!Number.isNaN(a)) ? a : 0
											}
										}) }
									/>
								))
							}
							<button
								type="button"
								className="rn-notes-editor-settings-callinvite definp"
								onClick={ () => this.setStage("INVITE_STAGE") }>
								<span>Invite friends</span>
								<div><i className="fas fa-angle-right" /></div>
							</button>
							<button
								type="button"
								className="rn-notes-editor-settings-callinvite definp"
								onClick={ () => this.setStage("CONTRIBUTORS_STAGE") }>
								<span>See contributors</span>
								<div><i className="fas fa-angle-right" /></div>
							</button>
							<button type="submit" className="rn-notes-editor-settings-submit definp">
								Submit
							</button>
						</Fragment>
					) : (
						<Fragment>
							<div className="rn-notes-editor-settings-title">
								<button className="definp" onClick={ () => this.setStage("MAIN_STAGE") }>
									<i className="fas fa-angle-left" />
								</button>
								<h3 className="text">Share with friends</h3>
								<div />
							</div>
							<div className="rn-notes-editor-settings-invite">
								{
									(this.state.iFriends !== null) ? (
										(typeof this.state.iFriends === "object") ? (
											this.state.iFriends.map(({ id, avatar, name, jointNotesInt: notes, isAdded, isLoading }) => (
												<NoteEditorSettingsFriend
													key={ id }
													id={ id }
													avatar={ avatar }
													loading={ isLoading }
													added={ isAdded }
													name={ name }
													notes={ notes }
													onAdd={ () => (!isAdded) ? this.addContributor(id) : null }
												/>
											))
										) : ( // loading
 											<Loadericon />
										)
									) : null
								}
							</div>
						</Fragment>
					)
				}
			</form>
		);
	}
}

const mapStateToProps = () => ({});

const mapActionsToProps = {
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(NoteEditorSettings);