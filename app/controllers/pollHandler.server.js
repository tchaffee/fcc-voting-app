'use strict';

var Polls = require('../models/polls.js');

function PollHandler () {
	var that = this;

	this.getUserPollDocs = function (userId, callback) {
		Polls
			.find({ creator: userId })
			.exec(function (err, result) {
				if (err) { throw err; }

				callback({ polls: result });
			});
	};


	this.getPollDocs = function (callback) {
		Polls
			.find({})
			.exec(function (err, result) {
				if (err) { throw err; }

				callback({ polls: result });
			});
	};

	this.getPolls = function (req, res) {
		that.getPollDocs(function (results) {
			res.json(results);
		})
	};

	this.getPollJSON = function(id, callback) {
		Polls
			.find({ _id: id })
			.exec(function (err, result) {
				if (err) { throw err; }
				if (result) {
				  callback(result[0]._doc);
				} else {
					// TODO: Find better way to handle empty document.
					callback({});
				}
			});
	};

	this.hasUserVoted = function(user, pollDoc) {
		
		  if (user.type === 'user') {
		  	
		  	if (pollDoc.voters.indexOf(user.id) > -1) {
					return true;
				}
				
				return false;
		  } 
		  
	    if (pollDoc.voters_ip.indexOf(user.IP) > -1) {
				return true;
	  	}
		  	
		  return false;
	};

	this.votePollModel = function(user, pollId, termid, newterm, callback) {
		
		// Get the poll and make sure the user hasn't already voted.
		Polls.findById(pollId, function (err, pollDoc) {
			var answer;
			
		  if (err) throw(err);

			if (that.hasUserVoted(user, pollDoc)) {
					callback({ error: 'User or IP already voted for this poll.'});
					return;
			}
		  
		  if (user.type === 'user') {
				pollDoc.voters.push(user.id);
		  } else {
				pollDoc.voters_ip.push(user.IP);
		  }
			
			if (termid == '-1') {
				pollDoc.answers.push({ term: newterm, votes: 1 });
			} else {
			  answer = pollDoc.answers.id(termid);
  			answer.votes++;
			}
			
			pollDoc.save(function (err, updatedPoll) {
        if (err) throw(err);
  			callback({ success: 'Voted for a poll.', answers: pollDoc.answers });
      });
			
		});
		
	};

	this.votePoll = function (req, res) {
	
		// Get the user or IP.

		var user = {};
		
		if(req.user) {
			user.type = 'user';
			user.id = req.user._id;
		} else {
			user.type = 'ip';
			user.IP = req.ip;
		}
		
		that.votePollModel(user, req.params.id, req.params.termid, req.body.customterm, function(result) {
			console.log('Voted for a poll term.');
		  res.send(result);
		})

	};

	this.getPoll = function (req, res) {
		that.getPollJSON(req.params.id, function(json) {
			res.json(json);
		});
	};

	this.deletePoll = function (req, res) {
		
		if ( ! req.user) {
			res.status(403).send('Must be authenticated to perform this action.');
			return;
		}
		
		Polls
			.findOne({ _id: req.params.id })
			.exec(function (err, poll) {

			  if (err) {
			  	res.status(403).send({
			  		error: 'Error trying to find poll.',
			  		errorMessage: err
			  	});
			  	return;
			  }
				
				if (String(poll.creator) !== String(req.user._id)) {
					res.status(403).send({error: 'Only poll owner is allowed to perform this action.'});
					return;
				}

				poll.remove(function (err) {
					if (err) throw(err);
					res.status(204).send({success: 'Poll deleted.'});
				});

			});
	};

	this.addPoll = function (req, res) {
		
		var lines = req.body.options.replace(/\r\n/g,'\n').split('\n');
		
		var poll = new Polls();

		var answers = lines.map(function(el) {
			return { term: el, votes: 0 };
		});
		
		poll.creator = req.user._id;
		poll.title = req.body.title;
		poll.answers = answers;
		poll.voters = [];

		poll.save(function (err, doc) {
			if (err) {
				throw err;
			}
			
			res.redirect('/polls/' + doc._id);
			
		});
	};

}

module.exports = PollHandler;
