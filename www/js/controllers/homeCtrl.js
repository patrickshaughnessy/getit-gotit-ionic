angular.module('app')
.controller("homeCtrl", function(currentAuth, Auth, $state, $rootScope, $scope, $firebaseObject, $firebaseArray, $timeout, $ionicLoading, $ionicPopup) {

  var userRef = new Firebase(`https://getitgotit.firebaseio.com/users/${currentAuth.uid}`);
  var user = $firebaseObject(userRef);
  user.$bindTo($scope, 'user');

  $scope.options = {
    loop: false,
    paginationClickable: true,
    paginationType: 'bullets',
    // effect: fade,
    // speed: 500,
  }
  $scope.data = {};
  $scope.$watch('data.slider', function(nv, ov) {
    $scope.slider = $scope.data.slider;
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
    $ionicLoading.show({template: 'Creating the class instance...'})
    if (!$scope.user || !$scope.classrooms) {
      return $ionicLoading.hide();
    }

    if (!$scope.user.teacher){
      var id = genClassID();
      $scope.classroomsIDs[id] = { teacher: currentAuth.uid };
      $scope.classrooms[id] = { teacher: currentAuth.uid };
      $scope.user.teacher = id;
      $ionicLoading.hide();
      $state.go('teacher-classroom', {classID: id});
    } else {
      $scope.showAlert({message: 'Something went wrong.'});
      return $ionicLoading.hide();
    }
  }

  $scope.studentClass = {};
  $scope.goToClass = function(){
    // wait for firebase connection, return if not valid input
    $ionicLoading.show({template: 'Joining class...'})
    if (!$scope.user || !$scope.classrooms || !$scope.studentClass.id) {
      return $ionicLoading.hide();
    }
    console.log($scope.studentClass);
    var classID = $scope.studentClass.id.toString().replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');

    // if no class with that ID exists, show error message
    if (!$scope.classrooms[classID]){
      $ionicLoading.hide();
      $scope.studentClass.id = '';
      return $scope.showAlert({message: 'No class exists with that ID. Did you type it correctly?'});
    };

    // otherwise, log them into the class
    var studentsRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms/${classID}/students`);
    var students = $firebaseArray(studentsRef);
    students.$loaded().then(function(list){
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
        $ionicLoading.hide();
        $state.go('student-classroom', {classID: classID});
      });
    })
  }

  $scope.teacherRejoinClass = function(classID){
    return `/teacher-classroom/${classID}`;
  }

  $scope.logout = function(){
    Auth.$unauth();
    $state.go('splash');
  }

  $scope.showAlert = function(error) {
    var alertPopup = $ionicPopup.alert({
      title: 'Oops!',
      template: error.message
    });

    alertPopup.then(function(res) {
      // res = true; popup closed
    });
  };


});
