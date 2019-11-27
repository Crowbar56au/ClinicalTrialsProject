/*	VERSION 1.00
	23-SEP-2011 Biologicals Development Team
	members in the library:
	global variable called JSON2. It is not called JSON to avoid conflict with the object called JSON that is built into some browsers
	function json2xml(jsondata, insert_tabs, exclusions) - convert a json object to an XML document, optionally insert tabs for formatting, and optionally exclude elements starting with a particular character (should be expanded to optionally be a bucket/array of characters)
	function makeDateStringLong(date_object) - given a javascript datetime object, returns a standard long date "dd mmmm, yyyy" as a string
	function makeDateString(date_object) - given a javascript datetime object, returns a standard short date "dd/mm/yyyy" as a string
	function parseXml(xml_string) - parse a string and attempt to convert it into an XML DOM object, returns the DOM object.
	function xml2json(xml_object, tab_replacement) - convert an XML DOM object to a JSON object, optionally replace the formatting TAB character with the supplied "tab_replacement"
	implementation of the JSON2 object using javascript closure:
		.toJSON(key)
		.quote(string)
		.str(key, holder)
		.stringify(value, replacer, space)
		.parse(text, reviver)
	
	Modification by Wisnu Prawoto - transform JSON dojo date to XML is error 
 	13 April 2015
 */
var JSON2;
function json2xml(o, tab, exclude) {
	var toXml = function (v, name, ind) {
		var xml = "";
		if (name.charAt(0) != exclude) {
			if (v instanceof Array) {
				for (var i = 0, n = v.length; i < n; i++) xml += ind + toXml(v[i], name, ind + "\t") + "\n";
			} else if (typeof(v) == "object") {
				var hasChild = false;
				xml += ind + "<" + name;
				
				for (var m in v) {
					if (m.charAt(0) == "@") xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
					else hasChild = true;
				}
				xml += hasChild ? ">" : "/>";
				if (hasChild) {
					for (var m in v) {
						var isAdate=false;
						if (m.slice(m.length-4).toLowerCase() == 'date') isAdate = m.length > 3 && v[m].toString().length > 0;
						if (m == "#text") {
							xml += v[m];
						} else if (m == "#cdata") {
							xml += "<![CDATA[" + v[m] + "]]>";
						} else if (m.charAt(0) != "@") {
							if (m.charAt(0) != "_") {
								if (isAdate){
									var tgh=v[m];
									var tgh2;
									// WP - 14/04/2015 - bug fix because isArray not a function but member of array, use instanceOf Array to check if isarray
									if (tgh instanceof Array) tgh = tgh[0];
									//if (tgh.getDate == undefined) tgh2 = new Date(tgh);
									xml += '<'+m+'>';
									if (tgh.getDate == undefined) { 
										if (tgh != "") tgh2 = changeDateFormat(tgh);

										//if (tgh2.getDate != undefined) { xml += makeDateString(tgh2); }
										xml += tgh2;
									}
									xml += '</'+m+'>';
								} else {
									xml += toXml(v[m], m, ind + "\t");
								}
							}
						}
					}
					xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
				}
			} else xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
		}
		return xml;
	},
		xml = "";
	for (var m in o) {
		result = toXml(o[m], m, "");
		xml += result.replace(/&/g, "&amp;");
	}
	return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}

