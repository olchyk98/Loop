function reducer(state = {}, { type, payload }) {
	let a = Object.assign({}, state),
		b = (a, b) => (a) ? ({ ...a, ...b }) : b;

	switch(type) {
		case 'SET_USER_DATA':
			a.userdata = b(a.userdata, payload);
		break;
		default:break;
	}

	return a;
}

export default reducer;