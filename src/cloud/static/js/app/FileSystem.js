(function(angular) {
  var app = angular.module('FileSystem', []);

  app.factory('Folder', [function() {
    return function Folder() {
      var _id = null;
      var _name = '';
      var _path = null;

      this.id = function(id) {
        if (id) {
          _id = id;
          return this;
        } else {
          return _id;
        }
      };

      this.name = function(name) {
        if (name) {
          _name = name;
          return this;
        } else {
          return _name;
        }
      };

      this.path = function(path) {
        if (path && path instanceof Folder) {
          _path = path;
          return this;
        } else {
          return _path;
        }
      };
    };
  }]);

  app.factory('FolderAPIDTO', ['Folder', function(Folder) {
    return {
      parse: function(data) {
        var folder = new Folder();

        folder.id(data.pk);
        folder.name(data.fields.name);
        folder.path(data.fields.path);

        return folder;
      }
    }
  }])

  app.service('FolderDAO', ['$http', 'FolderAPIDTO', function($http, FolderAPIDTO) {
    return {
      list: function() {
        return $http({
          method: 'GET',
          url: '/api/filestorage/folders',
          transformResponse: function(data, headers, status) {
            if (status === 200 && headers('content-type') == "application/json") {
              var aux = [];
              JSON.parse(data).forEach(function(folder) {
                aux.push(FolderAPIDTO.parse(folder));
              });

              return aux;
            } else {
              return data;
            }
          }
        });
      },

      get: function(id) {
        return $http({
          method: 'GET',
          url: '/api/filestorage/folders/' + id
        });
      },

      create: function(folder) {
        return $http({
          method: 'POST',
          url: '/api/filestorage/folders',
          data: folder
        });
      },

      update: function(folder) {
        return $http({
          method: 'PUT',
          url: '/api/filestorage/folders' + folder.id(),
          data: folder
        });
      },

      remove: function(folder) {
        return $http({
          method: 'DELETE',
          url: '/api/filestorage/folders' + folder.id()
        });
      }
    }
  }]);

  /*
  A file is nothing but a folder that can't hold items, but binary data instead
  In order for this to work, it shouldn't be allowed to assing a File as a File or Folder's path.
  */
  app.factory('File', ['Folder', function(Folder) {
    var File = function File() {
      var _size = 0;

      this.size = function(size) {
        if (size) {
          _size = size;
          return this;
        } else {
          return _size;
        }
      };
    };

    File.prototype = Folder;

    return File;
  }]);

  app.service('FileDAO', ['$http', function($http) {
    return {
      list: function() {
        return $http({
          method: 'GET',
          url: '/api/filestorage/files'
        });
      },

      get: function(id) {
        return $http({
          method: 'GET',
          url: '/api/filestorage/files/' + id
        });
      },

      create: function(file) {
        return $http({
          method: 'POST',
          url: '/api/filestorage/files',
          data: folder
        });
      },

      update: function(file) {
        return $http({
          method: 'PUT',
          url: '/api/filestorage/files' + file.id(),
          data: folder
        });
      },

      remove: function(file) {
        return $http({
          method: 'DELETE',
          url: '/api/filestorage/files' + file.id()
        });
      }
    }
  }]);
})(window.angular);

