import React, { Component, Fragment } from 'react';
import './main.css';

import Loadericon from '../__forall__/loader.icon';
import NoteEditorSettings from './NoteEditorSettings';
import NoteCreatorInput from  './NoteCreatorInput';

import { gql } from 'apollo-boost';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { Editor, EditorState, RichUtils } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';

import client from '../../apollo';
import { cookieControl } from '../../utils';
import links from '../../links';
import api from '../../api';

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
				or about your homework. Do can do whatever you want.
				<br /><br />Just start editing this note...</Fragment>),

				(<Fragment>There is nothing here yet, but you can invite your friends to help you.
				<br /><br />You can write things here...</Fragment>),

				(<Fragment>It's an empty note, but you can always start using it.
				<br /><br />Just start typing text...</Fragment>),

				(<Fragment>An unknown UFO cleared everything that was here... but wait,
					maybe you just didn't write anything yet something.
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
		else if(d > 50 && d < 100) c = "highcontent";
		else c = "fullcontent";

		return c;
	}

    render() {
        return (
            <div className={ `rn-notes-item ${ (!this.props.isVoid) ? "default" : "void" }${ (!this.props.isVoid) ? " " + this.getProgressClass() : "" }` } onClick={ this.props._onClick }>
				{
					(!this.props.isVoid) ? (
						<Fragment>
							<div className="rn-notes-item__default-section" onClick={ this.props._onClick }>
								<h3 className="rn-notes-item-title">{ this.props.title }</h3>
								{
									(this.props.content.replace(/\s|\n/g, "").length) ? (
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
							<div className="rn-notes-item__default-progress" onClick={ this.props._onClick }>
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

class NoteEditorCloseAlert extends Component {
	render() {
		return(
			<Fragment>
				<div className={ `rn-notes-editor-closealert__control${ (!this.props.active) ? "" : " active" }` } onClick={ this.props.onClose } />
				<div className="rn-notes-editor-closealert">
					<h3 className="rn-notes-editor-closealert-title">Exit without saving?</h3>
					<p className="rn-notes-editor-closealert-content">You're trying exit editor without saving the document. Do you wanna save it?</p>
					<div className="rn-notes-editor-closealert-val">
						<button type="button" className="definp rn-notes-previewmodal-controls-btn cancel" onClick={ this.props.onClose }>Cancel</button>
						<button type="button" className="definp rn-notes-previewmodal-controls-btn submit" onClick={ this.props.onExit }>Exit</button>
						<button type="button" className="definp rn-notes-previewmodal-controls-btn accept" onClick={ this.props.onExitSave }>Save and Exit</button>
					</div>
				</div>
			</Fragment>
		);
	}
}

class NoteEditor extends Component {
	constructor(props) {
		super(props);

		this.state = {
			editState: EditorState.createEmpty(),
			settingsOpen: false,
			showPlaceholder: true,
			warningNSaveExit: false
		}

		this.editorMat = React.createRef();
		this.savingInt = null;
		this.lastContent = null;
	}

	componentDidUpdate(prevProps) {
		if(
			(!prevProps.data && this.props.data) ||
			(prevProps.data && this.props.data && prevProps.data.id !== this.props.data.id)
		) { // set editor state
			return this.setState(() => ({
				editState: EditorState.createWithContent(stateFromHTML(this.props.data.contentHTML)),
			}), () => {
				this.lastContent = this.state.editState.getCurrentContent().getPlainText();
			});
		}

		{
			let a = this.getEditorBlock();

	        if(this.state.editorCBlock !== a) {
		    	this.setState(() => ({
		    		editorCBlock: a,
		    		showPlaceholder: a === 'unstyled'
		    	}));
	    	}
		}
	}

	focusEditor = () => {
		this.editorMat.focus();
	}

	getEditorBlock = () => {
		let a = this.state.editState;
	    return a.getCurrentContent() // // I HATE MYSELF
	          .getBlockForKey(a.getSelection().getStartKey())
	          .getType();
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
		},
			b = false; // styled

		if(Object.keys(a).includes(action)) {
			state = RichUtils[a[action]](
				this.state.editState,
				action
			);
			b = true;
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
		}), () => this.saveDocument(b));
	}

	saveDocument = (force = false) => {
		let a = this.state.editState.getCurrentContent().getPlainText();
		if((this.lastContent !== a || force) && !this.savingInt) {
			this.lastContent = a;
			this.savingInt = setTimeout(() => {
				this.savingInt = null;
				this.props.onSave(
					this.props.data.id,
					stateToHTML(this.state.editState.getCurrentContent())
				);
			}, 300); // refresh freq
		}
	}

	closeDoc = (force = false) => {
		if(force || this.props.docSaved) {
			this.props.onClose();
		} else {
			this.setState(() => ({
				warningNSaveExit: true
			}));
		}
	}

	render() {
		if(!this.props.active) return null;
		if(this.props.data === false) { // loading
			return(
				<div className="rn-notes-editor">
					<Loadericon />
				</div>
			);
		}

		return(
			<Fragment>
				<div className="rn-notes-editor">
					<div className="rn-notes-editor-smcontrols">
						{
							[
								{
									icon: <i className="fas fa-chevron-left" />,
									editClass: "head-control",
									action: () => this.closeDoc(false)
								},
								{
									icon: (!this.state.warningNSaveExit) ? (
										(!this.props.docSaved) ? (
											<div key="A"><i className="fas fa-save" /></div>
										) : (
											<div key="B"><i className="fas fa-cloud" /></div>
										)
									) : (
										<div key="C"><i className="fas fa-question" /></div>
									),
									editClass: "head-control last",
									action: this.saveDocument
								},
								{
									icon: <i className="fas fa-bold" />,
									editClass: null,
									execStyle: "BOLD",
									action: e => { e.preventDefault(); this.editText(null, "BOLD") }
								},
								{
									icon: <i className="fas fa-italic" />,
									editClass: null,
									execStyle: "ITALIC",
									action: e => { e.preventDefault(); this.editText(null, "ITALIC") }
								},
								{
									icon: <i className="fas fa-underline" />,
									editClass: null,
									execStyle: "UNDERLINE",
									action: e => { e.preventDefault(); this.editText(null, "UNDERLINE") }
								},
								{
									icon: <i className="fas fa-quote-right" />,
									editClass: null,
									execBlock: "blockquote",
									action: e => { e.preventDefault(); this.editText(null, "blockquote") }
								},
								{
									icon: <i className="fas fa-code" />,
									editClass: null,
									execBlock: "code-block",
									action: e => { e.preventDefault(); this.editText(null, "code-block") }
								},
								{
									icon: <i className="fas fa-list-ul" />,
									editClass: null,
									execBlock: "unordered-list-item",
									action: e => { e.preventDefault(); this.editText(null, "unordered-list-item") }
								},
								{
									icon: <i className="fas fa-list-ol" />,
									editClass: null,
									execBlock: "ordered-list-item",
									action: e => { e.preventDefault(); this.editText(null, "ordered-list-item") }
								},
								{
									icon: <i className="fas fa-font" />,
									editClass: "font-h1",
									execBlock: "header-one",
									action: e => { e.preventDefault(); this.editText(null, "header-one") }
								},
								{
									icon: <i className="fas fa-font" />,
									editClass: "font-h2",
									execBlock: "header-two",
									action: e => { e.preventDefault(); this.editText(null, "header-two") }
								},
								{
									icon: <i className="fas fa-font" />,
									editClass: "font-h3",
									execBlock: "header-three",
									action: e => { e.preventDefault(); this.editText(null, "header-three") }
								},
								{
									icon: <i className="fas fa-font" />,
									editClass: "font-h4",
									execBlock: "header-four",
									action: e => { e.preventDefault(); this.editText(null, "header-four") }
								},
								{
									icon: <i className="fas fa-font" />,
									editClass: "font-h5",
									execBlock: "header-five",
									action: e => { e.preventDefault(); this.editText(null, "header-five") }
								}, /* We don't need h6 here... */
							].map(({ icon, editClass, action, execStyle, execBlock }, index) => (
								<button
									key={ index }
									className={ `definp rn-notes-editor-smcontrols-btn${ (editClass) ? " " + editClass : "" }${ ( (execStyle && this.state.editState.getCurrentInlineStyle().has(execStyle)) || (execBlock && this.state.editorCBlock === execBlock) ) ? " active" : "" }` }
									onMouseDown={ action }
									style={{
										animationDelay: (index + 1) * .15 + "s"
									}}>
									{ icon }
								</button>
							))
						}
					</div>
					<div className="rn-notes-editor-display">
						<Editor
							onChange={ this.editText }
							editorState={ this.state.editState }
							ref={ ref => this.editorMat = ref }
							placeholder={ (this.state.showPlaceholder) ? "Start typing text..." : "" }
							blockStyleFn={a => {
								let b = a.getType();

								switch(b) {
									case 'blockquote': return "rn-notes-editor-edsts__INCLUDES__-blockquote";
									default:break;
								}
							}}
						/>
					</div>
					<div className="rn-notes-editor-settingscall" onClick={ () => this.setState(() => ({ settingsOpen: true })) }>
						<button className="rn-notes-editor-settingscall-btn definp">
							<i className="fas fa-cog" />
						</button>
					</div>
					<NoteEditorSettings
						targetID={ this.props.data.id }
						clientHost={ this.props.data.clientHost }
						active={ this.state.settingsOpen }
						currentTitle={ this.props.data.title }
						currentExword={ this.props.data.estWords }
						onClose={ () => this.setState(() => ({ settingsOpen: false })) }
						_onSubmit={(title, words) => {
							this.props.onSettingNote(title, words, this.props.data.id);
							this.setState(() => ({ settingsOpen: false }));
						}}
					/>
				</div>
			<NoteEditorCloseAlert
				active={ this.state.warningNSaveExit }
				onClose={ () => this.setState({ warningNSaveExit: false }) }
				onExit={ () => this.setState(() => ({ warningNSaveExit: false }), () => this.closeDoc(true)) }
				onExitSave={ () => { this.saveDocument(true); this.setState(() => ({ warningNSaveExit: false }), () => this.closeDoc(true)); } }
			/>
			</Fragment>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isNewModal: false,
			notes: false,
			editorOpened: false,
			editorData: null,
			editorSaved: true
		}

		this.editorSaves = 0;
	}

	componentDidMount() {
		this.loadNotesList();
	}

	loadNotesList = () => {
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

	loadNote = targetID => {
		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "An error occured while we tried to load the note. Maybe website was loaded incorrectly. Please, restart the page.";

		this.setState(() => ({
			editorData: false,
			editorOpened: true
		}));

		client.query({
			query: gql`
				query($id: ID!, $authToken: String!, $targetID: ID!) {
					note(id: $id, authToken: $authToken, targetID: $targetID) {
						id,
						contentHTML,
						title,
						estWords,
						clientHost(id: $id)
					}
				}
			`,
			variables: {
				id, authToken,
				targetID
			}
		}).then(({ data: { note: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			this.setState(() => ({
				editorData: a
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	saveNote = (targetID, content) => {
		// WARNING: Content variable has fixed type: HTML
		const save = ++this.editorSaves;
		this.setState(() => ({
			editorSaved: false
		}));

		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't save the note. You can find last update in backups.";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $authToken: String!, $targetID: ID!, $content: String!, $contrLimit: Int, $contentLimit: Int) {
					saveNote(id: $id, authToken: $authToken, targetID: $targetID, content: $content) {
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
				targetID, content,
				contrLimit: 3,
				contentLimit: 16
			}
		}).then(({ data: { saveNote: a } }) => {
			if(save < this.editorSaves) return;
			if(!a) return this.props.castError(errorTxt);

			this.setState(() => ({
				editorSaved: true
			}));

			if(this.state.notes) {
				let b = Array.from(this.state.notes),
					c = b.findIndex(io => io.id === a.id);
				if(c !== -1) {
					b[c] = a;
					this.setState(() => ({
						notes: b
					}));
				}
			}
		}).catch(() => this.props.castError(errorTxt));
	}

	settingNote = (title, words, targetID) => {
		if((!title && !words) || !targetID || !this.state.editorData) return;

		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't submit these settings. Please, try later."

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $authToken: String!, $targetID: ID!, $title: String, $esWords: Int) {
					settingNote(id: $id, authToken: $authToken, targetID: $targetID, title: $title, esWords: $esWords) {
						id,
						title,
						currWords,
						estWords
					}
				}
			`,
			variables: {
				id, authToken,
				targetID, title,
				esWords: words
			}
		}).then(({ data: { settingNote: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			if(this.state.editorData) {
				this.setState(({ editorData }) => ({
					editorData: {
						...editorData,
						...a
					}
				}));
			}
			if(this.state.notes) {
				let b = Array.from(this.state.notes),
					c = b.findIndex(io => io.id === a.id);

				if(c !== -1) {
					b[c].id = a.id;
					b[c].title = a.title;
					b[c].currWords = a.currWords;
					b[c].estWords = a.estWords;

					this.setState(() => ({
						notes: b
					}));
				}
			}
		}).catch(() => this.props.castError(errorTxt));
	}

	closeEditor = () => {
		// Close editor and update notes 
		this.setState({ editorOpened: false });
		this.loadNotesList();
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
											_onClick={ () => this.loadNote(id) }
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
				<NoteEditor
					data={ this.state.editorData }
					active={ this.state.editorOpened }
					docSaved={ this.state.editorSaved }
					onSave={ this.saveNote }
					onClose={ this.closeEditor }
					onSettingNote={ this.settingNote }
				/>
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