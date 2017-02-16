'use strict';

(function () {

   var pollContainer = document.querySelector('#poll-container');
   var apiUrl = appUrl + '/api/polls';

   function updatePolls (data) {
      var polls = JSON.parse(data);
      
      console.log(polls);
      
      polls.forEach(function(el){
         var innerDiv = document.createElement('div');
         innerDiv.className = 'poll-item';
         innerDiv.innerHTML = el.title;
         pollContainer.appendChild(innerDiv);
      });
   }


//   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, updatePolls));

})();
