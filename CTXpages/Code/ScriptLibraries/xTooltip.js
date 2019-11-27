/* VERSION 1.03
03DEC2012 Bruce Langner
modified for use with xpages server assigned field ids
10JUL2012 Bruce Langner
added dojo tooltip help objects and removed assigning tooltip help to title
09JUL2012 Bruce Langner
added condition when fieldname appends a number w/o an underscore, eg: xxx1 instead of xxx_1
20SEP2011 Biologcals Development Team
loadTooltipHelp() - callback function from the lookupData agent
called once the json has been returned which contains the tooltip help;
assigns the tooltip help to the relevant html object's title attribute
 */
function loadTooltipHelp(parentId) {
	try {
		var idPrefix = "";
		if (typeof (parentId) != "undefined" && parentId != null) {
			var charPos = parentId.lastIndexOf(":");
			if (charPos !== -1) {
				idPrefix = parentId.substr(0, charPos) + ":"
			}
		}

		for ( var i = 0; i < tooltipHelp.items.length; i++) {
			var tooltiptext = tooltipHelp.items[i].name;
			var tooltipfield = tooltipHelp.items[i].fieldname;
			// var fieldObj = dojo.byId(tooltipHelp.items[i].fieldname);
			var fieldObj = null;
			if (idPrefix != "") {
				fieldObj = dojo.byId(idPrefix + tooltipfield);
			}
			if (!fieldObj) {
				var fieldid = "";
				if (typeof (parentId) != "undefined" && parentId != null)
					fieldid = getItemId(parentId, tooltipfield);
				else
					fieldid = getItemId("", tooltipfield);
				fieldObj = dojo.byId(fieldid);
			}
			if (fieldObj) {
				var tip = new dijit.Tooltip( {
					connectId : [ fieldObj ],
					label : tooltiptext
				});
				try {
					if (fieldObj.nextSibling) {
						if (fieldObj.nextSibling.className) {
							if (fieldObj.nextSibling.className
									.indexOf('dijitPlaceHolder') >= 0) {
								fieldObj.nextSibling.title = tooltiptext;
							}
						}
					}
				} catch (e) {
					consoleLog('Problem setting the tooltip help for this Dijits placeHolder: ' + e);
				}
			} else {
				for ( var x = 0; x < 999; x++) {
					var tmpfieldname = tooltipHelp.items[i].fieldname + '_'
							+ x.toString();
					var fieldObj = dojo.byId(tmpfieldname);
					if (fieldObj) {
						var tip = new dijit.Tooltip( {
							connectId : [ fieldObj ],
							label : tooltiptext
						});
					} else {
						var tmpfieldname = tooltipHelp.items[i].fieldname
								+ x.toString();
						var fieldObj = dojo.byId(tmpfieldname);
						if (fieldObj) {
							var tip = new dijit.Tooltip( {
								connectId : [ fieldObj ],
								label : tooltiptext
							});
						} else {
							tmpfieldname = '';
							break;
						}
					}
				}
			}
		}
	} catch (e) {
		consoleLog("xTooltip - loadTooltipHelp() error: " + e)
	}
}

function loadTooltipHelp() {
	for ( var i = 0; i < tooltipHelp.items.length; i++) {
		var tooltiptext = tooltipHelp.items[i].name;
		var tooltipfield = tooltipHelp.items[i].fieldname;
		var fieldObj = dojo.byId(tooltipHelp.items[i].fieldname);
		if (fieldObj) {
			var tip = new dijit.Tooltip( {
				connectId : [ fieldObj ],
				label : tooltiptext,
				position : 'top'
			});
			try {
				if (fieldObj.nextSibling) {
					if (fieldObj.nextSibling.className) {
						if (fieldObj.nextSibling.className
								.indexOf('dijitPlaceHolder') >= 0) {
							fieldObj.nextSibling.title = tooltiptext;
						}
					}
				}
			} catch (e) {
			}
		} else {
			for ( var x = 0; x < 999; x++) {
				var tmpfieldname = tooltipHelp.items[i].fieldname + '_'
						+ x.toString();
				var fieldObj = dojo.byId(tmpfieldname);
				if (fieldObj) {
					var tip = new dijit.Tooltip( {
						connectId : [ fieldObj ],
						label : tooltiptext,
						position : 'top'
					});
				} else {
					var tmpfieldname = tooltipHelp.items[i].fieldname
							+ x.toString();
					var fieldObj = dojo.byId(tmpfieldname);
					if (fieldObj) {
						var tip = new dijit.Tooltip( {
							connectId : [ fieldObj ],
							label : tooltiptext,
							position : 'top'
						});
					} else {
						tmpfieldname = '';
						break;
					}
				}
			}
		}
	}
}