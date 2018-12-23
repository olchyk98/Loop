import React, { Component } from 'react';
import './main.css';

import { connect } from 'react-redux';
import { gql } from 'apollo-boost';

import { cookieControl } from '../../utils';
import client from '../../apollo';

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
						onChange={ ({ target: { value } }) => this.props._onChange(value) }
						defaultValue={ this.props._defaultValue }
					/>
					{
						(this.props.allowed === null) ? <div /> : (
							<div className={ (this.props.allowed) ? "accepted" : "denied" } key={ (this.props.allowed) ? "A" : "B" }>
								{ (this.props.allowed) ? (
									<i className="fas fa-check" />
								) : (
									<i className="fas fa-times" />
								) }
							</div>
						)
					}
				</div>
			</div>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isSubmiting: false,
			userLogin: "",
			userLoginAllowed: null,
			userName: "",
			accountSubmited: false,
			data: {
				name: "",
				login: "",
				password: ""
			}
		}

		this.loginVInt = null;
	}

	componentDidMount() {
		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't connect to the server. Please, check your internet connection."

		client.query({
			query: gql`
				query($id: ID!, $authToken: String!) {
					user(id: $id, authToken: $authToken) {
						id,
						login,
						name
					}
				}
			`,
			variables: {
				id, authToken
			}
		}).then(({ data: { user } }) => {
			if(!user) return this.props.castError(errorTxt);

			this.setState(() => ({
				userLogin: user.login,
				userName: user.name
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	setValue = (stage, value) => {
		this.setState(({ data }) => ({
			data: {
				...data,
				[stage]: value
			}
		}));
	}

	submitSettings = stage => {
		let xs = this.state;
		if(
			xs.userLoginAllowed === false ||
			xs.isSubmiting ||
			xs.accountSubmited ||
			xs.userLogin === xs.data.login ||
			xs.userName === xs.data.name ||
			!xs.data.password.length
		) return;

		this.setState(() => ({
			isSubmiting: true
		}));

		switch(stage) {
			case 'MAIN_BLOCK': {
				const { id, authToken } = cookieControl.get("authdata"),
					  { login, password, name } = xs.data,
					  errorTxt = "We couldn't submit new data. Please, try later."

				client.mutate({
					mutation: gql`
						mutation($id: ID!, $authToken: String!, $name: String, $login: String, $password: String) {
							settingProfile(id: $id, authToken: $authToken, name: $name, login: $login, password: $password) {
								id,
								login,
								name
							}
						}
					`,
					variables: {
						id, authToken,
						login, password, name
					}
				}).then(({ data: { settingProfile: a } }) => {
					this.setState(() => ({
						isSubmiting: false
					}));
					if(!a) return this.props.castError(errorTxt);

					this.props.setUserData({
						name: a.name
					});

					this.setState(() => ({
						accountSubmited: true,
						userLogin: a.login,
						userName: a.name,
						data: {
							name: "",
							login: "",
							password: ""
						}
					}), () => {
						setTimeout(() => this.setState(() => ({
							accountSubmited: false
						})), 1000)
					});
				}).catch(() => this.props.castError(errorTxt));
			}
			break;
			default:break;
		}
	}

	validateUser = (field, value) => {
		if(field === "login") {
			if(!value.replace(/\s|\n/g, "").length || value === this.state.userLogin) {
				return this.setState(() => ({
					userLoginAllowed: null
				}));
			}

			this.setState(() => ({
				isSubmiting: true
			}));

			client.query({
				query: gql`
					query($login: String!) {
						loginExists(login: $login)
					}
				`,
				variables: { login: value }
			}).then(({ data: { loginExists: allowed } }) => {
				this.setState(({ data }) => ({
					isSubmiting: false,
					userLoginAllowed: allowed
				}));
			}).catch(() => this.props.castError("We couldn't connect to our database. Please, restart the page."));
		}
	}

	render() {
		return(
			<div className="rn rn-settings">
				<div className={ `rn-settings-account${ (!this.state.accountSubmited) ? "" : " active" }` }>
					<span className="rn-settings-account-title">Your account:</span>
					<span className="rn-settings-account-name">{ this.state.userName }</span>
					<span className="rn-settings-account-login">{ this.state.userLogin }</span>
				</div>
				<form className="rn-settings-isl rn-settings-preferences" onSubmit={ e => e.preventDefault() || this.submitSettings("MAIN_BLOCK") }>
					<span className="rn-settings-isl-title">Preferences</span>
					<span className="rn-settings-isl-desc">Here you can change login and password for your account.</span>
					<Input
						_type="text"
						title="Name"
						_onChange={ value => this.setValue("name", value) }
						_defaultValue={ this.state.userName }
						allowed={ null }
					/>
					<Input
						_type="text"
						title="Login"
						_onChange={ value => {
							this.setValue("login", value);

							clearTimeout(this.loginVInt);
							this.loginVInt = setTimeout(() => this.validateUser("login", value), 400);
						} }
						_defaultValue={ this.state.userLogin }
						allowed={ this.state.userLoginAllowed }
					/>
					<Input
						_type="password"
						title="Password"
						_onChange={ value => this.setValue("password", value) }
						allowed={ null }
					/>
					<button type="submit" className="rn-settings-isl-submit definp" disabled={ this.state.isSubmiting }>Update</button>
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

const mapStateToProps = ({ user }) => ({});

const mapActionsToProps = {
	setUserData: payload => ({ type: 'SET_USER_DATA', payload }),
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(App);