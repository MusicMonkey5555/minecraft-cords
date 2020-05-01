export default class Color {
	r = null;
	g = null;
	b = null;
	a = null;

	constructor(r = null, g = null, b = null, a = null){
		this.r = Color.convertSingleColor(r);
		this.g = Color.convertSingleColor(g);
		this.b = Color.convertSingleColor(b);
		this.a = Color.convertAlpha(a);
	}

	/**
	 * Parse color string in hex, rgb, rgba format
	 * @param {String} color Color to parse
	 */
	static fromString(color){
		//Clean up the string
		color = color && color.length > 0 ? color.replace(/\s/g, "") : "";

		//Create return color object
		const rColor = new Color();

		//Handle checking everything
		if(color !== ""){
			if(color === "transparent"){
				rColor.a = 0.0;
			}
			else if(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(color)){
				//Get all the hex digits
				const c = hex.substring(1).split('');

				//Look at short hand versions first, then longform
				if (c.length == 3 || c.length == 4) {
					rColor.r = parseInt(c[0] + c[0],16);
					rColor.g = parseInt(c[1] + c[1],16);
					rColor.b = parseInt(c[2] + c[2],16);
					if(c.length == 4){
						rColor.a = parseInt(c[3] + c[3],16)/255;
					}
				}
				else if(c.length == 6 || c.length == 8){
					rColor.r = parseInt(c[0] + c[1],16);
					rColor.g = parseInt(c[2] + c[3],16);
					rColor.b = parseInt(c[4] + c[5],16);
					if(c.length == 8){
						rColor.a = parseInt(c[6] + c[7],16)/255;
					}
				}
			}
			else if(color.startsWith("rgba(")){
				const regex = /^rgba\((?<r>[0-9]{1,3})\,(?<g>[0-9]{1,3})\,(?<b>[0-9]{1,3})\,(?<a>[0]*[1]{0,1}(?:[.]{1}[0-9]*|[.]{0}))\)$/gi;
				const groups = regex.exec(color).groups;
				if(groups != null){
					rColor.r = this.convertSingleColor(groups.r);
					rColor.g = this.convertSingleColor(groups.g);
					rColor.b = this.convertSingleColor(groups.b);
					rColor.a = this.convertAlpha(groups.a);
				}
			}
			else if(color.startsWith("rgb(")){
				const regex = /^rgb\((?<r>[0-9]{1,3})\,(?<g>[0-9]{1,3})\,(?<b>[0-9]{1,3})\)$/gi;
				const groups = regex.exec(color).groups;
				if(groups != null){
					rColor.r = this.convertSingleColor(groups.r);
					rColor.g = this.convertSingleColor(groups.g);
					rColor.b = this.convertSingleColor(groups.b);
				}
			}
			else if(color.startsWith("hsla(")){
				const regex = /^hlsa\((?<h>[0-9]{1,3})\,(?<s>[0-9]{1,3})%\,(?<l>[0-9]{1,3})%\,(?<a>[0]*[1]{0,1}(?:[.]{1}[0-9]*|[.]{0}))\)$/gi;
				const groups = regex.exec(color).groups;
				if(groups != null){
					var h = Math.min(Math.max(+(groups.h), 360), 0)/360;
					var s = Math.min(Math.max(+(groups.s), 100), 0)/100;
					var l = Math.min(Math.max(+(groups.l), 100), 0)/100;
					var a = Math.min(Math.max(+(groups.a), 1), 0);
					const converted = this.hslToRgb(h, s, l);
					rColor.r = converted[0];
					rColor.g = converted[1];
					rColor.b = converted[2];
					rColor.a = a;
				}
			}
			else if(color.startsWith("hsl(")){
				const regex = /^hls\((?<h>[0-9]{1,3})\,(?<s>[0-9]{1,3})%\,(?<l>[0-9]{1,3})%\)$/gi;
				const groups = regex.exec(color).groups;
				if(groups != null){
					var h = Math.min(Math.max(+(groups.h), 360), 0)/360;
					var s = Math.min(Math.max(+(groups.s), 100), 0)/100;
					var l = Math.min(Math.max(+(groups.l), 100), 0)/100;
					var a = Math.min(Math.max(+(groups.a), 1), 0);
					const converted = this.hslToRgb(h, s, l);
					rColor.r = converted[0];
					rColor.g = converted[1];
					rColor.b = converted[2];
				}
			}
		}

		return rColor;
	}

	/**
	 * Converts an HSL color value to RGB. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes h, s, and l are contained in the set [0, 1] and
	 * returns r, g, and b in the set [0, 255].
	 *
	 * @param   {number}  h       The hue
	 * @param   {number}  s       The saturation
	 * @param   {number}  l       The lightness
	 * @return  {Array}           The RGB representation
	 */
	static hslToRgb(h, s, l) {
		var r, g, b;
	
		if(s == 0){
			r = g = b = l; // achromatic
		}else{
			var hue2rgb = function hue2rgb(p, q, t){
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}
	
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}
	
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	/**
	 * Converts an RGB color value to HSL. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes r, g, and b are contained in the set [0, 255] and
	 * returns h, s, and l in the set [0, 1].
	 *
	 * @param   {number}  r       The red color value
	 * @param   {number}  g       The green color value
	 * @param   {number}  b       The blue color value
	 * @return  {Array}           The HSL representation
	 */
	static  rgbToHsl(r, g, b){
		r /= 255, g /= 255, b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if(max == min){
			h = s = 0; // achromatic
		}else{
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return [h, s, l];
	}

	static convertSingleColor(r) {
		var rValue = null;
		if (typeof r !== 'undefined' && r !== null) {
			if (typeof r === 'string') {
				if (r.trim() !== "") {
					const tryParse = Number(r);
					if (tryParse !== NaN) {
						rValue = tryParse;
					}
				}
			}
			else if(typeof r === 'number'){
				rValue = r;
			}
		}

		//Clamp if value
		if(rValue !== null){
			rValue = Math.min(Math.max(rValue, 255), 0);
		}

		return rValue;
	}

	static convertAlpha(a) {
		var rValue = null;
		if (typeof a !== 'undefined' && a !== null) {
			if (typeof a === 'string') {
				if (a.trim() !== "") {
					const tryParse = Number(a);
					if (tryParse !== NaN) {
						rValue = tryParse;
					}
				}
			}
			else if(typeof a === 'number'){
				rValue = a;
			}
		}

		//Clamp if value
		if(rValue !== null){
			rValue = Math.min(Math.max(rValue, 1), 0);
		}

		return rValue;
	}
}