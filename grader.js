#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "";
var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};
var assertURLExists = function(inurl) {
    var instr = inurl.toString();
    //console.log (instr);
    if (instr ==""){
	return instr;
	}
    var result2 = rest.get(instr).on('complete',function(result){
	if (result instanceof Error){
	    console.log("error html");
	    process.exit(1);
	    }
	return instr;   
    });
    //console.log(instr);
    return instr;
};

//var cheerioHtmlFile = function(htmlfile,urlfile) {
//    if (urlfile==""){
//	return cheerio.load(fs.readFileSync(htmlfile));
//   	}
//    else {
//	   //console.log(urlfile);
//	   htmlfile=rest.get(urlfile).on('complete',function(result){
	       //console.log(result);
//	       return result;
//	   })
	//console.log(htmlfile);   
//	return cheerio.load(htmlfile);
//	}
//};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, urlfile) {
    //console.log(urlfile);
    if (urlfile==""){
	var cheeriofile =cheerio.load(fs.readFileSync(htmlfile));  
	var checkJson = checkCheerio(cheeriofile,checksfile);
	 var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson); 
	return outJson;
	}
    else {
	      rest.get(urlfile).once('complete',function(result){
	         //console.log(checksfile);
		 //console.log(result);
		 var cheeriofile = cheerio.load(result);
		 var checkJson = checkCheerio(cheeriofile,checksfile);
		 var outJson = JSON.stringify(checkJson, null, 4);
		 //console.log('hallo');
		 console.log(outJson);
		 return outJson;
	       
	   });
	//console.log(htmlfile);   
	//return cheerio.load(htmlfile);
	}

};

var checkCheerio = function(cheeriofile,checksfile){
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = cheeriofile(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};


if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <url_name>', 'URL ',clone(assertURLExists),URL_DEFAULT)
        .parse(process.argv);
    //console.log(program.url);
    var outJson = checkHtmlFile(program.file, program.checks,program.url);
    
    //console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
