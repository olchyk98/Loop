import React, { Component, Fragment } from 'react';
import './main.css';

import registerbg from './images/registerbg.jpg';
import loginbg from './images/loginbg.jpg';
const icons = {
	phone: require('./images/phone.svg'),
	cube: require('./images/cube.svg'),
	computer: require('./images/computer.svg'),
	shield: require('./images/shield.svg')
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
	render() {
		return(
			<div className="rn-presentation-stage-input">
				<span className="rn-presentation-stage-input-title">{ this.props.title }</span>
				<input
					type={ this.props._type }
					required
					onChange={ ({ target: { value } }) => this.props._onChange(value) }
					placeholder={ this.props._placeholder }
					className="rn-presentation-stage-input-field definp"
				/>
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
					<img className="rn-presentation-stage-image-mat" src={ registerbg } alt="preview" />
					<label htmlFor={ this.props._id } type="button" className="rn-presentation-stage-image-upload definp">
						<i className="fas fa-camera" />
					</label>
				</div>
			</Fragment>
		);
	}
}

class Screen extends Component {
	render() {
		return(
			<form onSubmit={ this.props._onSubmit } className={ `rn-presentation-stage rn-presentation-${ this.props.adiclass }${ (!this.props.visible) ? "" : " active" }` }>
				<img className="rn-presentation-stage-background" src={ this.props.background } alt="background" />
				<div className="rn-presentation-stage-form">
					<h2 className="rn-presentation-stage-form-title">{ this.props.title }</h2>
					{ this.props.children }
					<button type="submit" className="rn-presentation-stage-form-submit definp">{ this.props.submittext }</button>
				</div>
			</form>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.stages = ["EASY_STAGE", "FAST_STAGE", "CLEAN_STAGE", "NEEDL_STAGE"]
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
			}
		}

		this.state = {
			stageIndex: 0,
			touchInit: null,
			stageChanging: false,
			currDisplay: "REGISTER_FORM",
			data: {
				login: {
					login: "",
					password: ""
				},
				register: {
					name: "",
					avatar: null
				}
			}
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

	render() {
		return(
			<div
				className="rn rn-presentation"
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
						<span className="rn-presentation-view-stage-title">Easy to use</span>
						<span className="rn-presentation-virew-stage-desc">You can easily set up everything that you want without any kind of problems.</span>
					</Stage>
					<Stage
						isOld={ this.isOldStage("FAST_STAGE") }
						isNew={ this.isNewStage("FAST_STAGE") }
						visible={ this.getCurrentStage() === "FAST_STAGE" }
						>
						<img className="rn-presentation-view-stage-icon" src={ icons.shield } alt="shield" />
						<span className="rn-presentation-view-stage-title">Fast and Safe</span>
						<span className="rn-presentation-virew-stage-desc">Secure and high protected storage what you can use to submit your data.</span>
					</Stage>
					<Stage
						isOld={ this.isOldStage("CLEAN_STAGE") }
						isNew={ this.isNewStage("CLEAN_STAGE") }
						visible={ this.getCurrentStage() === "CLEAN_STAGE" }
						>
						<img className="rn-presentation-view-stage-icon" src={ icons.cube } alt="cool design" />
						<span className="rn-presentation-view-stage-title">Clean design</span>
						<span className="rn-presentation-virew-stage-desc">Mostly white, clean and beautiful design.</span>
					</Stage>
					<Stage
						isOld={ this.isOldStage("NEEDL_STAGE") }
						isNew={ this.isNewStage("NEEDL_STAGE") }
						visible={ this.getCurrentStage() === "NEEDL_STAGE" }
						>
						<img className="rn-presentation-view-stage-icon" src={ icons.computer } alt="easy modern" />
						<span className="rn-presentation-view-stage-title">Everything that you need</span>
						<span className="rn-presentation-virew-stage-desc">Many services that were created to replace exists Twitter and Facebook</span>
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
					<button className="definp" onClick={ () => this.setState({ currDisplay: "" }) }>Preview</button>
					<span> | </span>
					<button className="definp" onClick={ () => this.setState({ currDisplay: "REGISTER_FORM" }) }>Register</button>
				</div>
				<Screen
					background={ loginbg }
					adiclass="login"
					visible={ this.state.currDisplay === "LOGIN_FORM" }
					title="Login in to your account"
					submittext="Log in"
					_onSubmit={ () => null }>
					<ScreenInput
						title="Login"
						_placeholder="set190283"
						_type="text"
						_onChange={ value => this.setDataValue("login", "login", value) }
					/>
					<ScreenInput
						title="Password"
						_placeholder="*******"
						_type="password"
						_onChange={ value => this.setDataValue("login", "password", value) }
					/>
				</Screen>
				<Screen
					background={ registerbg }
					adiclass="register"
					visible={ this.state.currDisplay === "REGISTER_FORM" }
					title="Register a new account"
					submittext="Register"
					_onSubmit={ () => null }>
					<ScreenInput
						title="Name"
						_placeholder="Oles Odynets"
						_type="text"
						_onChange={ value => this.setDataValue("register", "name", value) }
					/>
					<ScreenImage
						_id="rn-presentation-register-image"
						onUpload={ file => this.setDataValue("register", "avatar", file) }
					/>
				</Screen>
			</div>
		);
	}
}

export default App;