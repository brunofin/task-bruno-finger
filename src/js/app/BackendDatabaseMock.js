(function(angular) {
  var app = angular.module('BackendAPIMock', []);

  app.service('API', ['$rootScope', function($rootScope) {
    var database = [];

    function FileModelMock(name, pathId) {
      this.pk = function() {
        return database.indexOf(this);
      };
      this.name = name === undefined ? "" : name;
      this.path_id = pathId == undefined ? null : pathId;

    }

    function FolderModelMock(name, pathId) {
      this.pk = function() {
        return database.indexOf(this);
      };
      this.name = name === undefined ? "" : name;
      this.path_id = pathId == undefined ? null : pathId;
      this.content = [];
    };

    // mocks an http-like promise-response
    function Response(transform, status, data) {
      var _status = status || 0;
      var _data = data || null;

      if (_data) {
        if (_data.length) {
          _data.forEach(function(d) {
            d = transform(d, null, _status);
          })
        } else {
          _data = transform(_data, null, _status);
        }
      }

      this.then = function(fn) {
        setTimeout(function() {
          $rootScope.$apply(function() {
            fn({
              status: _status,
              data: _data
            });
          });
        }, 100);
      }
    };

    database.push(new FolderModelMock('root', null));
    database.push(new FileModelMock('Sample.txt', 0));
    database.push(new FileModelMock('Other.doc', 0));
    database.push(new FileModelMock('Third.jpg', 0));
    database.push(new FileModelMock('Fourth.js', 0));

    return {
      /* mocks the $http service behaviour. request.url is always the id. */
      filesystem: function(request) {
        console.log('api: ', request.method, request.url, request.body);

        if (!request.transformResponse) {
          request.transformResponse = function(data) {
            return data
          }
        }

        var t = request.transformResponse;

        if (request.method === 'GET') { // recover data
          if (request.url === undefined) {
            request.url = 0;
          }
            try {
              var item = database[request.url];

              if (item instanceof FolderModelMock) {
                item.content = database.filter(function(data) {
                  return data.path_id === item.pk();
                }).map(function(data) {
                  return {
                    id: data.pk(),
                    type: data instanceof FolderModelMock ? 'folder' : 'file'
                  };
                });
              }
              return new Response(t, 200, item);
            } catch (e) {
              return new Response(t, 404);
            }
        } else if (request.method === 'PUT') { // create data
          if (request.data) {
            var fm = new FolderModelMock(request.data.name(), request.data.path());
            database.push(fm);

            database[request.data.path()].content.push(fm.pk());

            $rootScope.$broadcast('itemCreated', fm.pk());
            return new Response(t, 201, fm);
          }

        } else if (request.method === 'POST') { // update data
          if (request.url !== undefined && request.data !== undefined) {
            database[request.url].name = request.data.name();
            database[request.url].path_id = request.data.path();
            return new Response(t, 200, database[request.url]);
          } else {
            // raise error
          }
        } else if (request.method === 'DELETE') { // delete data
          // do not delete database[url], rather assing null: database[url] = null;
          if (request.url !== undefined) {
            database[request.url] = null;
            return new Response(t, 200, request.url);
          }
        } else {
          // raise error
        }
      }
    }

  }]);
})(window.angular);
