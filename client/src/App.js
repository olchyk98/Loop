import React, { Component, Fragment } from 'react';
import { cookieControl } from './utils';

// Pages
import Presentation from './pages/presentation';
import Feed from './pages/feed';
import Navigation from './pages/navigation';
import Dock from './pages/dock';
import Account from './pages/account';
import Settings from './pages/settings';
import Chat from './pages/chat';
import Notes from './pages/notes';

// Redux
import store from './store';
import { Provider } from 'react-redux';

// Router
import { Route, Switch, Redirect } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import links from './links'; // pages routes

// Other stuff
import PhotoModal from './pages/__forall__/photo.modal';

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

		this.cookieID = cookieControl.get("authdata");
	}

	render() {
		return(
			<Provider store={ store }>
				<BrowserRouter>
					<Fragment>
						<GlobalError />
						<PhotoModal
							store={ store }
						/>
						{
							(this.cookieID) ? (
								<Navigation />
							) : null
						}
						<div className="targetscreen">
							{
								(this.cookieID) ? (
									<Dock />
								) : null
							}
							<Switch>
								<NeedleRoute
									path={ links["HOME_PAGE"].route }
									condition={ this.cookieID }
									component={ Feed }
									redirect={ Presentation }
									exact
								/>
								<NeedleRoute
									path={ links["ACCOUNT_PAGE"].route }
									condition={ this.cookieID }
									component={ Account }
									redirect={ Presentation }
									exact
								/>
								<NeedleRoute
									path={ links["SETTINGS_PAGE"].route }
									condition={ this.cookieID }
									component={ Settings }
									redirect={ Presentation }
									exact
								/>
								<NeedleRoute
									path={ links["CHAT_PAGE"].route }
									condition={ this.cookieID }
									component={ Chat }
									redirect={ Presentation }
									exact
								/>
								<NeedleRoute
									path={ links["NOTES_PAGE"].route }
									condition={ this.cookieID }
									component={ Notes }
									redirect={ Presentation }
									exact
								/>
								<NeedleRoute
									path={ links["PRESENTATION_PAGE"].route }
									condition={ !this.cookieID }
									component={ Presentation }
									redirect={ Feed }
									exact
								/>
								<Redirect to={ links[ (this.cookieID) ? "HOME_PAGE" : "PRESENTATION_PAGE" ].route } />
							</Switch>
						</div>
					</Fragment>				
				</BrowserRouter>
			</Provider>
		);
	}
}

export default App;