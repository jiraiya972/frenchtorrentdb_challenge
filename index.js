var express = require('express');
var request = require("request");

var app = express();
app.set('port', (process.env.PORT || 5000));

URL_CHALLENGE = "http://www.frenchtorrentdb.com/?section=LOGIN&challenge=1";

//challenge method do not modified
eval(function(b,c,a,e,d){for(d=function(a){return(a<c?"":d(a/c))+String.fromCharCode(a%c+161)};a--;)e[a]&&(b=b.replace(RegExp(d(a),"g"),e[a]));return b}("\u00a1 a='\u00a2';",2,2,["var","05f"]));

app.get('/challenge', function(req, res) {

	var j = request.jar();
	request.get({url: URL_CHALLENGE, jar: j},function(e,r,b){
		//error
		if(e) throw e;

		var data = JSON.parse(b);
		challenge = getChallenge(data.challenge);
		hash = data.hash;

		//console.log('challenge :',challenge);
		//console.log('hash :',hash);
		var cookie = j.getCookieString(URL_CHALLENGE);
		var jRes = {'challenge': challenge, 'hash': hash, 'cookie': cookie};
		console.log(jRes);
		res.send(jRes);
	});
});

function getChallenge (challenge){var s="",i;for(i in challenge){s+=""+eval(challenge[i])}return s}

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});