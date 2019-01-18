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
		},
		"TESTER_ICON": {
			icon: <i className="fas fa-wrench" />,
			tooltip: <Fragment>This person tests <strong>TunaConnect</strong></Fragment>
		},
		"DEVELOPER_ICON": {
			icon: <i className="fas fa-hammer" />,
			tooltip: <Fragment>This person develops <strong>TunaConnect</strong></Fragment>
		},
		"SUPPORT_ICON": {
			icon: <i className="fas fa-headset" />,
			tooltip: <Fragment>This person can help you with your problems on <strong>TunaConnect</strong></Fragment>
		},
		"SELECTED_ICON": {
			icon: <i className="fas fa-check-circle" />,
			tooltip: "This user is verified"
		}
	}

	render() {
		if(!this.props.labels) return null;

		return(
			<div className="coi-bandsrail">
				{
					this.props.labels.map((session, index) => {
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