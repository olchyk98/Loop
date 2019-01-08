import React, { Component, Fragment } from 'react';
import './main.css';

const image = "https://yt3.ggpht.com/-qkiz6poo350/AAAAAAAAAAI/AAAAAAAAAAA/tKffXgsObqs/s48-c-k-no-mo-rj-c0xffffff/photo.jpg";

class NoteContributor extends Component {
	render() {
		return(
			<div className="rn_notes-item__default-edtiro-item">
				<img alt="contributor" src={ image } />
			</div>
		);
	}
}

class Note extends Component {
	render() {
		return(
			<div className={ `rn-notes-item ${ (!this.props.isVoid) ? "default" : "void" }` }> {/* lowcontent, mediumcontent, highcontent, fullcontent */}
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

class App extends Component {
	render() {
		return(
			<div className="rn rn-notes">
				<div className="rn-notes-grid">
					<Note
						isVoid={ true }
					/>
					<Note
						isVoid={ false }
					/>
				</div>
			</div>
		);
	}
}

export default App;