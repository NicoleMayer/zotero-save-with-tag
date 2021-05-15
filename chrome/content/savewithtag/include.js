// Only create main object once
if (!Zotero.SaveWithTag) {
	let loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1']
					.getService(Components.interfaces.mozIJSSubScriptLoader);
	let scripts = ['savewithtag', 'progressWindow'];
	scripts.forEach(s => loader.loadSubScript('chrome://savewithtag/content/' + s + '.js'));
};

window.addEventListener('load', function (e) {
    Zotero.SaveWithTag.init();
}, false);