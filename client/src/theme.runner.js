function selectTheme(theme) {
	localStorage.setItem("theme_config", theme);
}

function applyTheme() {
	const styles = {
		'light': {
			"--defaultborder": "rgba(0, 0, 0, .1)",
			"--lamp_const-white": "white",
			"--lamp_const-black": "black",
			"--lamp_const-blue": "blue",
			"--lamp_background": "#FBFBFD",
			"--lamp_nav": "white",
			"--lamp_item": "white",
			"--lamp_item-exp": "rgba(0, 0, 0, .01)",
			"--lamp_white-extra-low": "rgba(255, 255, 255, .01)",
			"--lamp_white-mid_e-low": "rgba(255, 255, 255, .1)",
			"--lamp_white-low": "rgba(255, 255, 255, .25)",
			// "--lamp_white-extra-low": "rgba(255, 255, 255, .35)",
			"--lamp_white-mid": "rgba(255, 255, 255, .55)",
			"--lamp_white-extra-mid": "rgba(255, 255, 255, .75)",
			"--lamp_white-alm-full": "rgba(255, 255, 255, .9)",
			"--lamp-black-high": "rgba(0, 0, 0, .9)",
			"--lamp-black-low-high": "rgba(0, 0, 0, .75)",
			"--lamp-black-extra-mid": "rgba(0, 0, 0, .55)",
			"--lamp-black-mid": "rgba(0, 0, 0, .45)",
			"--lamp-black-alm-low": "rgba(0, 0, 0, .25)",
			"--lamp-black-alme-low": "rgba(0, 0, 0, .15)",
			"--lamp-black-double-low": "rgba(0, 0, 0, .05)",
			"--lamp-black-double-min": "rgba(0, 0, 0, .01)",
			"--lamp-black-stylish": "#212121",
			"--lamp-down-green": "#52AF50",
			"--lampeff_invert-placeholder": "0%",
			"--lampadn_chat-coloristic-white": "255",
			"--lampadn_chat-coloristic-black": "0",
			"--lampadn_note-bluecolor": "rgba(0, 0, 255, .05)",
			"--lampadn_note-bluecolor_active": "rgba(0, 0, 255, .5)"
		},
		dark: {
			"--defaultborder": "rgba(255, 255, 255, .1)",
			"--lamp_const-white": "black",
			"--lamp_const-black": "white",
			"--lamp_const-blue": "aqua",
			"--lamp_background": "#191A1A",
			"--lamp_nav": "#191A1A",
			"--lamp_item": "#242525",
			"--lamp_item-exp": "#484B4C",
			"--lamp_white-extra-low": "rgba(0, 0, 0, .01)",
			"--lamp_white-mid_e-low": "rgba(0, 0, 0, .1)",
			"--lamp_white-low": "rgba(0, 0, 0, .25)",
			// "--lamp_white-extra-low": "rgba(0, 0, 0, .35)",
			"--lamp_white-mid": "rgba(0, 0, 0, .55)",
			"--lamp_white-extra-mid": "rgba(0, 0, 0, .75)",
			"--lamp_white-alm-full": "rgba(0, 0, 0, .9)",
			"--lamp-black-high": "rgba(255, 255, 255, .9)",
			"--lamp-black-low-high": "rgba(255, 255, 255, .75)",
			"--lamp-black-extra-mid": "rgba(255, 255, 255, .55)",
			"--lamp-black-mid": "rgba(255, 255, 255, .45)",
			"--lamp-black-alm-low": "rgba(255, 255, 255, .25)",
			"--lamp-black-alme-low": "rgba(255, 255, 255, .15)",
			"--lamp-black-double-low": "rgba(255, 255, 255, .05)",
			"--lamp-black-double-min": "rgba(255, 255, 255, .01)",
			"--lamp-down-green": "#52AF50",
			"--lamp-black-stylish": "#DDE0E0",
			"--lampeff_invert-placeholder": "100%",
			"--lampadn_chat-coloristic-white": "0",
			"--lampadn_chat-coloristic-black": "255",
			"--lampadn_note-bluecolor": "rgba(255, 0, 0, .15)",
			"--lampadn_note-bluecolor_active": "rgba(255, 255, 100, .5)"
		}
	}

	const a = localStorage.getItem("theme_config"),
		  b = a => {
		  	Object.keys(styles[a]).forEach(io => {
				document.documentElement.style.setProperty(io, styles[a][io]);
			});
		  }

	if(a in styles) {
		b(a);
	} else {
		localStorage.setItem("theme_config", 'light');
		b('light');
	}
}

export { selectTheme, applyTheme }