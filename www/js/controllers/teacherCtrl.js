angular.module('app')
.controller("teacherCtrl", function(Auth, currentAuth, $state, $scope, $firebaseObject, $firebaseArray, $timeout, $interval) {
  $scope.classID = $state.params.classID;

  var classDataRef = new Firebase(`https://getitgotit.firebaseio.com/users/${currentAuth.uid}/classesData/${$state.params.classID}`);
  var classData = $firebaseObject(classDataRef);
  classData.$bindTo($scope, 'classData').then(function(){
    if (!$scope.classData.time){
      $scope.classData.time = Date.now();
    }
  })

  var dataRef = new Firebase(`https://getitgotit.firebaseio.com/users/${currentAuth.uid}/classesData/${$state.params.classID}/data`);
  $scope.timeData = $firebaseArray(dataRef);

  var userRef = new Firebase(`https://getitgotit.firebaseio.com/users/${currentAuth.uid}`);
  var user = $firebaseObject(userRef);
  user.$bindTo($scope, 'user');

  var classroomRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms/${$state.params.classID}`);
  var classroom = $firebaseObject(classroomRef);
  classroom.$bindTo($scope, 'classroom');

  var studentsRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms/${$state.params.classID}/students`);
  $scope.students = $firebaseArray(studentsRef);

  var chatroomsRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms/${$state.params.classID}/chatrooms`);
  $scope.chatrooms = $firebaseArray(chatroomsRef);

  var teacherChatroomsRef = new Firebase(`https://getitgotit.firebaseio.com/users/${currentAuth.uid}/classesData/${$state.params.classID}/chatrooms`);
  $scope.teacherChatrooms = $firebaseArray(teacherChatroomsRef);

  // flash chatroom info to teacher chatrooms record on chatroom end
  chatroomsRef.on('child_removed', function(snap){
    $scope.teacherChatrooms.$add(snap.val());
  })

  var green;
  var updatePercentage = function(){
    if ($scope.students.length){
      $scope.percentage = Math.round((1 - ($scope.chatrooms.length / $scope.students.length))*100) + '%';
      if ($scope.percentage == '100%' && !green){
        // document.querySelectorAll("link[rel*='icon'")[0].setAttribute('href', "assets/greencircle.ico");
        green = true;
      } else if ($scope.percentage != '100%'){
        // document.querySelectorAll("link[rel*='icon'")[0].setAttribute('href', "assets/redcircle.ico");
        green = false;
      }
    } else {
      $scope.percentage = '...';
    }
  }

  var updatePoints = function(){
    $scope.points = $scope.students.reduce(function(a, student){
      return a + student.points;
    }, 0);
  }

  $scope.chatrooms.$watch(function(e){
    updatePercentage();
  });
  $scope.students.$watch(function(e){
    updatePercentage();
    updatePoints();
  });

  // track realtime classroom data over time
  $scope.isRecording;
  $scope.startRecording = function(){
    $scope.isRecording = $interval(function(){
      var info = {
        time: Date.now(),
        percentage: (!$scope.percentage || $scope.percentage == '...') ? 0 : +$scope.percentage.slice(0,-1),
        chatrooms: $scope.chatrooms || null,
        points: $scope.points || null,
        students: $scope.students || null
      };
      $scope.timeData.$add(info);
    }, 1000)
  }

  $scope.pauseRecording = function(){
    if (!$scope.isRecording) return;
    $interval.cancel($scope.isRecording);
    $scope.isRecording = undefined;
  }

  $scope.endClass = function(){
    if ($scope.isRecording){
      $interval.cancel($scope.isRecording);
    }
    $scope.user.teacher = false;

    classroom.$remove().then(function(){
      $state.go('home');
    });


    // document.querySelectorAll("link[rel*='icon'")[0].setAttribute('href', "assets/greencircle.ico");

  }



});
