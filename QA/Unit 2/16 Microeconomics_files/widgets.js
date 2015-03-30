/**
 *
 * This revision: $Revision: 1.46 $
 * Date if this revision: $Date: 2008/05/28 08:59:19 $
 * Date if this revision: $Date: 2008/05/28 08:59:19 $
 * Author of this revision $Author: 7CITY\mwalton $
 * Name of this release: $Name:  $
 */

// load an XML document into a container, and set a handler to handle changes
// The XML document at url is loaded into container[identifier], with handler() used
// as an onreadystatechange handler
var xmlRequest;
function doXMLRequest(url, container, identifier, handler) {
	// branch for native XMLHttpRequest object
	if (container[identifier]) {
		container[identifier].abort();
	}
	if (window.XMLHttpRequest) {
		container[identifier] = new XMLHttpRequest();
		container[identifier].onreadystatechange = handler;
		container[identifier].open("GET", url, true);
		container[identifier].send(null);
	// branch for IE/Windows ActiveX version
	} else if (window.ActiveXObject) {
		container[identifier] = new ActiveXObject("Microsoft.XMLHTTP");
		if (container[identifier]) {
			container[identifier].onreadystatechange = handler;
			container[identifier].open("POST", url, true);
			container[identifier].send();
		}
	}
}

// handle an error
function error(m) {
	alert(m);
}
// trigger an error if an assertion is not true
function assert(x, m) {
	if(!x) error(m)
}

// get a section of the path up to and including the nth slash
function getPathSection(slashes) {
	var loc = document.location.pathname;
	for (var i=0; i<loc.length && slashes>0; i++) {
		if (loc.charAt(i) == '/') {
			slashes--;
		}
	}
	loc = loc.substring(0, i);
	return loc;
}
IMAGE_ROOT_URI = getPathSection(2) + 'i/';
ERP_ROOT_URI = getPathSection(3);
INSTRUCTION_ROOT_URI = getPathSection(4);


function parseIntWithLeadingZero(n) {
	if (n.indexOf('0') == 0) {
		n = n.substring(1)
	}
	return parseInt(n);
}

function suggestTime(field) {
	if (!field.value) {
		return;
	}
	field.validTime = false;
	// get first two numbers into an array
	if (matches = field.value.match(/([0-9]+)[^0-9]+([0-9]+)/)) {
		// parse the numbers into integers, recording if the hour started with a zero
		var hourHasZero = matches[1].indexOf('0') == 0;
		var hours = parseIntWithLeadingZero(matches[1]);
		var minutes = parseIntWithLeadingZero(matches[2]);
	} else if (matches = field.value.match(/([0-9]+)/)) {
		var hourHasZero = matches[1].indexOf('0') == 0;
		var hours = parseIntWithLeadingZero(matches[1]);
		var minutes = 0;
	} else {
		alert('"' + field.value +'" is not a valid time. Use hours:minutes');
		field.focus();
		return;
	}
	
	// check that the hour and minutes are within sane ranges
	if (hours > 23) {
		alert(hours + " is not a valid hour value...");
		field.focus();
		return;
	}
	if (minutes > 59) {
		alert(minutes + " is not a valid minute value...");
		field.focus();
		return;
	}
	
	// if the hour started with a leading zero and is less than 10, add one
	if (hourHasZero) {
		hours = '0' + hours;
	} else {
		// assume before 7 is 12 hour clock
		if (hours < 7) {
			hours += 12;
		}
		if (hours < 10) {
			hours = '0' + hours;
		}
	}
	
	// if the minute is a single figure, add a zero to the front
	if (minutes < 10) {
		minutes = '0' + minutes;
	}
	minutes = '' + minutes;
	hours = '' + hours;
	
	// store the values in the element
	field.hourValue = parseIntWithLeadingZero(hours);
	field.minuteValue = parseIntWithLeadingZero(minutes);
	field.validTime = true;
	
	field.value = hours + ':' + minutes;
}

/**
 * coerce a field into a date format, and return whether or not we were successful
 */
