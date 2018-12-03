function reducer(state = {}, { type, payload }) {
	let a = Object.assign({}, state);

	switch(type) {
		case 'TOGGLE_SMALL_DOCK':
			a.showDock = !a.showDock;
		break;
		case 'CAST_GLOBAL_ERROR':
			a.globalErrorOnline = payload.status;
			a.globalErrorText = payload.text || "";
		break;
		default:break;
	}

	return a;
}

export default reducer;