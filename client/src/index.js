// Some stuff
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './libs/fontawesome'; // fontawesome library
import * as serviceWorker from './serviceWorker';

// Pages
import Presentation from './pages/presentation';

// Redux
import store from './store';
import { Provider } from 'react-redux';

// Router
import { Route, Switch, Redirect } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import links from './links'; // pages routes

// Needle Route
const NeedleRoute = ({ path, condition, component: Component, redirect, ...settings }) => (
	<Route
		path={ path }
		{ ...settings }
		component={props => (condition) ? <Component { ...props } /> : <Redirect to={ redirect } /> }
	/>
)

ReactDOM.render(
	<Provider store={ store }>
		<BrowserRouter>
			<Switch>
				<NeedleRoute
					path={ links["PRESENTATION_PAGE"].route }
					condition={ true }
					component={ Presentation }
					redirect={ Presentation }
					exact
				/>
			</Switch>
		</BrowserRouter>
	</Provider>, document.getElementById('root'));
serviceWorker.unregister();
