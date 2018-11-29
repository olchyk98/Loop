import { combineReducers } from 'redux';
import session from './session';
import user from './user';

const reducers = combineReducers({
	session,
	user
});

export default reducers;