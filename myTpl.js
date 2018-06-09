/********************************************************************
*	myTpl.js - clientside template engine							*
*	author: Mehmet Yüce (https://github.com/myuce)					*
********************************************************************/

var myTpl = (function(tplDir) {
	this.tplDir = tplDir;
	var cache = {};
	// get variables with dot notation
	function get(val,obj) {
		val = val.replace(/:/g,'.').split('.');
		for(var i = 0; i < val.length; i++) {
			obj = obj[val[i]];
		}
		return obj;
	}

	// convert template to pure javascript code
	function compile(tplString) {
		tplString = tplString
		.replace(/\r\n|\n|\t/g,'')

		.replace(/{\%(.*?)}/g,"`+get('$1',obj)+`") // print variables

		.replace(/<!-- (if|elseif) (.*?) -->/g,function(str,loop,condition) { // if/else statements
			loop = loop == "elseif" ? "} else if" : "if";
			condition = condition.replace(/\$([\S]+)/g,"get('$1',window)");
			condition = condition.replace(/\%([\S]+)/g,"get('$1',obj)");
			return "`;"+
				"\n"+loop+"("+condition+") {\n"+
				"result += `";
		})

		.replace(/<!-- else -->/g,
			"`;"+
			"\n} else {\n"+
			"result += `"
		)

		.replace(/<!-- (endif|end) -->/g,
			"`;"+
			"\n}\n"+
			"result += `"
		)

		.replace(/<!-- begin (.*?) -->/g,function(str,variable) { // shorthand if true
			variable = variable.replace(/\$([\S]+)/g,"get('$1',window)");
			variable = variable.replace(/\%([\S]+)/g,"get('$1',obj)");
			return "`;"+
			"\nif("+variable+" == true) {\n"+
			"result += `";
			}
		)

		.replace(/<!-- loop (.*?) as (.*?) -->/g, // loop through arrays
			"`;\n"+
			"var temp_$2 = get('$1',obj);\n"+
			"if(typeof temp_$2 == 'object' && temp_$2.length != 0) {\n"+
			"for(var i_$2 = 0; i_$2 < temp_$2.length; i_$2++) {\n"+
			"obj['$2'] = temp_$2[i_$2];\n"+
			"result += `"
		)

		.replace(/<!-- empty -->/g, // if an array is empty
			"`;\n"+
			"}\n"+
			"} else {{\n"+
			"result += `"
		)

		.replace(/<!-- endloop -->/g,
			"`;\n"+
			"}\n"+
			"}\n"+
			"result += `"
		);

		tplString = "var result = `"+tplString+"`";
		return tplString;
	}

	// cache templates compiled as pure javascirpt code as functions
	function setCache(tplName,compiled) {
		cache[tplName] = (function(domElem,obj) {
			eval(compiled);
			document.getElementById(domElem).innerHTML = result;
		});
	}

	this.load = function(tplName,domElem,obj) {
		// check if the template is cached
		if(typeof cache[tplName] == "function") {
			cache[tplName](domElem,obj);
			return;
		}
		var tplFile = this.tplDir + "/" + tplName + ".html";
		var xhr = new XMLHttpRequest();
		xhr.open("GET",tplFile,true);
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4) {
				var compiled = compile(xhr.responseText);
				// cache the compiled template, 
				setCache(tplName,compiled);
				cache[tplName](domElem,obj);	
			}
		};
		xhr.send();
	}

});