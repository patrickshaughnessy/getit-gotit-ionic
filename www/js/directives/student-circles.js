angular.module('app')
.directive('studentCircles', function($window){

  var link = function(scope, elem, attrs){

    var width = $window.innerWidth;
    var height = $window.innerHeight - $window.innerHeight*0.2;

    height = height - height*0.2;

    var svg = d3.select(elem[0])
      .append('svg')
        .attr({width: width, height: height});
    svg.append('g');

    ////////////////////////////
    // Calculate All Greens   //
    ////////////////////////////

    var allGreenStudents = function(students){
      return students.every(function(student){
        return !student.helpee && !student.helper;
      });
    }

    var getAllGreenCoords = function(d, i, s){
      return {x: cxGreen(d, i, s), y: cyGreen(d, i, s)}
    }

    var cxGreen = function(d, i, s){
      var numRows = Math.ceil(s.length/5);
      var currentRow = Math.ceil((i+1)/5);
      var interval;
      if (s.length % 5 === 0 || currentRow !== numRows){
        interval = Math.round(width/6);
      } else {
        interval = Math.round(width/((s.length % 5) + 1));
      }
      return ((i%5)+1) * interval;
    }

    var cyGreen = function(d, i, s){
      var numRows = Math.ceil(s.length/5);
      var interval = Math.round(height/(numRows + 1));
      var currentRow = Math.ceil((i+1)/5);
      return currentRow * interval;
    }

    var crAllGreen = function(d, i, s){

      return width/20;
    }

    ////////////////////////////
    // Calculate Green Coords //
    ////////////////////////////

    var getGreenCoords = function(d, i, g){
      // split into left & right greens based on index
      return (i%2 === 0) ? {x: cxLeft(d, i, g), y: cyLeft(d, i, g)} : {x: cxRight(d, i, g), y: cyRight(d, i, g)};
    }

    var cxLeft = function(d, i, g){
      // total colums for greens on left;
      var columns = Math.ceil(g.length/5);

      // width of left area is width/3
      var interval = Math.round((width/3)/(columns + 1));

      // current column for circle
      var currentColumn = Math.ceil((i+1)/5);

      // location is the current column of circle in the left area
      return currentColumn * interval;
    }

    var cyLeft = function(d, i, g){
      // total colums for greens on left
      var columns = Math.ceil(g.length/5);

      // current column for circle
      var currentColumn = Math.ceil((i+1)/5);

      var interval;
      if (g.length % 5 === 0 || currentColumn !== columns){
        // 1) total greens on left is divisible by 5 or circle is in a row of 5
        interval = Math.round((height)/6);
      } else {
        // 2) circle is in a row with less than 5, space evenly
        interval = Math.round((height)/((g.length % 5) + 1));
      }

      // interval calculated based on index
      return (((i%5)+1) * interval);
    }

    var cxRight = function(d, i, g){
      // total colums for greens on right;
      var columns = Math.ceil(g.length/5);

      // width of right area is width/3
      var interval = Math.round((width/3)/(columns + 1));

      // current column for circle
      var currentColumn = Math.ceil((i+1)/5);

      // location is the current column of circle, offset by 2/3 width
      return (currentColumn * interval) + (2*width)/3;
    }

    var cyRight = function(d, i, g){
      // total colums for greens on right - same as left?
      var columns = Math.ceil(g.length/5);
      // current column for circle
      var currentColumn = Math.ceil((i+1)/5);

      var interval;
      if (g.length % 5 === 0 || currentColumn !== columns){
        // 1) total greens on right is divisible by 5 or circle is in a row of 5
        interval = Math.round((height)/6);
      } else {
        // 2) circle is in a row with less than 5, space evenly
        interval = Math.round((height)/((g.length % 5) + 1));
      }
      // interval calculated based on index
      return (((i%5)+1) * interval);
    }

    var crGreen = function(d, i, g){
      //
      return width > height ? width/20 : height/20;
    }


    //////////////////////////
    // Calculate Red Coords //
    //////////////////////////

    var getRedCoords = function(d, i, r){
      return {x: cxRed(d, i, r), y: cyRed(d, i, r)};
    }

    var cxRed = function(d, i, r){
      // reds will all be in the middle
      return width/2;
    }
    var cyRed = function(d, i, r){
      // scale based on how many reds there are
      var interval = height/(r.length+1);
      // return coordinate based on index, starting at 1
      return (i+1) * interval
    }
    var crRed = function(d, i, r){
      // fill middle section
      // var colWidth = width/3;
      // var colHeight = height;

      // console.log('crred',  width > height)
      // return width > height ? (width/(r.length+1))/2 : (height/(r.length+1))/2
      return ((width/3)/(r.length+1))/2;
    }


    ///////////////////////////
    // Calculate Blue Coords //
    ///////////////////////////

    var getBlueCoords = function(d, i, b, red){
      return {x: cxBlue(d, i, b, red), y: cyBlue(d, i, b, red)};
    }

    // if !red fixes error from helpee closing chat with blue inside
    var cxBlue = function(d, i, b, red){
      if (!red) return 0;
      return red.coords.x + (red.radius);
    }
    var cyBlue = function(d, i, b, red){
      if (!red) return 0;
      return red.coords.y
    }
    var crBlue = function(d, i, b, red){
      if (!red) return 0;
      // blue is 1/3 the size of red
      return red.radius - (2*red.radius/3);
    }

    var percentageColor = function(percent, students){
      var gradient = students.length ? (100 - percent)*0.01 : 0;
      if (gradient == 0){
        return {
          'background': `linear-gradient(
            to bottom,
            rgba(4, 83, 45, 0.7),
            rgba(4, 83, 45, 0.1),
            rgba(4, 83, 45, 0.7)
          `}
      }
      return {
        'background': `linear-gradient(
          to bottom,
          rgba(172, 20, 26, ${gradient}),
          rgba(255, 255, 255, 1),
          rgba(172, 20, 26, ${gradient})
        `}
    }


    var update = function(){

      width = $window.innerWidth;
      height = $window.innerHeight - $window.innerHeight*0.2;

      var students = angular.fromJson(scope.students);

      if (allGreenStudents(students)){
        // all green students = return evenly distributed
        students = students.map(function(d, i, s){
          d.color = 'green';
          d.coords = getAllGreenCoords(d, i, s);
          d.radius = crAllGreen(d, i, s);
          return d;
        });
      } else {
        // mix of reds, blues, greens
        // first separate all

        var greens = students
          .filter(function(s){
            return !s.helper && !s.helpee;
          }).map(function(d, i, g){
            d.color = 'green';
            d.coords = getGreenCoords(d, i, g);
            d.radius = crGreen(d, i, g)
            return d
          });

        var reds = students
          .filter(function(s){
            return s.helpee;
          })
          .map(function(d, i, r){
            d.color = 'red';
            d.coords = getRedCoords(d, i, r);
            d.radius = crRed(d, i, r);
            return d;
          });

        var blues = students
          .filter(function(s){
            return s.helper;
          }).map(function(d, i, b){
            // get coords of helping
            var chatID = d.helper.chatID;
            var red = reds.find(function(r){
              return r.helpee === chatID;
            });
            d.color = 'blue';
            d.coords = getBlueCoords(d, i, b, red);
            d.radius = crBlue(d, i, b, red);
            return d;
          });

        // concat to array of students;
        students = greens.concat(reds, blues);
      }

      if (!students){
        return;
      }

      var percentage = +scope.percentage.slice(0, -1);

      // $('.studentCirclesArea').css(percentageColor(percentage, students));

      svg
        .attr({width: width, height: height})


      var circle = svg.select('g').selectAll('circle')
          .data(students);

      circle.enter().append('circle')
          .attr("r", 0)
        .transition()
          .attr("cy", function(d, i){ return d.coords.y })
          .attr("cx", function(d, i) { return d.coords.x })
          .attr("r", function(d, i) { return d.radius })
          .style('fill', function(d) { return d.color })

      circle
          .attr("r", 0)
        .transition()
          .attr("cy", function(d, i){ return d.coords.y })
          .attr("cx", function(d, i) { return d.coords.x })
          .attr("r", function(d, i) { return d.radius })
          .style('fill', function(d) { return d.color });

      circle.exit()
        .transition()
          .attr('r', 0)
          .remove();

      var defs = svg.selectAll('defs')
          .data(students);
      defs.enter().append('clipPath')
          .attr('id', function(d, i) { return `student${i}`})
        .append('circle')
          .attr("r", 0)
        .transition()
          .attr("cy", function(d, i){ return d.coords.y })
          .attr("cx", function(d, i) { return d.coords.x })
          .attr("r", function(d, i) { return d.radius/2 });

      defs
          .attr('id', function(d, i) { return `student${i}`})
        .append('circle')
          .attr("r", 0)
        .transition()
          .attr("cy", function(d, i){ return d.coords.y })
          .attr("cx", function(d, i) { return d.coords.x })
          .attr("r", function(d, i) { return d.radius/2 });

      defs.exit()
        .transition()
          .attr('r', 0)
          .remove();


      var images = svg.selectAll('image')
          .data(students);
      images.enter().append('svg:image')
          .attr('width', 0)
          .attr('height', 0)
        .transition()
          .attr("x", function(d, i) { return d.coords.x - d.radius })
          .attr("y", function(d, i){ return d.coords.y - d.radius })
          .attr("width", function(d, i) { return d.radius*2 })
          .attr("height", function(d, i) { return d.radius*2 })
          .attr('xlink:href', function(d, i) { return d.avatar })
          .attr('clip-path', function(d, i) { return `url('#student${i}')` });

      images
          .attr('width', 0)
          .attr('height', 0)
        .transition()
          .attr("x", function(d, i) { return d.coords.x - d.radius })
          .attr("y", function(d, i){ return d.coords.y - d.radius })
          .attr("width", function(d, i) { return d.radius*2 })
          .attr("height", function(d, i) { return d.radius*2 })
          .attr('xlink:href', function(d, i) { return d.avatar })
          .attr('clip-path', function(d, i) { return `url('#student${i}')` });

      images.exit()
        .transition()
          .attr('width', 0)
          .attr('height', 0)
          .remove();

      var names = svg.selectAll('text')
          .data(students);

      names.enter().append('text')
          .text('')
        .transition()
          .attr("x", function(d, i) { return d.coords.x - d.radius })
          .attr("y", function(d, i) { return d.coords.y + d.radius + 25 })
          .text(function(d, i) { return `${d.name} - ${d.points} points` });

      names
          .text('')
        .transition()
          .attr("x", function(d, i) { return d.coords.x - d.radius })
          .attr("y", function(d, i) { return d.coords.y + d.radius + 25 })
          .text(function(d, i) { return `${d.name} - ${d.points} points` });

      names.exit()
        .transition()
          .text('')
          .remove();

    }

    scope.$watch('students', update);
    angular.element($window).bind('resize', function(){
      update();
    });

  }

  return {
    template: '<div class="studentCircles"></div>',
    replace: true,
    restrict: 'EA',
    scope: {
      students: '@',
      percentage: '@'
    },
    link: link
  }
})
