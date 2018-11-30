const cookieControl = {
	set: function (name, value, daysOut = 32) {
		let d = new Date();
		d.setTime(d.getTime() + (daysOut * 24 * 60 * 60 * 1000));
		let expires = "expires=" + d.toUTCString();
		document.cookie = name + "=" + JSON.stringify(value) + ";" + expires + ";path=/";
	},
	get: function (name) {
		name += "=";
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) === ' ') {
				c = JSON.parse(c.substring(1));
			}
			if (c.indexOf(name) === 0) {
				return JSON.parse(c.substring(name.length, c.length));
			}
		}

		return "";
	},
	delete: function (name) {
		document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
}

function convertTime(time, addon = "", complete = true) { // clf
	if(!time) return "";

	time = parseInt(time);
	time /= 1000;
	
	let a = (new Date()).getTime() / 1000,
			c = c1 => a - time < c1,
			d = Math.round;

	if(c(60)) {
		return d((a - time)) + "s" + (addon ? " " + addon : "");
	} else if(c(3600)) {
		return d((a - time) / 60) + "m" + (addon ? " " + addon : "");
	} else if(c(86400)) {
		return d((a - time) / 3600) + "h" + (addon ? " " + addon : "");
	} else if(c(604800)) {
		return d((a - time) / 86400) + "d" + (addon ? " " + addon : "");
	} else if(c(2419200)) {
		return d((a - time) / 604800) + "w" + (addon ? " " + addon : "");
	} else if(time < 0) {
		return "";
	} else if(complete) {
		let e = new Date(time * 1000),
				f = [
					"Jan",
					"Feb",
					"March",
					"Apr",
					"May",
					"June",
					"July",
					"Aug",
					"Sep",
					"Oct",
					"Nov",
					"Sep",
					"Oct",
					"Nov",
					"Dec"
				][e.getMonth()];
		return `${ f } ${ e.getDate() }, ${ e.getFullYear() } ${ e.getHours() }:${ e.getMinutes() }`;
	} else {
		return "";
	}
}

module.exports = { cookieControl, convertTime }