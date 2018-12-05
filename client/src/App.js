import React, { Component, Fragment } from 'react';
import { cookieControl } from './swissKnife';

// Pages
import Presentation from './pages/presentation';
import Feed from './pages/feed';
import Navigation from './pages/navigation';
import Dock from './pages/dock';
import Account from './pages/account';
import Settings from './pages/settings';
import Chat from './pages/chat';

// Redux
import store from './store';
import { Provider } from 'react-redux';

// Router
import { Route, Switch, Redirect } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import links from './links'; // pages routes

// Internal Pages router
const pages = {
	'Presentation': Presentation,
	'Feed': Feed,
	'Account': Account,
	'Settings': Settings,
	'Chat': Chat
}

// Needle Route
const NeedleRoute = ({ path, condition, component: Component, redirect: Redirect, ...settings }) => (
	<Route
		path={ path }
		{ ...settings }
		component={props => (condition) ? <Component { ...props } /> : <Redirect to={ Redirect } /> }
	/>
)

class GlobalError extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isOnline: false,
			text: ""
		}

		this.unsubscribe = null;
		this.lastOnline = "";
	}

	requestSlide = () => {
		let a = a => this.setState(() => ({ isOnline: a }));
		a(true);

		setTimeout(() => {
			a(false);
			store.dispatch({ type: 'CAST_GLOBAL_ERROR', payload: { status: false, text: '' } });
			this.lastOnline = '';
		}, 5000);
	}

	componentDidMount() {
		this.unsubscribe = store.subscribe(() => {
			let a = store.getState().session,
				b = a.globalErrorOnline,
				c = a.globalErrorText;

			if(c) this.setState(() => ({ text: c }));
			if(b !== this.lastOnline) {
				this.lastOnline = b;
				if(b) this.requestSlide();
				else this.setState(() => ({ isOnline: false }));
			}
		});
	}

	componentWillUnMount() {
		(this.unsubscribe && this.unsubscribe());
	}

	render() {
		return(
			<div className={ `global_error${ (!this.state.isOnline) ? "" : " active" }` }>
				<span>{ this.state.text }</span>
			</div>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.authdata = cookieControl.get("authdata");
	}

	render() {
		return(
			<Provider store={ store }>
				<BrowserRouter>
					<Fragment>
						<GlobalError />
						{
							(this.authdata) ? (
								<Navigation />
							) : null
						}
						<div className="targetscreen">
							{
								(this.authdata) ? (
									<Dock />
								) : null
							}
							<Switch>
									{
										Object.values(links).map(({ route, cookieRequired, componentName }, index) => (
											<NeedleRoute
												key={ index }
												path={ route }
												condition={ (cookieRequired) ? this.authdata : !this.authdata }
												component={ pages[componentName] }
												redirect={ (cookieRequired) ? Presentation : Feed }
												exact
											/>
										))
									}
									{/*

										<NeedleRoute
											path={ links["HOME_PAGE"].route }
											condition={ this.authdata }
											component={ Feed }
											redirect={ Presentation }
											exact
										/>
										<NeedleRoute
											path={ links["ACCOUNT_PAGE"].route }
											condition={ this.authdata }
											component={ Account }
											redirect={ Presentation }
											exact
										/>
										<NeedleRoute
											path={ links["PRESENTATION_PAGE"].route }
											condition={ !this.authdata }
											component={ Presentation }
											redirect={ Feed }
											exact
										/>

									*/}
									<Redirect to={
										(this.authdata) ? (
											links["HOME_PAGE"].route
										) : (
											links["PRESENTATION_PAGE"].route
										)
									} />
							</Switch>
						</div>
					</Fragment>				
				</BrowserRouter>
			</Provider>
		);
	}
}

export default App;