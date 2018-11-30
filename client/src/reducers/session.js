function reducer(state = {}, { type, payload }) {
	let a = Object.assign({}, state);

	switch(type) {
		case 'CAST_GLOBAL_ERROR':
			a.globalErrorOnline = payload.status;
			a.globalErrorText = payload.text || "";
		break;
		default:break;
	}

	return a;
}

export default reducer;