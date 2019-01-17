import React, { Component, Fragment } from 'react';
import './main.css';

const Icon = ({ icon, tooltip }) => (
	<div className="coi-bandsrail-icon">
		{ icon }
		<div className="coi-bandsrail-icon-tt">{ tooltip }</div>
	</div>
)

class App extends Component {
	library = {
		"CREATOR_ICON": {
			icon: <i className="fas fa-circle-notch" />,
			tooltip: <Fragment>This person created <strong>TunaConnect</strong></Fragment>
		}
	}

	render() {
		return(
			<div className="coi-bandsrail">
				{
					[
						"CREATOR_ICON"
					].map((session, index) => {
						const { icon, tooltip } = this.library[session];

						return(
							<Icon
								key={ index }
								icon={ icon }
								tooltip={ tooltip }
							/>
						);
					})
				}
			</div>
		);
	}
}

export default App;