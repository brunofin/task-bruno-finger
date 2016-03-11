(function(angular) {
  var app = angular.module('FileSystem');

  app.factory('Folder', [function() {
    return function Folder() {
      var _id = null;
      var _name = '';
      var _path = null;
      this.content_id = [];

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

  app.factory('FolderAPIDTO', ['Folder', function(Folder) {
    return {
      parse: function(data) {
        var folder = new Folder();
        folder.id(data.pk());
        folder.name(data.name);
        folder.path(data.path_id);
        data.content.forEach(function(d) {
          folder.content_id.push(d);
        });

        return folder;
      }
    }
  }]);

  app.service('FolderDAO', ['API', 'FolderAPIDTO', function(API, FolderAPIDTO) {
    return {
      get: function(id) {
        return API.filesystem({
          method: 'GET',
          url: id,
          transformResponse: function(data, header, status) {
            if (status == 200) {
              return FolderAPIDTO.parse(data);
            }
          }
        });
      },

      create: function(folder) {
        return API.filesystem({
          method: 'PUT',
          data: folder,
          transformResponse: function(data, header, status) {
            if (status == 201) {
              return FolderAPIDTO.parse(data);
            }
          }
        });
      },

      update: function(folder) {
        return API.filesystem({
          method: 'POST',
          url: folder.id(),
          data: folder,
          transformResponse: function(data, header, status) {
            if (status == 200) {
              return FolderAPIDTO.parse(data);
            }
          }
        });
      },

      remove: function(folder) {
        return API.filesystem({
          method: 'DELETE',
          url: folder.id()
        });
      }
    }
  }]);
})(window.angular);