function changeDateFormat(tgh) {
	var tmp, yr, mth, dt;
	yr = tgh.substring(0,4);
	mth = tgh.substring(5,7);
	dt =  tgh.substring(8,10);
	tmp = dt + '/' + mth + '/' + yr;
	return tmp;
}
function makeDateStringLong(tgh){
	var qt = tgh.getDate();
	switch (tgh.getDate()) {
	case 1: case 21: case 31: qt += "st"; break;
	case 2: case 22: qt += "nd"; break;
	case 3: case 23: qt += "rd"; break;
	default: qt += "th";
	}
	qt += ' ' + "January,February,March,April,May,June,July,August,September,October,November,December".split(',')[tgh.getMonth()+1];
	qt += ', ' + tgh.getFullYear();
	return qt;
}
function makeDateString(tgh){
	var qt = tgh.getDate();
	qt += '/'+(tgh.getMonth()+1);
	qt += '/'+tgh.getFullYear();
	return qt;
}
function parseXml(xml) {
	var dom = null;
	if (window.DOMParser) {
		try {
			dom = (new DOMParser()).parseFromString(xml, "text/xml");
		} catch (e) {
			dom = null;
		}
	} else if (window.ActiveXObject) {
		try {
			dom = new ActiveXObject('Microsoft.XMLDOM');
			dom.async = false;
			if (!dom.loadXML(xml)) window.alert(dom.parseError.reason + dom.parseError.srcText);
		} catch (e) {
			dom = null;
		}
	} else alert("cannot parse xml string!");
	return dom;
}
function xml2json(xml, tab) {
	var X = {
		toObj: function (xml) {
			var o = {};
			if (xml.nodeType == 1) {
				if (xml.attributes.length) for (var i = 0; i < xml.attributes.length; i++) o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
				if (xml.firstChild) {
					var textChild = 0,
						cdataChild = 0,
						hasElementChild = false;
					for (var n = xml.firstChild; n; n = n.nextSibling) {
						if (n.nodeType == 1) hasElementChild = true;
						else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++;
						else if (n.nodeType == 4) cdataChild++;
					}
					if (hasElementChild) {
						if (textChild < 2 && cdataChild < 2) {
							X.removeWhite(xml);
							for (var n = xml.firstChild; n; n = n.nextSibling) {
								if (n.nodeType == 3) o["#text"] = X.escape(n.nodeValue);
								else if (n.nodeType == 4) o["#cdata"] = X.escape(n.nodeValue);
								else if (o[n.nodeName]) {
									if (o[n.nodeName] instanceof Array) o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
									else o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
								} else o[n.nodeName] = X.toObj(n);
							}
						} else {
							if (!xml.attributes.length) o = X.escape(X.innerXml(xml));
							else o["#text"] = X.escape(X.innerXml(xml));
						}
					} else if (textChild) {
						if (!xml.attributes.length) o = X.escape(X.innerXml(xml));
						else o["#text"] = X.escape(X.innerXml(xml));
					} else if (cdataChild) {
						if (cdataChild > 1) o = X.escape(X.innerXml(xml));
						else
						for (var n = xml.firstChild; n; n = n.nextSibling) o["#cdata"] = X.escape(n.nodeValue);
					}
				}
				if (!xml.attributes.length && !xml.firstChild) o = null;
			} else if (xml.nodeType == 9) {
				o = X.toObj(xml.documentElement);
			} else
			alert("unhandled node type: " + xml.nodeType);
			return o;
		},
		toJson: function (o, name, ind) {
			var json = name ? ("\"" + name + "\"") : "";
			if (o instanceof Array) {
				for (var i = 0, n = o.length; i < n; i++) o[i] = X.toJson(o[i], "", ind + "\t");
				json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
			} else if (o == null) json += (name && ":") + "null";
			else if (typeof(o) == "object") {
				var arr = [];
				for (var m in o) arr[arr.length] = X.toJson(o[m], m, ind + "\t");
				json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
			} else if (typeof(o) == "string") json += (name && ":") + "\"" + o.toString() + "\"";
			else json += (name && ":") + o.toString();
			return json;
		},
		innerXml: function (node) {
			var s = ""
			if ("innerHTML" in node) s = node.innerHTML;
			else {
				var asXml = function (n) {
					var s = "";
					if (n.nodeType == 1) {
						s += "<" + n.nodeName;
						for (var i = 0; i < n.attributes.length; i++)
						s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
						if (n.firstChild) {
							s += ">";
							for (var c = n.firstChild; c; c = c.nextSibling)
							s += asXml(c);
							s += "</" + n.nodeName + ">";
						} else s += "/>";
					} else if (n.nodeType == 3) s += n.nodeValue;
					else if (n.nodeType == 4) s += "<![CDATA[" + n.nodeValue + "]]>";
					return s;
				};
				for (var c = node.firstChild; c; c = c.nextSibling) s += asXml(c);
			}
			return s;
		},
		escape: function (txt) {
			return txt.replace(/[\\]/g, "\\\\").replace(/[\"]/g, '\\"').replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r');
		},
		removeWhite: function (e) {
			e.normalize();
			for (var n = e.firstChild; n;) {
				if (n.nodeType == 3) { // text node
					if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
						var nxt = n.nextSibling;
						e.removeChild(n);
						n = nxt;
					} else n = n.nextSibling;
				} else if (n.nodeType == 1) {
					X.removeWhite(n);
					n = n.nextSibling;
				} else n = n.nextSibling;
			}
			return e;
		}
	};
	if (xml.nodeType == 9) xml = xml.documentElement;
	var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
	return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}
