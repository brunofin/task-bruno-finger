(function(angular) {
  var app = angular.module('Manager', ['FileSystem']);

  /*
  implements the basic file operations using the DAO as a backend. this service sits between DAO and GUI.
  */
  app.service('CloudManager', ['FolderDAO', 'FileDAO', 'Folder', 'File', function(FolderDAO, FileDAO, Folder, File) {
    return {
      getRootFolder: function() {
        return FolderDAO.get();
      },

      switchToFolder: function(folder) {
        return FolderDAO.get(folder.id === undefined ? folder : folder.id());
      },

      getItemInfo: function(item) {
        if (item.type == 'file') {
          return FileDAO.get(item.id)
        } else if (item.type == 'folder') {
          return FolderDAO.get(item.id);
        }
      },

      deleteItems: function(items) {
        var _then = null;

        items.forEach(function(item) {
          if (item instanceof File) {
            FileDAO.remove(item).then(function(response) {
              if (_then) {
                _then(response);
              }
            });
          } else if (item instanceof Folder) {
            FolderDAO.remove(item).then(function(response) {
              if (_then) {
                _then(response);
              }
            });
          }
        });

        return {
          then: function(promise) {
            _then = promise;
          }
        }
      },

      renameItem: function(item, newName) {
        var oldName = item.name();
        item.name(newName);

        if (item instanceof File) {
          FileDAO.update(item).then(function(response) {
            if (_then) {
              _then(response, oldName);
            }
          });
        } else if (item instanceof Folder) {
          FolderDAO.update(item).then(function(response) {
            if (_then) {
              _then(response, oldName);
            }
          });
        }

        return {
          then: function(promise) {
            _then = promise;
          }
        }
      },

      createFolder: function(path, name) {
        var folder = new Folder();
        folder.name(name);
        folder.path(path.id());

        return FolderDAO.create(folder);
      }
    }
  }]);

  /*
  checks whether it should be dislayed a 'folder' or 'file' icon in the page and displays it
  */
  app.directive('cloudItemIcon', ['File', 'Folder', function(File, Folder) {
    return {
      template: '<md-icon md-svg-src="{{ icon }}"></md-icon>',
      scope: {
        item: '='
      },
      link: function($scope, el) {
        var icon_folder = '/img/icons/ic_folder_black_24px.svg',
          icon_file = '/img/icons/ic_insert_drive_file_black_24px.svg';

        if ($scope.item instanceof File) {
          $scope.icon = icon_file;
        } else if ($scope.item instanceof Folder) {
          $scope.icon = icon_folder;
        }
      }
    };
  }]);

  app.directive('cloudNameForm', ['CloudManager', function(CloudManager) {
    return {
      templateUrl: '/partials/manager/cloud-name-form.tmpl.html',
      scope: {
        item: '='
      },
      link: function($scope, el) {
        el.addClass('layout-row');
        el.addClass('layout-fill');

        $scope.newName = "";
        $scope.cancel = function() {
          $scope.item.editing = false;
        };

        $scope.save = function() {
          CloudManager.renameItem($scope.item, $scope.newName).then(function(response, oldName) {
            if (response.status !== 200) {
              $scope.item.name(oldName);
            } else {
              $scope.item.editing = false;
            }
          });
        };
      }
    }
  }]);

  app.directive('cloudNewFolderForm', ['$mdToast', 'CloudManager', function($mdToast, CloudManager) {
    return {
      templateUrl: '/partials/manager/cloud-name-form.tmpl.html',
      scope: {
        status: '=creating',
        currentFolder: '=',
        content: '='
      },
      link: function($scope, el) {
        el.addClass('layout-row');
        el.addClass('layout-fill');

        $scope.newName = "";

        $scope.cancel = function() {
          $scope.status.creating = false;
        };

        $scope.save = function() {
          CloudManager.createFolder($scope.currentFolder, $scope.newName).then(function(response) {
            if ($scope.currentFolder.id() === response.data.path()) {
                $mdToast.show(
                $mdToast.simple()
                  .textContent('Double click on a folder name to enter it')
                  .position('top left')
                  .hideDelay(3000)
              );
              $scope.content.push(response.data);
              $scope.status.creating = false;

            }
          });
        };
      }
    }
  }]);

  /*
  All of the front-end interactions regarding file and folder operations, those being delegated to the service above.
  */
  app.directive('cloudManager', ['$mdDialog', '$mdToast', 'CloudManager', function($mdDialog, $mdToast, CloudManager) {
    return {
      templateUrl: '/partials/manager/cloud-manager.tmpl.html',
      link: function($scope, el) {
        el.addClass('layout-column');
        el.addClass('layout-fill');
        el.addClass('flex');

        $mdToast.show(
        $mdToast.simple()
          .textContent('Reload the page to repopulate the grid with original data')
          .position('top left')
          .hideDelay(4000)
      );

        $scope.content = [];
        $scope.selectedItems = [];
        $scope.status = {
          creating: false
        }

        CloudManager.getRootFolder().then(function(response) {
          if (response.status === 200) {
            $scope.currentFolder = response.data;
          }
        });

        $scope.renameDisabled = function() {
          return $scope.selectedItems.length === 0 || $scope.content.some(function(item) {
            return item.editing;
          });
        }

        $scope.switchToFolder = function(folder) {
          try {
            CloudManager.switchToFolder(folder).then(function(response) {
              if (response.status === 200) {
                $scope.currentFolder = response.data;
              }
            });
          } catch (e) {}
        };

        $scope.delete = function($ev, itemList) {
          var confirm = $mdDialog.confirm()
            .title('Would you like to delete the selected file(s) and folder(s)?')
            .textContent('Really delete ' + $scope.selectedItems.length + ' item(s)?')
            .ariaLabel('Delete dialog')
            .targetEvent($ev)
            .ok('Yes')
            .cancel('No');
          $mdDialog.show(confirm).then(function() {
            CloudManager.deleteItems($scope.selectedItems).then(function(response) {
              if (response.status === 200) {
                // removed from database, now remove from the client view
                var localItem = $scope.content.find(function(item) {
                  return item.id() == response.data;
                });
                var index = $scope.content.indexOf(localItem);

                $scope.content.splice(index, 1);
                $scope.selectedItems.splice(0, $scope.selectedItems.length);
              }
            });
          });
        };

        $scope.rename = function($ev, items) {
          items.forEach(function(item) {
            item.editing = true;
          });
        };

        $scope.createFolder = function() {
          $scope.status.creating = true;
          // CloudManager.createFolder(path, name).then(function(response) {
          //   if ($scope.currentFolder.id() === response.data.path()) {
          //     $scope.content.push(response.data);
          //   }
          // });
        };

        $scope.$watch('currentFolder', function(newValue) {
          if (newValue !== undefined) {
            $scope.content.splice(0, $scope.content.length);
            $scope.selectedItems.splice(0, $scope.selectedItems.length);

            newValue.content_id.forEach(function(content) {
              CloudManager.getItemInfo(content).then(function(response) {
                if (response.status === 200) {
                  $scope.content.push(response.data);
                }
              });
            });
          }
        });

      }
    };
  }]);
})(window.angular);
