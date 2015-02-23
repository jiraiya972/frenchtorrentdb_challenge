var express = require('express');
var request = require("request");
var bodyParser = require('body-parser');

var app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));

app.set('port', (process.env.PORT || 5000));

var j = request.jar();

URL_CHALLENGE = "http://www.frenchtorrentdb.com/?section=LOGIN&challenge=1";
URL_LOGIN_AJAX = "http://www.frenchtorrentdb.com/?section=LOGIN&ajax=1";
URL_SEARCH = "http://www.frenchtorrentdb.com/?section=TORRENTS&exact=1&name={:search}&submit=GO";
URL_DL_TORRENT = "http://www.frenchtorrentdb.com/?section=DOWNLOAD&id={:id}&hash={:hash}&uid={:uid}&get=1&js=1";

//challenge method do not modified
eval(function(b,c,a,e,d){for(d=function(a){return(a<c?"":d(a/c))+String.fromCharCode(a%c+161)};a--;)e[a]&&(b=b.replace(RegExp(d(a),"g"),e[a]));return b}("\u00a1 a='\u00a2';",2,2,["var","05f"]));

app.get('/log', function(req,res){
	console.log(req.query.msg);
	res.send('ok');
});

app.post('/evalchallenge', function(req, res) {
	//console.log(req.body);

	var body = eval(req.body);

	//console.log(body.challenge);
	var challenge = getChallenge(body.challenge);
	console.log(challenge);
	res.send({challenge:challenge});
});

app.get('/challenge', function(req, res) {

	request.get({url: URL_CHALLENGE, jar: j},function(e,r,b){
		//error
		if(e) throw e;

		var data = JSON.parse(b);
		challenge = getChallenge(data.challenge);
		hash = data.hash;

		//console.log('challenge :',challenge);
		//console.log('hash :',hash);
		
		var cookieFullS = j.getCookieString(URL_CHALLENGE);
		//Set-Cookie:WebsiteID=0aulq5enc08mca3d7jvu693p21; expires=Fri, 27-Feb-2015 07:33:53 GMT; path=/; domain=frenchtorrentdb.com
		console.log(cookieFullS);
		
		cookieS = cookieFullS.split('=')[1];
		
		var jRes = {'challenge': challenge, 'hash': hash, 'cookie': cookieFullS};
		console.log(jRes);
		res.cookie('WebsiteID',cookieS,{domain: 'frenchtorrentdb.com', path:'/', expires : new Date(Date.now() + 3600000*24*30), httpOnly : true});
		//res.append('Set-Cookie:WebsiteID='+cookieS+'; expires=Fri, 27-Feb-2015 07:33:53 GMT; path=/; domain=frenchtorrentdb.com; HttpOnly');
		res.send(jRes);
	});
});

app.all('/login', function(req, res) {

	j = request.jar();
	var username = req.query.username;
	var password = req.query.password;

	console.log('username',username,'password',password);
	//error
	if(!username || !password){
		res.send({success: false, message : 'username and password required'});
		throw new Error('username required');
	}

	var challenge = '';
	var hash = '';

	request.get(URL_CHALLENGE,{jar: j},function(e,r,b){
		//error
		if(e) throw e;

		var data = JSON.parse(b);
		challenge = getChallenge(data.challenge);
		hash = data.hash;

		console.log('challenge :',challenge);
		console.log('hash :',hash);

		request.post(
			URL_LOGIN_AJAX,
			{
				form: { username: username,
					password: password,
					secure_login: challenge,
					hash: hash },
				jar: j
			}).pipe(res);
	});
});

app.get('/search', function(req, res) {

	var url_search_name = URL_SEARCH.replace('{:search}',req.query.q);
	console.log('search : ',req.query.q);
	request.get({url: url_search_name, jar: j}).pipe(res);
});

app.get('/proxy', function(req, res) {
	
	var newUrl = URL_DL_TORRENT.replace('{:id}',req.query.id).replace('{:hash}',req.query.hash).replace('{:uid}',req.query.uid);

	console.log('id :',req.query.id);
	console.log('hash :',req.query.hash);
	console.log('uid :',req.query.uid);	
	console.log(newUrl);
	req.pipe(request.get(newUrl,{jar: j})).pipe(res);
});


function getChallenge (challenge){var s="",i;for(i in challenge){s+=""+eval(challenge[i])}return s}

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'));
});

