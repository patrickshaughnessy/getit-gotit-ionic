angular.module('app')
.controller("homeCtrl", function(currentAuth, Auth, $state, $rootScope, $scope, $firebaseObject, $firebaseArray, $timeout) {

  var userRef = new Firebase(`https://getitgotit.firebaseio.com/users/${currentAuth.uid}`);
  var user = $firebaseObject(userRef);
  user.$bindTo($scope, 'user').then(function(){
    // make sure user didn't use back button to leave
    $timeout(function(){
      if ($scope.user.teacher){
        $state.go('teacher-classroom', {classID: $scope.user.teacher});
      }
    }, 300)
  })

  var classroomsRef = new Firebase("https://getitgotit.firebaseio.com/classrooms");
  var classrooms = $firebaseObject(classroomsRef);
  classrooms.$bindTo($scope, 'classrooms');
  var classroomsIDsRef = new Firebase("https://getitgotit.firebaseio.com/classroomsIDs");
  var classroomsIDs = $firebaseObject(classroomsIDsRef);
  classroomsIDs.$bindTo($scope, 'classroomsIDs');

  var genClassID = function(){
    var id = (parseInt(Math.random()*1000000000, 10)).toString().replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
    if (!$scope.classroomsIDs){
      return id;
    }
    return $scope.classroomsIDs[id] || id.length !== 11 ? genClassID() : id;
  }

  $scope.startNewClass = function(){
    $scope.loading = true;
    if (!$scope.user || !$scope.classrooms) {
      $scope.loading = false;
      return;
    }

    if (!$scope.user.teacher){
      var id = genClassID();
      $scope.classroomsIDs[id] = {
        teacher: currentAuth.uid
      };
      $scope.classrooms[id] = {
        teacher: currentAuth.uid
      };
      $scope.user.teacher = id;
      $state.go('teacher-classroom', {classID: id});
    } else {
      $scope.loading = false;
    }

  }

  $scope.goToClass = function(){
    $scope.loading = true;
    // wait for firebase connection, return if not valid input
    if (!$scope.user || !$scope.classrooms || !$scope.classID) {
      $scope.loading = false;
      return;
    }

    var classID = $scope.classID.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');

    // if no class with that ID exists, show error message
    if (!$scope.classrooms[classID]){
      $scope.loading = false;
      return swal('Oops', 'No class exists with that ID. Did you type it correctly?', 'error');
    };

    // otherwise, log them into the class
    var studentsRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms/${classID}/students`);
    var students = $firebaseArray(studentsRef);
    students.$loaded().then(function(list){
      // set session points to 0 for student
      var student = {};
      angular.copy($scope.user, student);
      student.points = 0;
      student.classesData = null;
      student.id = $scope.user.$id;
      list.$add(student).then(function(ref){
        var key = ref.key();
        $scope.user.class = {
          id: classID,
          key: key
        };
        $state.go('student-classroom', {classID: classID});
      });
    })
  }

  $scope.rejoinClass = function(){
    $scope.loading = true;
    $state.go('student-classroom', {classID: $scope.user.class.id});
  }

  $scope.logout = function(){
    $scope.loading = true;
    Auth.$unauth();
    $state.go('splash');
  }

});
