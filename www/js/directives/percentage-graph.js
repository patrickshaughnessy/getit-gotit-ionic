angular.module('app')
.directive('percentageGraph', function($window, $interval){

  var link = function(scope, elem, attrs){

    var width = elem[0].clientWidth;
    var height = $window.innerHeight*0.5;

    var margin = {
      left: width*0.1,
      right: width*0.1,
      top: height*0.1,
      bottom: height*0.15
    }

    var svg = d3.select(elem[0]).append('svg')
        .attr('width', width)
        .attr('height', height)

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`);
    svg.select('g').append('g')
        .attr('class', 'y axis');
    svg.select('g').append('g')
        .attr('class', 'yaxisLabel');
    svg.select('g').append('g')
        .attr('class', 'x axis');
    svg.select('g').append('g')
        .attr('class', 'xaxisLabel');
    svg.select('g').append('g')
        .attr('id', 'lineG');

    var update = function(){
      if (!scope.data){
        return;
      }

      width = $window.innerWidth*0.5;
      height = $window.innerHeight*0.5;

      margin = {
        left: width*0.1,
        right: width*0.2,
        top: height*0.1,
        bottom: height*0.15
      }

      svg.selectAll('path').remove();
      svg.select('.xaxisLabel').select('text').remove();
      svg.select('.yaxisLabel').select('text').remove();

      svg
          .attr('width', width)
          .attr('height', height)
        .select('g')
          .attr('transform', `translate(${margin.left}, 0)`)

      var percentages = angular.fromJson(scope.data).map(function(d, i){
        var coords = {
          x: d.time,
          y: d.percentage
        }
        return coords;
      });

      if (!percentages.length) return;

      var xMin = d3.min(percentages, function(d){ return d.x; })
      var xMax = d3.max(percentages, function(d){ return d.x; })

      var xScale = d3.time.scale()
          .domain([xMin, xMax])
          .range([0,  width - margin.right - margin.left]);

      var yScale = d3.scale.linear()
          .domain([0, 100])
          .range([height - margin.bottom - margin.top, 0])

      var lineFunction = d3.svg.line()
        .x(function(d) {
          return xScale(d.x);
        })
        .y(function(d) {
          return yScale(d.y);
        })
        .interpolate('basis');

      var xTickSize = xScale(percentages[1].x) - xScale(percentages[0].x);

      svg.select('#lineG')
        .append('path')
          .datum(percentages)
          .attr('transform', `translate(${margin.left}, ${margin.top})`)
          .attr('d', lineFunction)
          .attr('stroke', 'black')
          .attr('stroke-width', 2)
          .attr('fill', 'none')

      var xAxis = d3.svg.axis()
          .scale(xScale)
          .orient('bottom')
          .ticks(5);

      svg.select('.x.axis')
          .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
          .call(xAxis);

      svg.select('.xaxisLabel').append('text')
          .attr('transform', `translate(${(width/2) - margin.left}, ${height})`)
          .text('Time')

      var yAxis = d3.svg.axis()
          .scale(yScale)
          .orient('left')
          .ticks(5)

      svg.select('.y.axis')
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .call(yAxis)

      svg.select('.yaxisLabel').append('text')
          .attr('transform', `translate(${0}, ${(height/2)+margin.bottom+margin.top}) rotate(-90)`)
          .text('Comprehension %')

    }

    scope.$watch('data', update);
    angular.element($window).bind('resize', function(){
      update();
    });

  }

  return {
    template: '<div></div>',
    replace: true,
    restrict: 'EA',
    scope: {
      data: '@'
    },
    link: link
  }
})
