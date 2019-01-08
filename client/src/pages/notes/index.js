import React, { Component, Fragment } from 'react';
import './main.css';

class Note extends Component {
	render() {
		return(
			<div className="rn-notes-item void">
				{
					(!this.props.isVoid) ? (
						null
					) : (
						<Fragment>
							<div className="rn-notes-item__void-plusicon">
								<i className="fas fa-plus" />
							</div>
							<h3 className="rn-notes-item__void-title">Add new note</h3>
							<p className="rn-notes-item__void-desc">
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
				<Note
					isVoid={ true }
				/>
			</div>
		);
	}
}

export default App;