import React, { Component, Fragment } from 'react';
import './main.css';

import { connect } from 'react-redux';

class Hero extends Component {
	render() {
		if(!this.props.active) return null; // TESTME

		return(
			<Fragment>
				<div className="rn-notes-editor-closealert__control" onClick={ () => this.props.controlDialog(false, null) } />
				<div className="rn-notes-editor-closealert">
					<h3 className="rn-notes-editor-closealert-title">{ this.props.title }</h3>
					<p className="rn-notes-editor-closealert-content">{ this.props.content }</p>
					<div className="rn-notes-editor-closealert-val">
						{
							this.props.buttons.map((session, index) => (
								<button key={ index } type="button" className={ `definp rn-notes-previewmodal-controls-btn ${ session.color || "submit" }` } onClick={ session.action }>{ session.content }</button>
							))
						}
					</div>
				</div>
			</Fragment>
		);
	}
}

const mapStateToProps = ({ session }) => ({
	...session.visibleDialogData,
	active: session.visibleDialog
});

const mapActionsToProps = {
	controlDialog: (active, data) => ({ type: 'RUN_DIALOG', payload: { active, data } })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(Hero);