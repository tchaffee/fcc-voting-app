'use strict';

function handleVoteSelect (elem) {
  console.log(elem.value);
   if (elem.value == -1) {
      document.getElementById('custom-option-container').classList.remove('hidden');
   } else {
      document.getElementById('custom-option-container').classList.add('hidden');
   }
}

var pieData = [  { label: "1", value: 1 }];

/* Global d3pie */
var pie = new d3pie("pieChart", {
	"size": {
		"canvasWidth": 590,
		"pieInnerRadius": "58%",
		"pieOuterRadius": "77%"
	},
	"data": {
		"sortOrder": "label-desc",
		"content": pieData
	},
	"labels": {
		"outer": {
			"format": "label-percentage1",
			"hideWhenLessThanPercentage": 1,
			"pieDistance": 20
		},
		"inner": {
			"format": "none"
		},
		"mainLabel": {
			"fontSize": 11
		},
		"percentage": {
			"color": "#999999",
			"fontSize": 11,
			"decimalPlaces": 0
		},
		"value": {
			"color": "#cccc43",
			"fontSize": 11
		},
		"lines": {
			"enabled": true,
			"color": "#777777"
		},
		"truncation": {
			"enabled": true
		}
	},
	"effects": {
		"pullOutSegmentOnClick": {
			"effect": "linear",
			"speed": 400,
			"size": 8
		}
	},
	"misc": {
		"colors": {
			"segmentStroke": "#000000",
			"segments": ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928']
		}
	}
});

(function () {

  var alertAppend = document.querySelector('#vote-alert-append');
  
  var submitBtn = document.querySelector('#pdsubmit');
  var selected = document.querySelector('#voteformselect');
  var votesList = document.querySelector('#votes');
  var voteCustom= document.querySelector('#vote-custom-option');
  var tweetLink = document.querySelector('#tweet-button');
  var deleteBtn = document.querySelector('#pd-delete');


  function createAlert(type, message) {
    
    var alert = document.createElement('div');
    var button = document.createElement('button');
    var span = document.createElement('span');
    var content = document.createElement('p');
    
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = '&times';
    
    content.innerHTML = message;
    
    button.setAttribute('type', 'button');
    button.classList.add('close');
    button.setAttribute('data-dismiss', 'alert');
    button.setAttribute('aria-label', 'Close');
    
    button.appendChild(span);

    alert.classList.add('alert', 'alert-' + type, 'alert-dismissible');
    alert.appendChild(button);
    alert.appendChild(content);

    alertAppend.appendChild(alert);

  }
  
  /* global ajaxFunctions */
  /* global pollId */
  function updatePollChart (data) {

    var dataObject = JSON.parse(data); 

    pieData = [];
    
    dataObject.answers.forEach(function(el, index) {
      // pie data
      pieData.push(
 			{
 				label: el.term,
 				value: el.votes
 			});
    });
    
    pie.updateProp('data.content', pieData);      
      
   }
   
   // Load the tweet button href.
   ajaxFunctions.ready(function() {
      tweetLink.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(pollTitle) + '&url=' + encodeURIComponent(window.location.href);
   });
   
  // Update the existing chart with data.
   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', appUrl + '/api/polls/' + pollId, updatePollChart));

  // Handle user voting for option.
  /* global appUrl */

  submitBtn.addEventListener('click', function () {
    var apiUrl = appUrl + '/api/polls/' + submitBtn.getAttribute('data-poll-id') + '/vote/' + selected.value;
    var formData = null;

    if (selected.value === '-1') {
      formData = encodeURIComponent('customterm') + '=' + encodeURIComponent(voteCustom.value);
    }

    ajaxFunctions.ajaxRequest('POST', apiUrl, function (results) {

      var resultsObject = JSON.parse(results);
       
      if (resultsObject.error) {
        createAlert('danger', resultsObject.error);                    
      }
       
      // TODO: Move this to the more generic function used on page load?
      if (resultsObject.hasOwnProperty('answers')) {
        createAlert('success', 'You successfully voted for this poll.');
        updatePollChart(results);
      };
       
    }, formData);

   }, false);

  // Handle Delete Button.
  deleteBtn.addEventListener('click', function () {
    var apiUrl = appUrl + '/api/polls/' + deleteBtn.getAttribute('data-poll-id');

    ajaxFunctions.ajaxRequest('DELETE', apiUrl, function () {
      document.location.href = appUrl;
    });

   }, false);

})();

