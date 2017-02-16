'use strict';

var appUrl = window.location.origin;
var ajaxFunctions = {
   ready: function ready (fn) {
      if (typeof fn !== 'function') {
         return;
      }

      if (document.readyState === 'complete') {
         return fn();
      }

      document.addEventListener('DOMContentLoaded', fn, false);
   },
   ajaxRequest: function ajaxRequest (method, url, callback, params) {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function () {
         if (xmlhttp.readyState === 4 && (xmlhttp.status === 200 || xmlhttp.status === 204)) {
            callback(xmlhttp.response);
         }
      };

      xmlhttp.open(method, url, true);
      
      if (params) {
         xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      }
      
      xmlhttp.send(params);
   }
};