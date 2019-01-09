import React, { Component, Fragment } from 'react';
import './main.css';

import Loadericon from '../__forall__/loader.icon';

import { gql } from 'apollo-boost';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { Editor, EditorState, RichUtils, convertFromHTML } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';


import client from '../../apollo';
import { cookieControl } from '../../utils';
import links from '../../links';
import api from '../../api';

const image = "https://yt3.ggpht.com/-qkiz6poo350/AAAAAAAAAAI/AAAAAAAAAAA/tKffXgsObqs/s48-c-k-no-mo-rj-c0xffffff/photo.jpg";

class NoteContributor extends Component {
    render() {
        return (
            <Link className="rn_notes-item__default-edtiro-item" to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.id }` }>
				<img alt="contributor" src={ api.storage + this.props.avatar } />
			</Link>
        );
    }
}

class Note extends Component {
	constructor(props) {
		super(props);

		{
			let a = [
				(<Fragment>You can write about your day,
				or about your homework. Do whatever you want.
				<br /><br />Just start editing this note...</Fragment>),

				(<Fragment>Nothing here yet, but you can invite your friends to help you.
				<br /><br />You can write things here...</Fragment>),

				(<Fragment>It's empty note, but you can always start using it.
				<br /><br />Just start typing text...</Fragment>),

				(<Fragment>Unknown UFO cleared everything that was here... but wait,
					maybe you just didn't start notate something.
				<br /><br />Open and try to fix that...</Fragment>)
			];
			this.emptyFiller = a[Math.floor(Math.random() * a.length)];
		}
	}

	getProgressClass = () => {
		let a = this.props.currWords,
			b = this.props.estWords,
			c = ""; // lowcontent, mediumcontent, highcontent, fullcontent

		// convert to procents
		let d = 100 / (b / a);

		if(d === 0) c = "";
		else if(d <= 25) c = "lowcontent"
		else if(d > 25 && d <= 50) c = "mediumcontent"
		else if(d > 50 && d <= 75) c = "highcontent";
		else c = "fullcontent";

		return c;
	}

    render() {
        return (
            <div className={ `rn-notes-item ${ (!this.props.isVoid) ? "default" : "void" }${ (!this.props.isVoid) ? " " + this.getProgressClass() : "" }` } onClick={ this.props._onClick }>
				{
					(!this.props.isVoid) ? (
						<Fragment>
							<div className="rn-notes-item__default-section">
								<h3 className="rn-notes-item-title">{ this.props.title }</h3>
								{
									(this.props.content.length) ? (
										<p className="rn-notes-item-desc">
											{ this.props.content }
										</p>
									) : (
										<p className="rn-notes-item-desc empty">
											{ this.emptyFiller }
										</p>
									)
								}
							</div>
							<div className="rn-notes-item__default-progress">
								<span className="rn-notes-item__default-progress-title">Progress</span>
								<div className="rn-notes-item__default-progress-bar">
									<div className="rn-notes-item__default-progress-bar-item first" />
									<div className="rn-notes-item__default-progress-bar-item second" />
									<div className="rn-notes-item__default-progress-bar-item third" />
									<div className="rn-notes-item__default-progress-bar-item fourth" />
								</div>
							</div>
							<div className="rn_notes-item__default-edtiro">
								<div>
									{
										this.props.contributors.map(({ id, avatar }) => (
											<NoteContributor
												key={ id }
												id={ id }
												avatar={ avatar }
											/>
										))
									}
								</div>
							</div>
						</Fragment>
					) : (
						<Fragment>
							<div className="rn-notes-item__void-plusicon">
								<i className="fas fa-plus" />
							</div>
							<h3 className="rn-notes-item-title">Add new note</h3>
							<p className="rn-notes-item-desc">
								Add new note to your notes section where you can add description,
								edit it with your friends.
							</p>
						</Fragment>
					)
				}
			</div>
        );
    }
}

const NoteCreatorInput = ({ example, valid, title, _onChange, value }) => (
	<div className="rn-notes-previewmodal-input">
		<p className="rn-notes-previewmodal-input-title">{ title }</p>
		<div className="rn-notes-previewmodal-input-mat">
			<input
				className="definp"
				placeholder={ example }
				type="text"
				pattern={ valid } /* ultimate regex skills :D */
				value={ value }
				onChange={ ({ target: { value } }) => _onChange(value) }
				required
			/>
			<div />
		</div>
	</div>
)

class NoteCreator extends Component {
	constructor(props) {
		super(props);

		{
			let a = [ // examples
				"Math Test No. 1",
				"Hometasks",
				"My note",
				"Plans"
			];

			this.titleExample = a[Math.floor(Math.random() * a.length)];
		}

		this.defState = {
			title: "",
			words: 0
		}
		this.state = { ...this.defState } // Object.assign({}, this.defState)
	}

	closeSelf = () => {
		this.setState(() => this.defState);
		this.props.onClose();
	}

	submit = () => {
		const { title, words } = this.state;

		this.props._onSubmit(title, words);
	}

	render() {
		return(
			<Fragment>
				<div className={ `rn-notes-previewmodalbg${ (!this.props.visible) ? "" : " visible" }` } onClick={ this.closeSelf } />
				<form className="rn-notes-previewmodal" onSubmit={ e => { e.preventDefault(); this.submit() } }>
					<div className="rn-notes-previewmodal-title">
						<h3 className="rn-notes-previewmodal-title-mat">New Note</h3>
						<button type="button" className="rn-notes-previewmodal-title-times definp" onClick={ this.closeSelf }>
							<i className="fas fa-times" />
						</button>
					</div>
					<p className="rn-notes-previewmodal-subtitle">
						Awesome idea! Let's take a note about something.
					</p>
					{
						[
							{
								title: "Title",
								example: this.titleExample,
								pattern: ".+", // everything
								field: "title",
								transporter: value => value
							},
							{
								title: "Approximate number of words in the note",
								example: "160",
								pattern: "[0-9]+", // \d+ is not working :( // only numbers
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
								_onChange={ value => this.setState(() => {
									let a = transporter(value);

									return {
										[field]: (!Number.isNaN(a)) ? a : 0 // XXX
									}
								}) }
							/>
						))
					}
					<div className="rn-notes-previewmodal-controls">
						<button type="button" className="definp rn-notes-previewmodal-controls-btn cancel" onClick={ this.closeSelf }>Cancel</button>
						<button type="submit" className="definp rn-notes-previewmodal-controls-btn submit">Create</button>
					</div>
				</form>
			</Fragment>
		);
	}
}

class NoteEditorSettings extends Component {
	render() {
		return(
			<div></div>
		);
	}
}

class NoteEditor extends Component {
	constructor(props) {
		super(props);

		this.state = {
			editState: EditorState.createEmpty(),
			editorEmpty: true
		}
	}

	syncAppState = () => { // editorEmpty?
		this.setState(() => ({ // XXX
			editorEmpty: stateToHTML(this.state.editState.getCurrentContent()).toString() === "<p><br></p>"
		}));
	}

	editText = (state = null, action = "") => {
		if(!state && !action) throw new Error("Editor: Invalid arguments pack");

		let a = {
			"ITALIC": "toggleInlineStyle",
			"BOLD": "toggleInlineStyle",
			"UNDERLINE": "toggleInlineStyle",
			"header-one": "toggleBlockType",
			"header-two": "toggleBlockType",
			"header-three": "toggleBlockType",
			"header-four": "toggleBlockType",
			"header-five": "toggleBlockType",
			"ordered-list-item": "toggleBlockType",
			"unordered-list-item": "toggleBlockType",
			"code-block": "toggleBlockType",
			"blockquote": "toggleBlockType"
		}

		if(Object.keys(a).includes(action)) {
			state = RichUtils[a[action]](
				this.state.editState,
				action
			);
		} else if(!state) {
			return console.error("Editor: Invlid action");
		}

		// props.editorState.getCurrentInlineStyle

		// Receive, send data
		// stateFromHTML // this.state.editState.getCurrentContent()
		// stateToHTML // this.state.editState.getCurrentContent()

		// Get clear content ||||||||          /<\/?[^>]+(>|$)/g
		// stateToHTML(this.state.editState.getCurrentContent()).toString().replace(/<\/?[^>]+(>|$)/g, "")

		this.setState(() => ({
			editState: state
		}), this.syncAppState);
	}

	render() {
		return(
			<div className="rn-notes-editor">
				<div className="rn-notes-editor-smcontrols">
					{
						[
							{
								icon: <i className="fas fa-chevron-left" />,
								editClass: "back-nav",
								action: () => null
							},
							{
								icon: <i className="fas fa-bold" />,
								editClass: null,
								execStyle: "BOLD",
								action: () => this.editText(null, "BOLD")
							},
							{
								icon: <i className="fas fa-italic" />,
								editClass: null,
								execStyle: "ITALIC",
								action: () => this.editText(null, "ITALIC")
							},
							{
								icon: <i className="fas fa-underline" />,
								editClass: null,
								execStyle: "UNDERLINE",
								action: () => this.editText(null, "UNDERLINE")
							},
							{
								icon: <i className="fas fa-quote-right" />,
								editClass: null,
								execStyle: false,
								action: () => this.editText(null, "blockquote")
							},
							{
								icon: <i className="fas fa-code" />,
								editClass: null,
								execStyle: false,
								action: () => this.editText(null, "code-block")
							},
							{
								icon: <i className="fas fa-list-ul" />,
								editClass: null,
								execStyle: false,
								action: () => this.editText(null, "unordered-list-item")
							},
							{
								icon: <i className="fas fa-list-ol" />,
								editClass: null,
								execStyle: false,
								action: () => this.editText(null, "ordered-list-item")
							},
							{
								icon: <i className="fas fa-font" />,
								editClass: "font-h1",
								execStyle: false,
								action: () => this.editText(null, "header-one")
							},
							{
								icon: <i className="fas fa-font" />,
								editClass: "font-h2",
								execStyle: false,
								action: () => this.editText(null, "header-two")
							},
							{
								icon: <i className="fas fa-font" />,
								editClass: "font-h3",
								execStyle: false,
								action: () => this.editText(null, "header-three")
							},
							{
								icon: <i className="fas fa-font" />,
								editClass: "font-h4",
								execStyle: false,
								action: () => this.editText(null, "header-four")
							},
							{
								icon: <i className="fas fa-font" />,
								editClass: "font-h5",
								execStyle: false,
								action: () => this.editText(null, "header-five")
							}, /* We don't need h6 here... */
						].map(({ icon, editClass, action, execStyle }, index) => (
							<button
								key={ index }
								className={ `definp rn-notes-editor-smcontrols-btn${ (editClass) ? " " + editClass : "" }${ (!execStyle || !this.state.editState.getCurrentInlineStyle().has(execStyle)) ? "" : " active" }` }
								onClick={ action }>
								{ icon }
							</button>
						))
					}
				</div>
				<div className={ `rn-notes-editor-display${ (!this.state.editorEmpty) ? "" : " empty" }` }>
					<Editor
						onChange={ this.editText }
						editorState={ this.state.editState }
					/>
				</div>
				<div className="rn-notes-editor-settingscall">
					<button className="rn-notes-editor-settingscall-btn definp">
						<i class="fas fa-cog" />
					</button>
				</div>
			</div>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isNewModal: false,
			notes: false
		}
	}

	componentDidMount() {
		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't load your notes. Please, try later.";

		client.query({
			query: gql`
				query($id: ID!, $authToken: String!, $contrLimit: Int, $contentLimit: Int) {
					user(id: $id, authToken: $authToken) {
						id,
						notes {
							id,
							title,
							content(limit: $contentLimit),
							currWords,
							estWords,
							contributors(limit: $contrLimit) {
								id,
								avatar
							}
						}
					}
				}
			`,
			variables: {
				id,
				authToken,
				contrLimit: 3,
				contentLimit: 16 // words
			}
		}).then(({ data: { user: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			this.setState(() => ({
				notes: a.notes
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	createNote = (title, words) => {
		// Close modal
		this.setState(() => ({
			isNewModal: false
		}));

		// Prevent inc
		if(!this.state.notes) return;

		// Authtoken and err message
		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't create a new note. Please try again.";

		// Send a mutation request
		client.mutate({
			mutation: gql`
				mutation($id: ID!, $authToken: String!, $title: String!, $words: Int!, $contrLimit: Int, $contentLimit: Int) {
				  createNote(
				    id: $id
				    authToken: $authToken,
				    title: $title
				    words: $words
				  ) {
				    id,
					title,
					content(limit: $contentLimit),
					currWords,
					estWords,
					contributors(limit: $contrLimit) {
						id,
						avatar
					}
				  }
				}
			`,
			variables: {
				id, authToken,
				title, words,
				contrLimit: 3,
				contentLimit: 16	
			}
		}).then(({ data: { createNote: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			this.setState(({ notes }) => ({
				notes: [
					a,
					...notes
				]
			}));

		}).catch(() => this.props.castError(errorTxt));
	}

    render() {
        return (
            <div className="rn rn-notes">
				<div className="rn-notes-grid">
					{
						(this.state.notes) ? (
							<Fragment>
								<Note
									isVoid={ true }
									_onClick={ () => this.setState(() => ({ isNewModal: true })) }
								/>
								{
									this.state.notes.map(({ id, title, content, currWords, estWords, contributors }) => (
										<Note
											key={ id }
											title={ title }
											content={ content }
											currWords={ currWords }
											estWords={ estWords }
											contributors={ contributors }
											isVoid={ false }
										/>
									))
								}
							</Fragment>
						) : (
							<Loadericon
								style={{
									marginLeft: "auto",
									marginRight: "auto",
									marginTop: "20px"
								}}
							/>
						)
					}
				</div>
				<NoteCreator
					visible={ this.state.isNewModal }
					onClose={ () => this.setState(() => ({ isNewModal: false })) }
					_onSubmit={ this.createNote }
				/>
				<NoteEditor />
			</div>
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
)(App);