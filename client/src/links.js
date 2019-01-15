const links = {
	"PRESENTATION_PAGE": {
		'absolute': '/login',
		'route': '/login'
	},
	"HOME_PAGE": {
		'absolute': '/home',
		'route': '/home'
	},
	"ACCOUNT_PAGE": {
		'absolute': '/user',
		'route': '/user/:id?'
	},
	"SETTINGS_PAGE": {
		'absolute': '/settings',
		'route': '/settings'
	},
	"CHAT_PAGE": {
		'absolute': '/chat',
		'route': '/chat/:id?'
	},
	"NOTES_PAGE": {
		'absolute': '/notes',
		'route': '/notes'
	},
	"POSTDISPLAY_PAGE": {
		'absolute': '/post/',
		'route': '/post/:id?'
	}
}

export default links;