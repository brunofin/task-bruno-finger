(function(angular) {
  var app = angular.module('Manager', ['FileSystem']);

  app.service('CloudManager', ['FolderDAO', function(FolderDAO) {
    return {
      hello: function() {
        console.log('hello world complicated!');
      },

      getRootFolder: function() {
        var _success = null,
          _error = null;

        FolderDAO.list().then(function(response) {
          if (response.status === 200) {
            response.data.forEach(function(folder) {
              if (folder.path() === null) {
                _success(folder);
              }
            });

          } else {
            _error(response);
          }
        });

        return {
          success: function(promise) {
            _success = promise;
          },
          error: function(promise) {
            _error = promise
          }
        };
      }
    }
  }]);

  app.directive('cloudManager', ['CloudManager', function(CloudManager) {
    return {
      templateUrl: '/static/partials/manager/cloud-manager.tmpl.html',
      link: function($scope, el) {
        el.addClass('layout-column');
        el.addClass('layout-fill');
        el.addClass('flex');

        $scope.currentFolder = {};

        $scope.hello = function() {
          CloudManager.getRootFolder().success(function(root) {
            $scope.currentFolder = root;
          });
        };
      }
    };
  }]);
})(window.angular);

