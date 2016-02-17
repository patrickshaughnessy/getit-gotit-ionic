angular.module('app')
.factory("Auth", ["$firebaseAuth", function($firebaseAuth) {
    var ref = new Firebase("https://getitgotit.firebaseio.com/");
    return $firebaseAuth(ref);
  }
]);
