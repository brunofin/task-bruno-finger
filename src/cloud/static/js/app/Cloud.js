/*
This is our application entry-point. It is similar to a Main.java
*/
(function(angular) {
  var app = angular.module('Cloud', ['ngMaterial', 'ngRoute', 'Manager']);

  /*
  Sets default XHR headers
  */
  app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/json';
  }]);

})(window.angular);

