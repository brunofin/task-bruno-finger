(function(angular) {
  var app = angular.module('FileSystem');

  app.factory('File', [function() {
    return function File() {
      var _id = null;
      var _name = '';
      var _path = null;

      this.id = function(id) {
        if (id !== undefined) {
          _id = id;
          return this;
        } else {
          return _id;
        }
      };

      this.name = function(name) {
        if (name !== undefined) {
          _name = name;
          return this;
        } else {
          return _name;
        }
      };

      this.path = function(path) {
        if (path !== undefined) {
          _path = path;
          return this;
        } else {
          return _path;
        }
      };
    };
  }]);

  app.factory('FileAPIDTO', ['File', function(File) {
    return {
      parse: function(data) {
        var file = new File();

        file.id(data.pk());
        file.name(data.name);
        file.path(data.path_id);

        return file;
      }
    }
  }]);

  app.service('FileDAO', ['API', 'FileAPIDTO', function(API, FileAPIDTO) {
    return {
      get: function(id) {
        return API.filesystem({
          method: 'GET',
          url: id,
          transformResponse: function(data, header, status) {
            if (status == 200) {
              return FileAPIDTO.parse(data);
            }
          }
        });
      },

      update: function(file) {
        return API.filesystem({
          method: 'POST',
          url: file.id(),
          data: file,
          transformResponse: function(data, header, status) {
            if (status == 200) {
              return FileAPIDTO.parse(data);
            }
          }
        });
      },

      remove: function(file) {
        return API.filesystem({
          method: 'DELETE',
          url: file.id()
        });
      }
    }
  }]);
})(window.angular);