if (!JSON2) {
	JSON2 = {};
}(function () {
	"use strict";

	function f(n) {
		// Format integers to have at least two digits.
		return n < 10 ? '0' + n : n;
	}
	if (typeof Date.prototype.toJSON !== 'function') {
		Date.prototype.toJSON = function (key) {
			return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
		};
		String.prototype.toJSON =
		Number.prototype.toJSON =
		Boolean.prototype.toJSON = function (key) {
			return this.valueOf();
		};
	}
	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
		escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
		gap, indent, meta = {
			'\b': '\\b',
			'\t': '\\t',
			'\n': '\\n',
			'\f': '\\f',
			'\r': '\\r',
			'"': '\\"',
			'\\': '\\\\'
		},
		rep; // table of character substitutions

	function quote(string) {
		escapable.lastIndex = 0;
		return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
			var c = meta[a];
			return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		}) + '"' : '"' + string + '"';
	}

	function str(key, holder) {
		var i, k, v, length, mind = gap,
			partial, value = holder[key];
		if (k) {
			var ts1 = k + '';
			if (ts1.charAt(0) == "_") return '';
		}
		if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
			value = value.toJSON(key);
		}
		if (typeof rep === 'function') {
			value = rep.call(holder, key, value);
		}
		switch (typeof value) {
		case 'string':
			return quote(value);
		case 'number':
			return isFinite(value) ? String(value) : 'null';
		case 'boolean':
		case 'null':
			return String(value);
		case 'object':
			if (!value) {
				return 'null';
			}
			gap += indent;
			partial = [];
			if (Object.prototype.toString.apply(value) === '[object Array]') {
				length = value.length;
				for (i = 0; i < length; i += 1) {
					partial[i] = str(i, value) || '';
				}
				v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
				gap = mind;
				return v;
			}
			if (rep && typeof rep === 'object') {
				length = rep.length;
				for (i = 0; i < length; i += 1) {
					k = rep[i];
					if (k) {
						var ts1 = k + '';
						if (ts1.charAt(0) != "_") {
							if (typeof k === 'string') {
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + (gap ? ': ' : ':') + v);
								}
							}
						}
					}
				}
			} else {
				for (k in value) {
					if (k) {
						var ts1 = k + '';
						if (ts1.charAt(0) != "_") {
							if (Object.hasOwnProperty.call(value, k)) {
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + (gap ? ': ' : ':') + v);
								}
							}
						}
					}
				}
			}
			v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
			gap = mind;
			return v;
		}
	}
	if (typeof JSON2.stringify !== 'function') {
		JSON2.stringify = function (value, replacer, space) {
			var i;
			gap = '';
			indent = '';
			if (typeof space === 'number') {
				for (i = 0; i < space; i += 1) {
					indent += ' ';
				}
			} else if (typeof space === 'string') {
				indent = space;
			}
			rep = replacer;
			if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
				throw new Error('JSON2.stringify');
			}
			return str('', {
				'': value
			});
		};
	}
	if (typeof JSON2.parse !== 'function') {
		JSON2.parse = function (text, reviver) {
			var j;

			function walk(holder, key) {
				var k, v, value = holder[key];
				if (value && typeof value === 'object') {
					for (k in value) {
						if (Object.hasOwnProperty.call(value, k)) {
							v = walk(value, k);
							if (v !== undefined) {
								value[k] = v;
							} else {
								delete value[k];
							}
						}
					}
				}
				return reviver.call(holder, key, value);
			}
			text = String(text);
			cx.lastIndex = 0;
			if (cx.test(text)) {
				text = text.replace(cx, function (a) {
					return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				});
			}
			if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				j = eval('(' + text + ')');
				return typeof reviver === 'function' ? walk({
					'': j
				}, '') : j;
			}
			throw new SyntaxError('JSON2.parse');
		};
	}
}());