import React, { Component, Fragment } from 'react';
import './main.css';

import { gql } from 'apollo-boost';
import { connect } from 'react-redux';

import client from '../../apollo';
import { cookieControl } from '../../utils';
import links from '../../links';

// import registerbg from './images/registerbg.jpg';
// import loginbg from './images/loginbg.jpg';
import placeholderavatar from './images/placeholderavatar.jpg';

const icons = {
	phone: require('./images/phone.svg'),
	cube: require('./images/cube.svg'),
	computer: require('./images/computer.svg'),
	shield: require('./images/shield.svg'),
	friends: require('./images/friends.svg')
}

class Arrow extends Component {
	render() {
		return(
			<div className="rn-presentation-navarrow" onClick={ this.props._onClick }>{ this.props.icon }</div>
		);
	}
}

class Stage extends Component {
	render() {
		return(
			<div className={ `rn-presentation-view-stage${ (!this.props.isOld) ? "" : " old" }${ (!this.props.isNew) ? "" : " new" }${ (!this.props.visible) ? "" : " visible" }` }>
				{ this.props.children }
			</div>
		);
	}
}

class ScreenInput extends Component {
	constructor(props) {
		super(props);

		this.tyvalidint = null;
	}

	handleChange = value => {
		clearTimeout(this.tyvalidint);

		this.tyvalidint = setTimeout(() => {
			this.props.onExternalValidate(value, Boolean(value.replace(/ /g, "").length));
		}, 500);
	}

	render() {
		return(
			<div className="rn-presentation-stage-input">
				<span className="rn-presentation-stage-input-title">{ this.props.title }</span>
				<div className="rn-presentation-stage-input-fieldcontrol">
					<input
						type={ this.props._type }
						required
						title="Please, fill in this field."
						onChange={ ({ target: { value } }) => { this.props._onChange(value); if(this.props.validatable) this.handleChange(value); } }
						placeholder={ this.props._placeholder }
						className={ `rn-presentation-stage-input-field definp${ (!this.props.isLoading) ? "" : " loading" }` }
					/>
					<div className="rn-presentation-stage-input-border" />
					{
						(this.props.validatable) ? (
							<span
								key={ (this.props.isValid) ? 'A':'B' }
								className={ `rn-presentation-stage-input-status${ (this.props.isValid) ? " valid" : (this.props.isValid === false) ? " invalid" : "" }` }>
								 {
								 	(this.props.isValid) ? (
								 		<i className="fas fa-check" />
								 	) : (
								 		<i className="fas fa-times" />
								 	)
								 }
							</span>
						) : null
					}
				</div>
			</div>
		);
	}
}

class ScreenImage extends Component {
	render() {
		return(
			<Fragment>
				<input
					type="file"
					id={ this.props._id }
					onChange={ ({ target: { files } }) => this.props.onUpload(files[0]) }
					className="hidden"
					accept="image/*"
				/>
				<div className="rn-presentation-stage-image">
					<img
						className="rn-presentation-stage-image-mat"
						src={ this.props.preview }
						alt="preview"
						onLoad={ this.props._onLoad }
						onError={ this.props._onError }
					/>
					<label htmlFor={ this.props._id } type="button" className="rn-presentation-stage-image-upload definp">
						<i className="fas fa-camera" />
					</label>
				</div>
			</Fragment>
		);
	}
}

class Screen extends Component {
	getSubmitStatus = () => {
		let a = {
			true: "accepted",
			false: "denied",
			null: "loading"
		}[this.props.submitStatus];

		return a || "denied";
	}

