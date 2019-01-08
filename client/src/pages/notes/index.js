import React, { Component, Fragment } from 'react';
import './main.css';

const image = "https://yt3.ggpht.com/-qkiz6poo350/AAAAAAAAAAI/AAAAAAAAAAA/tKffXgsObqs/s48-c-k-no-mo-rj-c0xffffff/photo.jpg";

class NoteContributor extends Component {
    render() {
        return (
            <div className="rn_notes-item__default-edtiro-item">
				<img alt="contributor" src={ image } />
			</div>
        );
    }
}

class Note extends Component {
    render() {
        return (
            <div className={ `rn-notes-item ${ (!this.props.isVoid) ? "default" : "void" }` } onClick={ this.props._onClick }> {/* lowcontent, mediumcontent, highcontent, fullcontent */}
				{
					(!this.props.isVoid) ? (
						<Fragment>
							<div className="rn-notes-item__default-section">
								<h3 className="rn-notes-item-title">Building your first platform</h3>
								<p className="rn-notes-item-desc">
									Add new note to your notes section where you can add description,
									edit it with your friends.
								</p>
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
									<NoteContributor />
									<NoteContributor />
									<NoteContributor />
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

const NotePreviewInput = ({ example, valid, title, _onChange, value }) => (
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

class NotePreview extends Component {
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

	render() {
		return(
			<Fragment>
				<div className={ `rn-notes-previewmodalbg${ (!this.props.visible) ? "" : " visible" }` } onClick={ this.closeSelf } />
				<form className="rn-notes-previewmodal">
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
							<NotePreviewInput
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

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isNewModal: false
		}
	}

    render() {
        return (
            <div className="rn rn-notes">
				<div className="rn-notes-grid">
					<Note
						isVoid={ true }
						_onClick={ () => this.setState(() => ({ isNewModal: true })) }
					/>
					<Note
						isVoid={ false }
					/>
				</div>
				<NotePreview
					visible={ this.state.isNewModal }
					onClose={ () => this.setState(() => ({ isNewModal: false })) }
				/>
			</div>
        );
    }
}

export default App;