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
		'navTitle': "Home",
		'componentName': 'Feed',
		'absolute': '/home',
		'route': '/home'
	},
	"ACCOUNT_PAGE": {
		'cookieRequired': true,
		'navTitle': "Account",
		'componentName': 'Account',
		'absolute': '/user',
		'route': '/user/:id?'
	}
}

export default links;