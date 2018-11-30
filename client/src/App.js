import React, { Component, Fragment } from 'react';
import { cookieControl } from './swissKnife';

// Pages
import Presentation from './pages/presentation';
import Feed from './pages/feed';
import Navigation from './pages/navigation';
import Dock from './pages/dock';

// Redux
import store from './store';
import { Provider } from 'react-redux';

// Router
import { Route, Switch, Redirect } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import links from './links'; // pages routes

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
	render() {
		return(
			<Provider store={ store }>
				<BrowserRouter>
					<Fragment>
						<GlobalError />
						{
							(cookieControl.get("authdata")) ? (
								<Navigation />
							) : null
						}
						<div className="targetscreen">
							{
								(cookieControl.get("authdata")) ? (
									<Dock />
								) : null
							}
							<Switch>
									
									<NeedleRoute
										path={ links["HOME_PAGE"].route }
										condition={ cookieControl.get("authdata") }
										component={ Feed }
										redirect={ Presentation }
										exact
									/>
									<NeedleRoute
										path={ links["PRESENTATION_PAGE"].route }
										condition={ !cookieControl.get("authdata") }
										component={ Presentation }
										redirect={ Feed }
										exact
									/>
							</Switch>
						</div>
					</Fragment>				
				</BrowserRouter>
			</Provider>
		);
	}
}

export default App;