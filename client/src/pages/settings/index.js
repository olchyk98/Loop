import React, { Component } from 'react';
import './main.css';

import Switch from '../__forall__/switcher';

class Input extends Component {
	render() {
		return(
			<div className="rn-settings-isl-input">
				<span className="rn-settings-isl-input-title">{ this.props.title }</span>
				<div className="rn-settings-isl-input-field">
					<input
						type={ this.props._type }
						className="definp"
						placeholder={ this.props._placeholder }
						onChange={ ({ target: { value } }) => this.props._onChange(value) }
					/>
					<div></div>
				</div>
			</div>
		);
	}
}

class App extends Component {
	render() {
		return(
			<div className="rn rn-settings">
				<div className="rn-settings-account">
					<span className="rn-settings-account-title">Your account:</span>
					<span className="rn-settings-account-name">Oles Odynets</span>
					<span className="rn-settings-account-login">oles</span>
				</div>
				<form className="rn-settings-isl rn-settings-preferences">
					<span className="rn-settings-isl-title">Preferences</span>
					<span className="rn-settings-isl-desc">Here you can change login and password for your account.</span>
					<Input
						_type="text"
						title="Login"
						_placeholder="set190283"
						_onChange={ value => null }
					/>
					<Input
						_type="password"
						title="Password"
						_placeholder=""
						_onChange={ value => null }
					/>
					<button type="button" className="rn-settings-isl-submit definp">Update</button>
				</form>
				<div className="rn-settings-isl rn-settings-design">
					<span className="rn-settings-isl-title">Design Settings</span>
					<span className="rn-settings-isl-desc">Here you can customize the external site.</span>
					<div className="rn-settings-isl-st">
						<span>Dark Mode</span>
						<Switch
							_onChange={ value => null }
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default App;