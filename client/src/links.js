const links = {
	"PRESENTATION_PAGE": {
		'cookieRequired': false,
		'navTitle': "",
		'componentName': 'Presentation',
		'absolute': '/login',
		'route': '/login'
	},
	"HOME_PAGE": {
		'cookieRequired': true,
		'navTitle': 'Home',
		'componentName': 'Feed',
		'absolute': '/home',
		'route': '/home'
	},
	"ACCOUNT_PAGE": {
		'cookieRequired': true,
		'navTitle': 'Account',
		'componentName': 'Account',
		'absolute': '/user',
		'route': '/user/:id?'
	},
	"SETTINGS_PAGE": {
		'cookieRequired': true,
		'navTitle': 'Settings',
		'componentName': 'Settings',
		'absolute': '/settings',
		'route': '/settings'
	},
	"CHAT_PAGE": {
		'cookieRequired': true,
		'navTitle': 'Chat',
		componentName: 'Chat',
		'absolute': '/chat',
		'route': '/chat/:id?'
	}
}

export default links;