	render() {
		return(
			<form onSubmit={ e => { e.preventDefault(); this.props._onSubmit(); } } className={ `rn-presentation-stage rn-presentation-${ this.props.adiclass }${ (!this.props.visible) ? "" : " active" }` }>
				{/* <img className="rn-presentation-stage-background" src={ this.props.background } alt="background" /> */}
				<div className="rn-presentation-stage-form">
					<div className={ `rn-presentation-stage-form-logstatus${ (!this.props.inAuth) ? "" : " accepted" }` }>
						{ (!this.props.inAuth) ? this.props.icon : this.props.iconAccepted }
					</div>
					<h2 className="rn-presentation-stage-form-title">{ this.props.title }</h2>
					{ this.props.children }
					<button type="submit" className={ `rn-presentation-stage-form-submit definp ${ this.getSubmitStatus() }` }>
						<span style={{ width: "100%" }} className="accepted">{ this.props.submitText }</span>
						<div className="denied"><i className="fas fa-times" /></div>
						<div className="rn-presentation-stage-form-submit-loading loading" />
					</button>
				</div>
			</form>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.stages = {
			"EASY_STAGE": {
				background: "orange"
			},
			"FAST_STAGE": {
				background: "blue"
			},
			"CLEAN_STAGE": {
				background: "purple"
			},
			"NEEDL_STAGE": {
				background: "rebeccapurple"
			},
			"STAYONL_STAGE": {
				background: "green"
			},
		}

		this.state = {
			stageIndex: 0,
			touchInit: null,
			stageChanging: false,
			currDisplay: "",
			data: {
				login: {
					login: "",
					password: ""
				},
				register: {
					name: "",
					login: "",
					password: "",
					avatar: null,
					previewAvatar: "",
					avatarUploaded: null,
					loginValid: null
				}
			},
			isSubmiting: false,
			inAuth: false
		}
	}

	getCurrentStage = () => Object.keys(this.stages)[this.state.stageIndex];
	isOldStage = a => Object.keys(this.stages).findIndex(io => io === a) > this.state.stageIndex;
	isNewStage = a => Object.keys(this.stages).findIndex(io => io === a) < this.state.stageIndex;
	getCurrentBg = () => this.stages[Object.keys(this.stages)[this.state.stageIndex]].background;

	moveCarousel = async b => {
		let c = this.state.stageIndex,
			d = c + b,
			e = Object.keys(this.stages).length - 1; // stages.length
		if(d > e) { // if bigger than stages.length -> set to 0
			d = 0;
		} else if(d < 0) { // if smaller than 0 -> set to stages.length
			d = e;
		}

		this.setState(() => ({ stageIndex: d }));
	}

	handleTouchCarousel = (nx, ny) => {
		if(this.state.stageChanging || !this.state.touchInit) return;

		let { x } = this.state.touchInit,
			a = 25, // slide point in px
			b = () => this.setState(() => ({ changing: true, touchInit: null }));
		if(nx > x && nx > x + a) {
			this.moveCarousel(-1);
			b();
		} else if(nx < x && nx + a < x) {
			this.moveCarousel(1);
			b();
		};
		this.setState(() => ({ changing: false }));
	}

	setDataValue = (screen, field, value) => {
		if(screen === "register" && field === "avatar") {
			URL.revokeObjectURL(this.state.data.register.previewAvatar);
			return this.setState(({ data }) => ({
				data: {
					...data,
					register: {
						...data.register,
						avatar: value,
						previewAvatar: URL.createObjectURL(value),
						avatarUploaded: null
					}
				}
			}));
		}

		this.setState(({ data }) => ({
			data: {
				...data,
				[screen]: {
					...data[screen],
					[field]: value
				}
			}
		}));
	}

	loginUser = () => {
		if(this.state.isSubmiting) return;

		this.setState(() => ({ isSubmiting: true }));
		let { login, password } = this.state.data.login;

		client.mutate({
			mutation: gql`
				mutation($login: String!, $password: String!) {
					loginUser(login: $login, password: $password) {
						id,
						lastAuthToken
					}
				}
			`,
			variables: {
				login, password
			}
		}).then(({ data: { loginUser: data } }) => {
			this.setState(() => ({ isSubmiting: false }));
			if(!data) return this.props.castError("Invalid login or password. Please, try again.");

			this.setState(() => ({
				inAuth: true
			}));

			cookieControl.set("authdata", {
				id: data.id
			});
			window.location.href = links["HOME_PAGE"].absolute;			
		});
	}

	registerUser = () => {
		if(this.state.isSubmiting || !this.state.data.register.loginValid) return;

		this.setState(() => ({ isSubmiting: true }));
		let { name, login, password, avatar } = this.state.data.register;

		client.mutate({
			mutation: gql`
				mutation($login: String!, $password: String!, $name: String!, $avatar: Upload!) {
					registerUser(login: $login, password: $password, name: $name, avatar: $avatar) {
						id,
						lastAuthToken	
					}
				}
			`,
			variables: {
				name, login, password,
				avatar: avatar || ""
			}
		}).then(({ data: { registerUser: data } }) => {
			this.setState(() => ({ isSubmiting: false }));
			if(!data) return this.props.castError("We couldn't register your account. Please, try again.");

			this.setState(() => ({
				inAuth: true
			}));

			cookieControl.set("authdata", {
				id: data.id
			});
			window.location.href = links["HOME_PAGE"].absolute;
		}).catch(() => this.props.castError("We couldn't register your account. Please, try again."));
	}

	_external_validateLogin = (login, prediction) => {
		if(!prediction) return (
			this.setState(({ data }) => ({
				isSubmiting: false,
				data: {
					...data,
					register: {
						...data.register,
						loginValid: null
					}
				}
			}))
		);

		this.setState(() => ({ isSubmiting: true }));

		client.query({
			query: gql`
				query($login: String!) {
					loginExists(login: $login)
				}
			`,
			variables: { login }
		}).then(({ data: { loginExists: allowed } }) => {
			this.setState(({ data }) => ({
				isSubmiting: false,
				data: {
					...data,
					register: {
						...data.register,
						loginValid: allowed
					}
				}
			}));
		}).catch(() => this.props.castError("We couldn't connect to our database. Please, restart the page."));
	}

	getSubmitStatus = screen => {
		if(screen === 'register') {
			let a = this.state,
				b = this.state.data.register;

			if(a.isSubmiting === true) return null;
			if(
				a.isSubmiting === false &&
				this.state.data.register.avatarUploaded &&
				b.loginValid !== false &&
				(!b.login.length || b.login.length !== b.login.replace(/ /g, "").length)
			) {
				return true;
			} else {
				return this.state.data.register.avatarUploaded;
			}
		} else if(screen === 'login') {
			return ((this.state.isSubmiting) ? null : true);
		}
	}

	render() {
		return(
			<div
				className="rn rn-presentation nonav"
				onTouchStart={ ({ nativeEvent: { touches } }) => this.setState({ touchInit: { x: touches[0].pageX, y: touches[0].pageX } }) }
				onTouchMove={ ({ nativeEvent: { touches }}) => this.handleTouchCarousel(touches[0].pageX, touches[0].pageX) }
				onTouchEnd={ () => this.setState({ touchInit: null }) }
				style={{
					background: this.getCurrentBg()
				}}>
				{
					(!this.state.currDisplay) ? (

						(this.state.stageIndex !== 0) ? (
							<Arrow
								icon={ <i className="fas fa-chevron-left" /> }
								_onClick={ () => this.moveCarousel(-1) }
							/>
						) : <div className="rn-presentation-navarrowplaceholder" />

					) : null
				}
				<div className={ `rn-presentation-view${ (!this.state.currDisplay) ? "" : " stretch" }` }>
					<Stage
						isOld={ this.isOldStage("EASY_STAGE") }
						isNew={ this.isNewStage("EASY_STAGE") }
						visible={ this.getCurrentStage() === "EASY_STAGE" }
						>
						<img className="rn-presentation-view-stage-icon" src={ icons.phone } alt="phone" />
						<span className="rn-presentation-view-stage-title">A social network for your school</span>
						<span className="rn-presentation-virew-stage-desc">Use your school account to login and start using TunaConnect.</span>
					</Stage>
					<Stage
						isOld={ this.isOldStage("FAST_STAGE") }
						isNew={ this.isNewStage("FAST_STAGE") }
						visible={ this.getCurrentStage() === "FAST_STAGE" }
						>
						<img className="rn-presentation-view-stage-icon" src={ icons.shield } alt="shield" />
						<span className="rn-presentation-view-stage-title">Fast and Safe</span>
						<span className="rn-presentation-virew-stage-desc">Security algorithms that will help you to hide your secrets under the lock.</span>
					</Stage>
					<Stage
						isOld={ this.isOldStage("CLEAN_STAGE") }
						isNew={ this.isNewStage("CLEAN_STAGE") }
						visible={ this.getCurrentStage() === "CLEAN_STAGE" }
						>
						<img className="rn-presentation-view-stage-icon" src={ icons.cube } alt="cool design" />
						<span className="rn-presentation-view-stage-title">Choose your skin</span>
						<span className="rn-presentation-virew-stage-desc">Different design styles for any tasks.</span>
					</Stage>
					<Stage
						isOld={ this.isOldStage("NEEDL_STAGE") }
						isNew={ this.isNewStage("NEEDL_STAGE") }
						visible={ this.getCurrentStage() === "NEEDL_STAGE" }
						>
						<img className="rn-presentation-view-stage-icon" src={ icons.computer } alt="easy modern" />
						<span className="rn-presentation-view-stage-title">Everything that you need</span>
						<span className="rn-presentation-virew-stage-desc">A lot of services for your school. Such as notes and chat.</span>
					</Stage>
					<Stage
						isOld={ this.isOldStage("STAYONL_STAGE") }
						isNew={ this.isNewStage("STAYONL_STAGE") }
						visible={ this.getCurrentStage() === "STAYONL_STAGE" }
						>
						<img className="rn-presentation-view-stage-icon" src={ icons.friends } alt="easy modern" />
						<span className="rn-presentation-view-stage-title">More friends</span>
						<span className="rn-presentation-virew-stage-desc">Tell your friends about TunaConnect to stay on the same wave.</span>
					</Stage>
				</div>
				{
					(!this.state.currDisplay) ? (
						(this.state.stageIndex !== Object.keys(this.stages).length - 1) ? (
							<Arrow
								icon={ <i className="fas fa-chevron-right" /> }
								_onClick={ () => this.moveCarousel(1) }
							/>
						) : <div className="rn-presentation-navarrowplaceholder" />
					) : null
				}
				<div className={ `rn-presentation-skip${ (!this.state.currDisplay) ? "" : " instage" }` }>
					<button className="definp" onClick={ () => this.setState({ currDisplay: "LOGIN_FORM" }) }>Log in</button>
					<span> | </span>
					<button className="definp" onClick={ () => this.setState({ currDisplay: "" }) }>Main</button>
					<span> | </span>
					<button className="definp" onClick={ () => this.setState({ currDisplay: "REGISTER_FORM" }) }>Register</button>
				</div>
				<Screen
					// background={ loginbg }
					adiclass="login"
					visible={ this.state.currDisplay === "LOGIN_FORM" }
					title="Login in to your account"
					submitText="Log in"
					icon={ <i className="fas fa-lock" /> }
					iconAccepted={ <i className="fas fa-lock-open" /> }
					submitStatus={ this.getSubmitStatus('login') }
					inAuth={ this.state.inAuth }
					_onSubmit={ this.loginUser }>
					<ScreenInput
						title="Login"
						_placeholder="set190283"
						_type="text"
						validatable={ false }
						isLoading={ this.getSubmitStatus('login') === null }
						_onChange={ value => this.setDataValue("login", "login", value) }
					/>
					<ScreenInput
						title="Password"
						_placeholder="*******"
						_type="password"
						validatable={ false }
						isLoading={ this.getSubmitStatus('login') === null }
						_onChange={ value => this.setDataValue("login", "password", value) }
					/>
				</Screen>
				<Screen
					// background={ registerbg }
					adiclass="register"
					visible={ this.state.currDisplay === "REGISTER_FORM" }
					title="Register a new account"
					submitText="Register"
					iconAccepted={ <i className="fas fa-fingerprint" /> }
					icon={ <i className="fas fa-fingerprint" /> }
					submitStatus={ this.getSubmitStatus('register') }
					inAuth={ true }
					_onSubmit={ this.registerUser }>
					<ScreenImage
						_id="rn-presentation-register-image"
						preview={ this.state.data.register.previewAvatar || placeholderavatar }
						onUpload={ file => this.setDataValue("register", "avatar", file) }
						_onLoad={ () => this.setDataValue("register", "avatarUploaded", true) }
						_onError={ () => this.setDataValue("register", "avatarUploaded", false) } // even when def img
					/>
					<ScreenInput
						title="Login"
						_placeholder="set190283"
						_type="text"
						_onChange={ value => this.setDataValue("register", "login", value) }
						onExternalValidate={ this._external_validateLogin }
						validatable={ true }
						isLoading={ this.getSubmitStatus('register') === null }
						isValid={ this.state.data.register.loginValid }
					/>
					<ScreenInput
						title="Password"
						_placeholder="*******"
						_type="password"
						_onChange={ value => this.setDataValue("register", "password", value) }
						validatable={ false }
						isLoading={ this.getSubmitStatus('register') === null }
					/>
					<ScreenInput
						title="Name"
						_placeholder="Robin Irish"
						_type="text"
						_onChange={ value => this.setDataValue("register", "name", value) }
						validatable={ false }
						isLoading={ this.getSubmitStatus('register') === null }
					/>
				</Screen>
			</div>
		);
	}
}

export default connect(
	() => ({}),
	{
		castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } })
	}
)(App);