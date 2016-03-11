/*
This is our application entry-point. It is similar to a Main.java
*/
(function(angular) {
  var app = angular.module('Cloud', ['ngMaterial', 'ngRoute', 'md.data.table', 'Manager']);

  /*
  Sets default XHR headers
  */
  app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/json';
  }]);

  app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('deep-orange')
      .accentPalette('pink');
  });

})(window.angular);