function coerceDate(field) {
	field.dateObj = false;
	
	if (!field.value) {
		return false;
	}
	// get first three numbers into an array
	var matches = field.value.match(/([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)/);
	if (matches) {
		// parse the numbers into integers, recording if the hour started with a zero
		var day = parseIntWithLeadingZero(matches[1]);
		var month = parseIntWithLeadingZero(matches[2]);
		var year = parseIntWithLeadingZero(matches[3]);
	} else {
		return false;
	}
	
	// the year must be 4 digits. If it is not, assume it is in '05' format and add 2000
	if (year < 1000) {
		year += 2000;
		if (year >= 2030) {
			year -= 100;
		}
	}
	
	var d = new Date(month+'/'+day+'/'+year);
	
	// store the date in the element
	field.dateObj = d;
	
	setDateDisplay(field, d);
	
	return true;
}

/**
 * Suggest a date for a field, and return whether the value was appropriate
 */
function suggestDate(field) {
	if(field.className == 'error') {
		field.className = ''
	}
		
	if (!field.value) {
		return false;
	}
	// get first three numbers into an array
	var matches = field.value.match(/([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)/);
	if (!coerceDate(field)) {
		field.className = 'error'
		alert('"' + field.value +'" is not a valid date. Use day/month/year');
		field.focus();
		return false;
	}
	
	return true;
}

/**
 * update a text field's display with a date object value
 */
function setDateDisplay(field, date) {
	
	var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	
	// ensure that day and month have leading zeros
	if (day < 10) {
		day = '0' + day;
	}
	if (month < 10) {
		month = '0' + month;
	}
	
	field.value = dayNames[date.getDay()] + ' ' + day + '/' + month + '/' + year;
}



// handle a keyup event on the date field
function dateKeyUp(field, e) {
	var event = e ? e : window.event;
	
	// prevent completion popups from appearing
	field.setAttribute('autocomplete', 'off');
	
	// detect magic keys (return and arrows)
	if (event.keyCode == 38) {
		// 38 == up key: decrease day by one
		suggestDate(field);
		if (field.dateObj) {
			field.dateObj.setDate(field.dateObj.getDate()-1);
			setDateDisplay(field, field.dateObj);
		}
	} else if (event.keyCode == 40) {
		// 40 == down key: increase day by one
		suggestDate(field);
		if (field.dateObj) {
			field.dateObj.setDate(field.dateObj.getDate()+1);
			setDateDisplay(field, field.dateObj);
		}
	}
}



// handle a keyup event on the date field
function timeKeyUp(field, e) {
	var event = e ? e : window.event;
	
	// prevent completion popups from appearing
	field.setAttribute('autocomplete', 'off');
	
	// detect magic keys
	if (event.keyCode == 38) {
		// 38 == up key: decerase time by half an hour
		suggestTime(field);
		if (field.validTime) {
			if (field.minuteValue == 0) {
				field.minuteValue = 30;
				field.hourValue = (field.hourValue - 1) % 24;
			} else if (field.minuteValue > 30) {
				field.minuteValue = 30;
			} else {
				field.minuteValue = 0;
			}
			setTimeField(field);
		}
	} else if (event.keyCode == 40) {
		// 40 == down key: increase time by half an hour
		suggestTime(field);
		if (field.validTime) {
			if (field.minuteValue < 30) {
				field.minuteValue = 30;
			} else {
				field.minuteValue = 0;
				field.hourValue = (field.hourValue + 1) % 24;
			}
			
			setTimeField(field);
		}
	}
}

function setTimeField(field) {
	if (field.hourValue < 10) {
		field.hourValue = '0' + field.hourValue;
	}
	if (field.minuteValue < 10) {
		field.minuteValue = '0' + field.minuteValue;
	}
	field.value = field.hourValue + ':' + field.minuteValue;
	suggestTime(field);
}

function numberKeyUp(field, e) {
	var event = e ? e : window.event;
	
	// prevent completion popups from appearing
	field.setAttribute('autocomplete', 'off');
	
	if (event.keyCode == 38 || event.keyCode == 40) { 
		
		var value = parseInt(field.value);
		if (isNaN(value)) {
			value = 0;
		}
		
		// detect magic keys
		if (event.keyCode == 38) {
			// 38 == up key: increase number by one
			value++;
		} else if (event.keyCode == 40) {
			// 40 == down key: decrease number by one
			value--;
		}
		if (value < 0) {
			value = 0;
		}
		field.value = value;
	
	}
}

// store the active Widget object for each widget
widgets = new Array();

// an array of valid widget classes
WidgetLibrary = new Array();

var autocompleteResultsCache = new Array();

// 2 functions to check if an emelent is a widget, and if so what type it is
function isWidget(el) { return el.getAttribute('widget') ? true : false }
function widgetType(el) { return el.getAttribute('widget'); }

// activate a widget by instantiating the appropriate class from the WidgetLibrary array
// passing it the widget element
function triggerWidget(el) {
	assert(isWidget(el), "triggerWidget called on non-widget");
	var type = widgetType(el);
	assert(WidgetLibrary[type], "unrecognised widget type: "+type);
	// if the widget is already present, and has a tearDown function, use it
	if (window.widgets[type] && window.widgets[type].tearDown) {
		window.widgets[type].tearDown();
	}
	window.widgets[type] = new WidgetLibrary[type](el);
}


/**
 * AUTOCOMPLETE WIDGET
 */

/**
 * Get the first parent of type <parentType> (e.g. 'form')
 */
function getParentNode(el, parentType) {
	parentType = parentType.toLowerCase()
	while (el.parentNode) {
		el = el.parentNode;
		if (el.nodeName.toLowerCase() == parentType) {
			return el;
		}
	}
}

WidgetLibrary.autocomplete = function(el) {
	
	this.setPosition = function() {
		var targetPos = getElementPosition(this.widgetElement);

		//if the target pos  the size of the popup window is greater than the main window
		if(targetPos.x + 290 > document.body.clientWidth)
		{
			this.popupElement.style.left = (document.body.clientWidth-300)+'px'; //move the popup into the main window
		}
		else
		{
			this.popupElement.style.left = (targetPos.x-11)+'px'; // BODGE ALERT! these values are the hard-coded offsets to
		}
        	this.popupElement.style.top  = (targetPos.y-12)+'px'; //   
		
		// if the popup has gone below thebottom of the screen, move it up
		var screenTop = 0;
		if (window.screenYOffset) {
			screenTop = window.screenYOffset;
		}
		if (document.body.scrollTop) {
			screenTop = document.body.scrollTop;
		}
		// prevent popup from going of the bottom of the screen
		var screenBottom = screenTop + document.body.clientHeight;
		var popupBottom = getElementPosition(this.popupElement).y + this.popupElement.clientHeight;
		if (popupBottom > screenBottom) {
			var currentTop = parseInt(this.popupElement.style.top);
			this.popupElement.style.top = (currentTop - (popupBottom - screenBottom)) + 'px';
		}
	}
	

	
	// handle a change of the XML request object
	// if the object has not finished loading, write a 'loading' sign. If it has,
	// assemble the returned data into an array and call the display function
	this.handleXMLStatusChange = function () {
		var xmlRequest = window.widgets.autocomplete.xmlRequest;
		// if the XML object has finished loading
		if (xmlRequest.readyState == 4) {
			//alert(xmlRequest.responseText)
			var results = xmlRequest.responseXML.getElementsByTagName('result');
			var resultsArray = new Array()
			for (var i=0; i<results.length; i++) {
				resultsArray[i] = new Object();
				resultsArray[i].value = results[i].getAttribute('value');
				resultsArray[i].text = (results[i].childNodes.length) ? results[i].childNodes[0].nodeValue : '';
				resultsArray.resultCount = parseInt(xmlRequest.responseXML.documentElement.getAttribute('resultCount'));
				resultsArray.resultStart = parseInt(xmlRequest.responseXML.documentElement.getAttribute('resultStart'));
				resultsArray.resultEnd = parseInt(xmlRequest.responseXML.documentElement.getAttribute('resultEnd'));
			}
			autocompleteResultsCache[window.widgets.autocomplete.queryUrl] = resultsArray;
			window.widgets.autocomplete.displayResults(resultsArray);
		}
		// if the XML object load process is still in progress
		else  {
			document.getElementById('autocompleteResults').innerHTML = 'Searching...';
		}
	}
	
	// write the results of a search into the page. This involves looping over
	// the searchResults array, generating link elements and inserting them into
	// the display target and creating a reference to them in the searchResults array
	this.displayResults = function(results) {
		this.searchResults = results;
		var target = document.getElementById('autocompleteResults');
		target.innerHTML = '';
		if (this.searchResults.length) {
			// add links to the target
			for (var i=0; i<this.searchResults.length; i++) {
				var url = 'javascript:window.widgets.autocomplete.commit('+i+');';
				var link = document.createElement('a');
				link.setAttribute('href', url);
				link.setAttribute('title', 'ID: '+this.searchResults[i].value);
				link.className = this.linkClassName;
				var linkText = this.searchResults[i].text;
				linkText = linkText.replace(/ /g, '&nbsp;');
				link.innerHTML = linkText;
				target.appendChild(link);
				this.searchResults[i].linkElement = link;
			}
			// if we hit the maximum
			if (this.searchResults.resultStart > 0 || this.searchResults.resultEnd < this.searchResults.resultCount) {
				var text = "Result "+(this.searchResults.resultStart+1)+" to "+this.searchResults.resultEnd+" of "+this.searchResults.resultCount;
				document.getElementById('autocompletePagingText').innerHTML = text;
				document.getElementById('autocompletePaging').style.display = '';
			} else {
				document.getElementById('autocompletePaging').style.display = 'none';
			}
			// show or hide the arrows
			if (this.hasPreviousPage()) {
				document.getElementById('autocompletePreviousArrow').style.visibility = '';
			} else {
				document.getElementById('autocompletePreviousArrow').style.visibility = 'hidden';
			}
			if (this.hasNextPage()) {
				document.getElementById('autocompleteNextArrow').style.visibility = '';
			} else {
				document.getElementById('autocompleteNextArrow').style.visibility = 'hidden';
			}
		} else {
			target.innerHTML = 'No results.';
		
			if (el.getAttribute('acCreateSrc')) {
				target.innerHTML += ' <a href="javascript:window.widgets.autocomplete.createNew()">make new</a>';
			}
		}
		this.setActiveLink();
		this.setPosition();
	}
	
	// set the link styles so that only the active link has the active style
	this.setActiveLink = function() {
		for (var i=0; i<this.searchResults.length; i++) {
			var className = (i == this.activeLinkIndex) ? this.activeLinkClassName : this.linkClassName
			this.searchResults[i].linkElement.className = className;
		}
	}
	
	// set the fielt to null, i.e. clear both the hidden input anf the display field
	this.setToNull = function() {
		this.widgetElement.value="";
		this.store.value="";
	}
	
	this.clear = function() {
		this.setToNull();
		this.tearDown();
	}
	
	// update the search list based on what was typed into the box
	this.doQuery = function(query, start) {
		document.getElementById('autocompleteResults').innerHTML = '';
		if (query.length >= this.minQueryLength) {
			var sep = (this.source.indexOf('?') == -1) ? '?' : '&';
			var url = this.source + sep + 'maxResults='+escape(this.maxResults)+'&query='+escape(query);
			if (start) {
				url += '&start='+escape(start);
			}
			this.queryUrl = url;
			if (autocompleteResultsCache[url]) {
				this.displayResults(autocompleteResultsCache[url]);
			} else {
				doXMLRequest(url, window.widgets.autocomplete, 'xmlRequest', this.handleXMLStatusChange);
			}
		} else {
			document.getElementById('autocompletePaging').style.display = 'none';
		}
	}
	
	// check if there is another page of ddata before this one
	this.hasPreviousPage = function() {
		return this.searchResults.resultStart > 0;
	}
	
	// check if there is another page of ddata after this one
	this.hasNextPage = function() {
		return this.searchResults.resultStart < this.searchResults.resultCount - this.maxResults;
	}
	
	this.goNextPage = function() {
		var e = new Object();
		e.keyCode = 39; // right arrow
		this.searchInputKeyUp(e);
	}
	
	this.goPreviousPage = function() {
		var e = new Object();
		e.keyCode = 37; // right arrow
		this.searchInputKeyUp(e);
	}
	
	// handle a keyup event on the search field. This is either a new letter being
	// typed (so do a new query) or a up-down keypress (so move through the list)
	// or a return (so commit)
	this.searchInputKeyUp = function(e) {
		var event = e ? e : window.event;
		
		// put the cursor back to the end of the input
		var saveVal = document.getElementById('autocompleteInput').value;
		document.getElementById('autocompleteInput').value = '';
		document.getElementById('autocompleteInput').value = saveVal;
		
		// detect magic keys (return and arrows)
		if (event.keyCode == 37 && this.searchResults.length) {
			// 37 == left key: go to previous page if we can
			if (this.hasPreviousPage()) {
				var start = this.searchResults.resultStart - this.maxResults;
				start = Math.max(start, 0);
				this.doQuery(document.getElementById('autocompleteInput').value, start);
			}
			return false;
		} else if (event.keyCode == 39 && this.searchResults.length) {
			// 39 == right key: go to next page if we can
			if (this.hasNextPage()) {
				var start = this.searchResults.resultStart + this.maxResults;
	//			start = Math.min(start, this.searchResults.resultCount-this.maxResults);
				this.doQuery(document.getElementById('autocompleteInput').value, start);
			}
			return false;

		} else if (event.keyCode == 38 && this.searchResults.length) {
			// 38 == up key: move the active link up and wrap if required
			this.searchResults[this.activeLinkIndex].className = this.linkClassName;
			this.activeLinkIndex --;
			if (this.activeLinkIndex < 0) {
				this.activeLinkIndex = this.searchResults.length-1;
			}
			this.setActiveLink();
		} else if (event.keyCode == 40 && this.searchResults.length) {
			// 40 == down key: move the active link down and wrap if required
			this.searchResults[this.activeLinkIndex].className = this.linkClassName;
			this.activeLinkIndex ++;
			if (this.activeLinkIndex >= this.searchResults.length) {
				this.activeLinkIndex = 0;
			}
			this.setActiveLink();
		} else if (event.keyCode == 13 && this.searchResults.length) {
			// 13 == return key: select the active link
			this.commit(this.activeLinkIndex);
		} else {
			this.activeLinkIndex = 0;
			this.doQuery(document.getElementById('autocompleteInput').value);
		}
		return true;
	}
	
	// cancel without changing the values of the fields
	this.tearDown = function() {
        //  Ensure that the autocompleteResults are present before trying to reset them
        if(document.getElementById('autocompleteResults')){
    		document.getElementById('autocompleteResults').innerHTML = '';
        }
		this.popupElement.style.display = 'none';
		this.autocompleteInput.value = '';
		this.widgetElement.blur();
		setBadElementVisibility(false);
	}
	
	// used for creating a new item, opens up an iframe which calls back to createCallback() when done.
	this.createNew = function() {
		if (acCreateSrc = el.getAttribute('acCreateSrc')) {
			window.widgets.autocomplete.autocompleteInput._creatingNew=true;
			var target = document.getElementById('autocompleteResults');
			target.innerHTML = '<iframe class="boxItem" style="border: solid 1px black; margin:0px; padding: 0px;" src="' + acCreateSrc + '?initialValue=' + escape(window.widgets.autocomplete.autocompleteInput.value) + '" width="400" height="250" frameborder="0" name="autocompleteNewFrame"></iframe>';
		}
	}
	
	// callback function used when a new item has been created and selected
	this.createCallback = function(value, text) {
		var newIndex = this.searchResults.length;
		this.searchResults[newIndex] = new Object();
		this.searchResults[newIndex].text = text;
		this.searchResults[newIndex].value = value;
		this.commit(newIndex);
		
		// empty cache because new item won't be in the existing one
		autocompleteResultsCache = new Array();
	}
	
	// cancel without changing the values of the fields
	this.cancel = function() {
		// set a timer, because this is fired from an onblur of the search input,
		// so will be called when a user clicks on a result link
		window.setTimeout("window.widgets.autocomplete.tearDown();", 100)
	}
	
	// finish and select an item. The index is into the results array returned by the search
	this.commit = function(index) {
		// save the value in the store, if there is one
		if (this.store) {
			this.store.value = this.searchResults[index].value;
		}
		this.widgetElement.value = this.searchResults[index].text;
		// if the text field has an onchange handler, fire it
		if (this.widgetElement.onchange) {
			this.widgetElement.onchange();
		}
		if (this.store.onchange) {
			this.store.onchange();
		}
		callback = el.getAttribute('acCallback')
		if (callback) {
			var x1 = this.store.value;
			var x2 = this.searchResults[index].text;
			eval("window."+callback+"(x1, x2);");
		}		
		this.tearDown();
	}
	
		this.widgetElement = el;
	
	// the first time this is called, write the HTML to the page
	if (!document.getElementById('autocompletePopup')) {
		var popup = document.createElement('div');
		popup.setAttribute('id', 'autocompletePopup');
		popup.className = 'popupBox';
		popup.style.display = 'none';
		popup.style.position = 'absolute';
		var form;
		var _el = getParentNode(el, 'form');
		_el.parentNode.appendChild(popup);
		popup.innerHTML = '\
			<input id="autocompleteInput" \
				type="text" \
				size="30" \
				autocomplete="off" \
				class="active" \
				onfocus="this._hasFocus=true;setTimeout(\'window.widgets.autocomplete.doQuery(&quot;&quot;)\', 50);" \
				onkeyup="return window.widgets.autocomplete.searchInputKeyUp(event);" \
				onblur="this._hasFocus=false;setTimeout(\'if(!window.widgets.autocomplete.autocompleteInput._hasFocus && !window.widgets.autocomplete.autocompleteInput._creatingNew)window.widgets.autocomplete.cancel()\', 200);"\
			> (<a href="javascript:window.widgets.autocomplete.clear()">clear</a>) \
			<table cellpadding="5" cellspacing="0" border="0" id="autocompletePaging" style="display:none" width="270">\
				<tr>\
					<td><img src="'+IMAGE_ROOT_URI+'icons/previous.gif" \
						id="autocompletePreviousArrow"></td>\
					<td align="center" id="autocompletePagingText" style="font-weight: bold">&nbsp;</td>\
					<td align="right"><img src="'+IMAGE_ROOT_URI+'icons/next.gif" id="autocompleteNextArrow"></td>\
				</tr>\
			</table>\
			<div id="autocompleteResults"></div>\
		';
	}
	
	// initiation code
	
	// check that all attributes are present
	this.source = el.getAttribute('acSource');
	assert(this.source, "missing acSource attribute");
	
	this.maxResults = el.getAttribute('acMaxResults');
	if(!this.maxResults) this.maxResults = '20';
	this.maxResults = parseInt(this.maxResults);
	
	this.minQueryLength = el.getAttribute('acMinQueryLength');
	if(!this.minQueryLength) this.minQueryLength = '3';
	this.minQueryLength = parseInt(this.minQueryLength);
	
	var store = el.getAttribute('acStore');
	if (store) {
		this.store = document.getElementById(store);
		assert(this.store, "missing storage: id "+store);
	}
	
	// create the search popup in the same position as the widget element
	this.popupElement = document.getElementById('autocompletePopup');
	this.autocompleteInput = document.getElementById('autocompleteInput');
	this.setPosition();
	document.getElementById('autocompletePaging').style.display = 'none';
	this.popupElement.style.display = '';
	this.autocompleteInput.style.width = this.widgetElement.clientWidth;
	this.autocompleteInput.focus();

	
	// hide bad elements
	setBadElementVisibility(true);
	
	// the searchResults array is a numeric array of result. Each object has
	// searchResults[n].value = the value attribute of the result element returned in XML 
	// searchResults[n].text = the text contents of the result element  
	// searchResults[n].linkElement = a reference to the link element in the search results 
	this.searchResults = new Array();
	
	// the index of the link in searchResults that is active, i.e. clicking return will
	// activate it.
	this.activeLinkIndex = 0;
	
	this.linkClassName = 'popupLink';
	this.activeLinkClassName = 'popupLink activePopupLink';
}

// discover the x and y position of any element. Since the offsetHeight
// and offsetWidth properties are relative to offsetParent, we must
// loop up through the tree summing the offsets.
function getElementPosition(el) {
	var result = new Array();
	result.x = 0;
	result.y = 0;
	if (el.offsetParent){
		while (el.offsetParent){
			result.x += el.offsetLeft
			result.y += el.offsetTop
			el = el.offsetParent;
		}
	} else if (el.x && elj.y) {
		result.x += el.x;
		result.y += el.y;
	}
	return result;
}
/** 
 * Return the current value of an element's style
 *
 * @param Element element
 * @param String styleName
 */
function getElementStyle(element, styleName){
	var value = element.style[styleName];
	if (!value) {
		if (element.currentStyle) {
			value = element.currentStyle[styleName];
		} else {
			value = '';
		}
	}
	return value;
}
/** 
 * @param bool hide true hides the elements, false restores them
 */
function setBadElementVisibility(hide) {
	// only do this on IE
	if (navigator.userAgent.toLowerCase().indexOf('msie') == -1) {
		return;
	}

	var tags = new Array("applet", "iframe", "select");

	for (var k = tags.length; k > 0; ) {
		var elements = document.getElementsByTagName(tags[--k]);
		var element = null;
		
		for (var i = elements.length; i > 0;) {
			element = elements[--i];
			if (element.nodeName.toLowerCase() == 'select') {
				if (!element.previousDisplay) {
					element.previousDisplay = getElementStyle(element, 'display');
				}
				if (hide) {
					element.style.display = 'none';
					// add a text field replacement for selects
					var replacement = document.createElement('input');
					replacement.setAttribute('type', 'text');
					// bug fix for empty dropdowns
					if (element.options.length) {
						replacement.setAttribute('value', element.options[element.selectedIndex].text);	
					}					
					replacement.style.width = element.clientWidth + 'px';
					replacement.style.marginTop = '-1px'; // hacks so there is no jumping in IE
					replacement.style.marginBottom = '-1px';
					replacement.style.paddingLeft = '3px';
					element.parentNode.insertBefore(replacement, element);
					element.tempReplacement = replacement;
				} else {
					element.style.display = element.previousDisplay;
					if (element.tempReplacement) {
						element.parentNode.removeChild(element.tempReplacement);
						element.tempReplacement = null;
					}
				}
			} else {
				if (!element.previousVisibility) {
					element.previousVisibility = getElementStyle(element, 'visibility');
				}
				if (hide) {
					element.style.visibility = 'hidden';
				} else {
					element.style.visibility = element.previousVisibility;
					if (element.tempReplacement) {
						element.parentNode.removeChild(element.tempReplacement);
					}
				}
			}
		}
	}
}


/**
 * DataCollector_ArrayField code
 */
function arrayManage(name, initialValues) {
	this.name = name;
	this.assocIds = initialValues;
    if (undefined != arguments[2])
        this.maxValues = arguments[2];
    else
        this.maxValues = 10000000;    // arbitrarily large int
	this.drawItems();
}

arrayManage.prototype = {
	
	removeItem: function (id) {
		for (i = 0 ; i <= this.assocIds.length - 1; i++) {
			if (this.assocIds[i][0] == id) {
				this.assocIds.splice(i, 1);
			}
		}
		this.drawItems();
	},
	
	drawItems: function() {
		out = '';
		form = '';
		if (this.assocIds.length > 0) {
			out += '<ul>';
			for (i = 0 ; i <= this.assocIds.length - 1; i++) {
				out += "<li>" + this.assocIds[i][1] + ' <a href="javascript:void(' + this.name + 'Obj.removeItem(' + this.assocIds[i][0] + '))"><span style="color:red;">X</span></a></li>';
				if (form) {
					form += ':';
				}
				form += this.assocIds[i][0];
			}
			out += '</ul>';
		} else {
			out += '<p class="inactive">[none]</p>';
		}
		
		document.getElementById(this.name + 'DisplayPane').innerHTML = out;
		document.getElementById(this.name).value = form;
	},
	
	addItem: function(id, newName) {
		document.getElementById(this.name + '_new_widget').value = '';

		for (i = 0 ; i <= this.assocIds.length - 1; i++) {
			if (this.assocIds[i][0] == id) {
				return true;
			}
		}

        if (this.full())    // make sure we have space for more
            return true;

		this.assocIds[this.assocIds.length] = new Array(id, newName);
		this.drawItems();
	},
	
	empty: function () {
		this.assocIds = new Array();
		this.drawItems();
	},

    full: function () {
        return this.maxValues <= this.assocIds.length;
    }
}


/**
 * DataCollector_ErpFileArrayField code
 */
function arrayFile(name, initialValues, linkUrl) {
	this.name = name;
	this.assocIds = initialValues;
	this.linkUrl = linkUrl;
	this.drawItems();
}

arrayFile.prototype = {
	
	removeItem: function (id) {
		for (i = 0 ; i <= this.assocIds.length - 1; i++) {
			if (this.assocIds[i][0] == id) {
				this.assocIds.splice(i, 1);
			}
		}
		this.drawItems();
	},
	
	drawItems: function() {
		out = '<table style="border: 1px solid #999; width: 100%">';
		form = '';
		if (this.assocIds.length > 0) {
			for (i = 0 ; i <= this.assocIds.length - 1; i++) {
				out += "<tr";
				// Bitwise comparison returns true for odd-numbered rows
				if (i & 1) out += ' style="background-color: #ddd;"'
				out += "><td>";
				if (this.linkUrl) out += '<a href="' + this.linkUrl + this.assocIds[i][0] + '/" title="Download this file">'
				out += this.assocIds[i][1];
				if (this.linkUrl) out += '</a>'
				out += '</td></tr>';
				if (form) {
					form += ':';
				}
				form += this.assocIds[i][0];
			}
		} else {
			out += "<tr";
			out += "><td>";
			out += '<span class="inactive">[Click &#8220;Manage&#8221; to attach a file]</span>';
			out += '</td></tr>';
		}
		out += '</table>';
		
		document.getElementById(this.name + 'DisplayPane').innerHTML = out;
		document.getElementById(this.name).value = form;
	},
	
	addItem: function(id, newName) {
		//document.getElementById(this.name + '_new_widget').value = '';
		
		for (i = 0 ; i <= this.assocIds.length - 1; i++) {
			if (this.assocIds[i][0] == id) {
				return true;
			}
		}
		this.assocIds[this.assocIds.length] = new Array(id, newName);
		this.drawItems();
	}
}

/**
 * DATE WIDGET
 */





/**
 * Dynamic select
 * This is not really a widget, but a function for populating a child select control
 * with data depending on a parent
 * @param datasource - mode of Search to get data with trailing but not leading slash, e.g. offerings/ByProduct/
 * @param childid - the select control DOM id to be changed
 * @param parentid - the select control DOM id containing the source value
 * 
 * Added by James Geldart 2010-09-14
 */
function dynamicSelect(datasource, childid, parentid)
{
	var i;
	if(document.getElementById(parentid).type == "hidden")		//this is for search popups
		var linkval = document.getElementById(parentid).value;
	else
	{
		var linksel = document.getElementById(parentid).selectedIndex;
		var linkval = document.getElementById(parentid).options[linksel].value;
	}
	
	var urlstring = datasource + linkval + "/";
	
	var x;
	
	/* doing our own XML request because the one written above requires an object to be passed in
	 * as the container*/
	if (window.XMLHttpRequest) {
		x = new XMLHttpRequest();
		x.onreadystatechange = function() {dynamicSelectLoad(x, childid) }
		x.open("GET", urlstring, true);
		x.send(null);
	// branch for IE/Windows ActiveX version
	} else if (window.ActiveXObject) {
		x = new ActiveXObject("Microsoft.XMLHTTP");
		if (x) {
			x.onreadystatechange = function() {dynamicSelectLoad(x, childid) }
			x.open("POST", urlstring, true);
			x.send();
		}
	}
 
}
/**
 * Load function for dynamic select
 */
function dynamicSelectLoad(xmlObj, selectid)
{
	if (xmlObj.readyState == 4 && (xmlObj.status==200))
	{
		var i, opt;
		var results = xmlObj.responseXML.getElementsByTagName('result');
		document.getElementById(selectid).options.length = 0;	//clear current options
		document.getElementById(selectid).options[0] = new Option("Select...", 0); //default
		
		for (i = 0; i < results.length; i++) 
		{
			opt = new Option((results[i].childNodes.length ? results[i].childNodes[0].nodeValue : ''),
							results[i].getAttribute('value'));
			document.getElementById(selectid).options[i + 1] = opt;
		}
		document.getElementById(selectid).selectedIndex = 0;
	}
}
/**
 * END dynamic select
 */
 
/**
 * create an autocomplete control on the fly
 * nb source must be the full local URI eg erp/erp_live/2/index.php/Search/etc/
 */
function createAutoComplete(id, name, source, onChange)
{
	var html = '<input type="hidden" tabindex="1" name="' + name + '" value="0" class="searchForm_autocomplete" id="' + id  + '" onChange="' + onChange + '">';
	html += '<input type="text" onfocus="triggerWidget(this);" class="searchForm_autocomplete" value="" widget="autocomplete" acSource="' + source + '" acMaxResults=20 acMinQueryLength=0 id="' + id + '_widget" acStore="' + id + '">';
	
	return html;
}

//
///**
// * Attach an event (eg 'blur') to an element. f is the handler function
// */
//function attachEvent(el, event, f) {
//	var handler = 'on'+event;
//	var list = event+'Events';
//	if (!el[list]) {
//		el[list] = new Array();
//		if (el[handler]) {
//			el[list][0] = el[handler];
//		}
//		el[handler] = eval("function() {\
//			var i;\
//			alert('foo');\
//			for (i in this."+list+") {\
//				this."+list+"[i]()\
//			}\
//		}");
//	}
//	el[list][el[list].length] = f;
//}
//
//WidgetLibrary.date = function(el) {
//	attachEvent(el, 'blur', function() {alert('anon');})
//	// the first time that element is triggered, set up event handlers
//	if (!el._dateWidgetSetUp) {
//		f = function() {
//			alert(this.value);
//		}
//		attachEvent(el, 'blur', f);
//	}
//}


