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
		case 'TOGGLE_PHOTO_MODAL':
			a.photoModalW = payload;
		break;
		case 'SET_DOCK_REFRESHER':
			a.dockRefresher = payload;
		break;
		case 'REFRESH_DOCK':
			a.dockRefresher();
			a.photoModalW = null;
		break;
		case 'RUN_DIALOG':
			a.visibleDialog = payload.active;
			a.visibleDialogData = payload.data;
		break;
		default:break;
	}

	return a;
}

export default reducer;