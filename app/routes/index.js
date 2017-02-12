'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var PollHandler = require(path + '/app/controllers/pollHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	};

	function addAuthInfo(req, json) {
		
		var newJson = Object.assign({}, json, { isAuthenticated: req.isAuthenticated() } );
		
		if (req.isAuthenticated()) {
			Object.assign( newJson, { 
				displayName: req.user.github.displayName
			} );
		}
		
		return newJson;
		
	};

	var clickHandler = new ClickHandler();
	var pollHandler = new PollHandler();

	app.route('/')
	
		.get(function (req, res) {
			
			pollHandler.getPollDocs(function(json) {

				json = addAuthInfo(req, json);
				
				res.render('index', json);
			});
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

  // TODO: Remove this route.
	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.render('profile');
			// res.sendFile(path + '/public/profile.html');
		});


	app.route('/me/polls')
		.get(isLoggedIn, function (req, res) {
	
			pollHandler.getUserPollDocs(req.user._id, function(json) {
				Object.assign( json, { isAuthenticated: req.isAuthenticated() } );
				
				if (req.isAuthenticated()) {
					Object.assign( json, { 
						displayName: req.user.github.displayName
					} );
				}
				
				res.render('mypolls', json);
			});
		});


	app.route('/newpoll')
		.get(isLoggedIn, function (req, res) {
		  var json = addAuthInfo(req, {});
			res.render('newpoll', json);
		});

	app.route('/polls/:id')
		.get(function (req, res) {
			pollHandler.getPollJSON(req.params.id, function(json) {
				// TODO: Json could be empty.
				json = addAuthInfo(req, json);

				console.log(json);

				res.render('polldetail', json);
			})
		});


	app.route('/api/polls/:id/vote/:termid')
		.post(pollHandler.votePoll);

	app.route('/api/polls')
		.get(pollHandler.getPolls)
		.post(isLoggedIn, pollHandler.addPoll);

	app.route('/api/polls/:id')
		.get(pollHandler.getPoll)
		.delete(pollHandler.deletePoll);

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	// TODO: Remove this.
	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
		

};
