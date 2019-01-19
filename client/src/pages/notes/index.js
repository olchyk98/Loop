import React, { Component, Fragment } from 'react';
import './main.css';

import Loadericon from '../__forall__/loader.icon';
import NoteEditorSettings from './NoteEditorSettings';
import NoteCreatorInput from  './NoteCreatorInput';
import PlaceholderGF from '../__forall__/placeholder.gif'

import { gql } from 'apollo-boost';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
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
				or about your homework. You can write whatever you want.
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

class NoteEditor extends Component {
	constructor(props) {
		super(props);

		this.state = {
			editState: EditorState.createEmpty(),
			settingsOpen: false,
			showPlaceholder: true,
			internalData: null
		}

		this.editorMat = React.createRef();
		this.lastContent = this.saveInt = this.editorSubscription = null;
	}

	componentDidUpdate(prevProps) {
		if(
			(!prevProps.data && this.props.data) ||
			(prevProps.data && this.props.data && prevProps.data.id !== this.props.data.id)
		) { // set editor state
			(this.editorSubscription && this.editorSubscription());

			return this.setState(() => ({
				internalData: null,
				editState: EditorState.createWithContent(stateFromHTML(this.props.data.contentHTML)),
			}), () => {
				this.lastContent = this.state.editState.getCurrentContent().getPlainText();
				this.subscribeToNote();
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
	    return a.getCurrentContent()
	          .getBlockForKey(a.getSelection().getStartKey())
	          .getType();
	}

	subscribeToNote = () => {
		const { id } = cookieControl.get("authdata"),
			  errorTxt = "Something went wrong. Please, restart the page.";

		client.subscribe({
			query: gql`
				subscription($id: ID! $targetID: ID!) {
					listenNoteUpdates(id: $id targetID: $targetID) {
						id,
						contentHTML,
						estWords,
						title
					}
				}
			`,
			variables: {
				id,
				targetID: this.props.data.id
			}
		}).subscribe({
			next: ({ data: { listenNoteUpdates: a } }) => {
				if(!a) return this.props.castError(errorTxt);

				// Issue: When the state updates by subscription hh the cursor jumps to the beginning.
				/*[ https://github.com/facebook/draft-js/issues/1975 ]*/
				// Fix: I'm not sure about performance and is it the best way to do that.

				let prevC = this.state.editState.getSelection()
				
				let blocks = convertToRaw(this.state.editState.getCurrentContent()).blocks,
					newState = EditorState.createWithContent(stateFromHTML(a.contentHTML));

				convertToRaw(newState.getCurrentContent()).blocks.forEach((io, ia) => {
					if(!blocks[ia]) { // new block
						blocks.push(io);
					} else { // blocks[ia].text !== io.getText() || blocks[ia].type !== io.getType()
						io.key = blocks[ia].key;
						blocks[ia] = io;
					}
				});

				let preparState = convertToRaw(this.state.editState.getCurrentContent());
				preparState.blocks = blocks;
				newState = EditorState.forceSelection(
					EditorState.createWithContent(convertFromRaw(preparState)),
					prevC
				);

				this.setState(() => ({
					internalData: {
						...this.props.data,
						...a
					},
					// editState: EditorState.createWithContent(stateFromHTML(a.contentHTML)),
					// editState: EditorState.moveFocusToEnd(EditorState.createWithContent(stateFromHTML(a.contentHTML))),
					editState: newState
				}), () => {
					this.lastContent = this.state.editState.getCurrentContent().getPlainText();
				});
			},
			catch: () => this.props.castError(errorTxt)
		})
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
		if(this.saveInt) return;
	
		let a = this.state.editState.getCurrentContent().getPlainText();
		if((this.lastContent !== a || force)) {
			this.saveInt = setTimeout(() => {
				this.saveInt = null;

				this.lastContent = a;
				this.props.onSave(
					(this.state.internalData && this.state.internalData.id) || this.props.data.id,
					stateToHTML(this.state.editState.getCurrentContent())
				);
			}, 200) // 0.1s
		}
	}

	closeDoc = (force = false) => {
		if(this.props.docSaved || force) {
			this.props.onClose();
		} else {
			this.props.runFrontDialog(true, {
				title: "Exit without saving?",
				content: "You're trying to exit editor without saving the document. Do you wanna save it?",
				buttons: [
					{
						color: "cancel",
						action: () => this.props.runFrontDialog(false, null),
						content: "Cancel"
					},
					{
						color: "submit",
						action: () => {
							this.props.runFrontDialog(false, null);
							this.closeDoc(true);
						},
						content: "Exit"
					},
					{
						color: "accept",
						action: () => { this.saveDocument(true); this.props.runFrontDialog(false, null); this.closeDoc(true); },
						content: "Save and Exit"
					}
				]
			});
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
						targetID={ (this.state.internalData && this.state.internalData.id) || this.props.data.id }
						clientHost={ (this.state.internalData && this.state.internalData.clientHost) || this.props.data.clientHost }
						active={ this.state.settingsOpen }
						currentTitle={ (this.state.internalData && this.state.internalData.title) || this.props.data.title }
						currentExword={ (this.state.internalData && this.state.internalData.estWords) || this.props.data.estWords }
						onClose={ () => this.setState(() => ({ settingsOpen: false })) }
						_onSubmit={(title, words) => {
							this.props.onSettingNote(title, words, (this.state.internalData && this.state.internalData.id) || this.props.data.id);
							this.setState(() => ({ settingsOpen: false }));
						}}
					/>
				</div>
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
		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't load your notes. Please, try later.";

		client.query({
			query: gql`
				query($id: ID!, $contrLimit: Int, $contentLimit: Int) {
					user(id: $id) {
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
		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't create a new note. Please try again.";

		// Send a mutation request
		client.mutate({
			mutation: gql`
				mutation($id: ID!, $title: String!, $words: Int!, $contrLimit: Int, $contentLimit: Int) {
				  createNote(
				    id: $id,
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
				id,
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
		const { id } = cookieControl.get("authdata"),
			  errorTxt = "An error occured while we tried to load the note. Maybe website was loaded incorrectly. Please, restart the page.";

		this.setState(() => ({
			editorData: false,
			editorOpened: true
		}));

		client.query({
			query: gql`
				query($id: ID!, $targetID: ID!) {
					note(id: $id, targetID: $targetID) {
						id,
						contentHTML,
						title,
						estWords,
						clientHost(id: $id)
					}
				}
			`,
			variables: {
				id,
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

		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't save the note. You can find last update in backups.";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $targetID: ID!, $content: String!, $contrLimit: Int, $contentLimit: Int) {
					saveNote(id: $id, targetID: $targetID, content: $content) {
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
				id,
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

		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't submit these settings. Please, try later."

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $targetID: ID!, $title: String, $esWords: Int) {
					settingNote(id: $id, targetID: $targetID, title: $title, esWords: $esWords) {
						id,
						title,
						currWords,
						estWords
					}
				}
			`,
			variables: {
				id,
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
							<Fragment>
								<img className="rn-notes-grid-item__placeholder" alt="placeholder" src={ PlaceholderGF } />
								<img className="rn-notes-grid-item__placeholder" alt="placeholder" src={ PlaceholderGF } />
								<img className="rn-notes-grid-item__placeholder" alt="placeholder" src={ PlaceholderGF } />
								<img className="rn-notes-grid-item__placeholder" alt="placeholder" src={ PlaceholderGF } />
								<img className="rn-notes-grid-item__placeholder" alt="placeholder" src={ PlaceholderGF } />
								<img className="rn-notes-grid-item__placeholder" alt="placeholder" src={ PlaceholderGF } />
							</Fragment>
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
					runFrontDialog={ this.props.runFrontDialog }
				/>
			</div>
        );
    }
}

const mapStateToProps = () => ({});

const mapActionsToProps = {
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } }),
	runFrontDialog: (active, data) => ({ type: 'RUN_DIALOG', payload: { active, data } })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(App);