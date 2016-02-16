angular.module('app')
.controller("profileCtrl", function(currentAuth, Auth, $state, $rootScope, $scope, $firebaseObject, $firebaseArray, $timeout) {

  var userRef = new Firebase(`https://getitgotit.firebaseio.com/users/${currentAuth.uid}`);
  var user = $firebaseObject(userRef);
  user.$bindTo($scope, 'user')

  $scope.changeAvatar = function(newAvatar){
    $scope.user.avatar = 'data:image/jpeg;base64,' + newAvatar.base64
  }

  $scope.logout = function(){
    Auth.$unauth();
    $state.go('splash');
  }

});
