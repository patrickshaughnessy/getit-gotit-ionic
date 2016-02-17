angular.module('app')
.directive('timeData', function($window, $interval){

  var link = function(scope, elem, attrs){

    var width = $window.innerWidth;
    var height = $window.innerHeight - $window.innerHeight*0.8;

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
        .attr('transform', `translate(${margin.left}, 0)`)
      .append('defs').append('clipPath')
          .attr('id', 'clip')
        .append('rect')
          .attr('width',  width - margin.left)
          .attr('height', height);
    svg.select('g').append('g')
        .attr('class', 'y axis');
    svg.select('g').append('g')
        .attr('class', 'x axis')
        .attr('clip-path', 'url(#clip)');
    svg.select('g').append('g')
        .attr('clip-path', 'url(#clip)')
        .attr('id', 'lineG');

    var update = function(){

      width = $window.innerWidth;
      height = $window.innerHeight - $window.innerHeight*0.8;

      margin = {
        left: width*0.1,
        right: width*0.1,
        top: height*0.1,
        bottom: height*0.15
      }

      svg.selectAll('path').remove();
      // svg.selectAll('g').remove();

      svg
          .attr('width', width)
          .attr('height', height)
        .select('g')
          .attr('transform', `translate(${margin.left}, 0)`)
        .select('defs').select('clipPath')
          // .attr('id', 'clip')
        .select('rect')
          .attr('width',  width - margin.left - margin.right - margin.right*0.05)
          .attr('height', height);

      var data = angular.fromJson(scope.data).map(function(d, i){
        var coords = {
          x: d.time,
          y: d.percentage
        }
        return coords;
      });

      if (!data.length) return;

      var filler = Array(300).fill({x: 0, y: 0}).map(function(e, i){
        return {x: data[0].x - (1000*i), y:0}
      }).reverse();

      data = data.length < 300 ? filler.concat(data).slice(-300) : data.slice(-300);

      var xMin = d3.min(data, function(d){ return d.x; })
      var xMax = d3.max(data, function(d){ return d.x; })

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

      // var xTickSize = xScale(data[data.length-1].x) - xScale(data[data.length-2].x);
      var xTickSize = xScale(data[1].x) - xScale(data[0].x);
      // var xTickSize = d3.extent(data, function(d) { return xScale(d.x) });


      // var duration = data.length < (60*5) ? 1000 + (xTickSize) : 1000;

      var duration = 1000;

      svg.select('#lineG')
        .append('path')
          .datum(data)
          .attr('transform', `translate(${0}, ${margin.top})`)
          .attr('d', lineFunction)
          .attr('stroke', 'black')
          .attr('stroke-width', 2)
          .attr('fill', 'none')
        .transition()
          .duration(duration)
          .ease('linear')
          .attr('transform', `translate(${-xTickSize}, ${margin.top})`);

      var xAxis = d3.svg.axis()
          .scale(xScale)
          .orient('bottom')
          .ticks(5);

      svg.select('.x.axis')
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .transition()
          .duration(duration)
          .ease('linear')
        .call(xAxis)
          .attr("transform", `translate(${xTickSize}, ${height - margin.bottom})`)

      var yAxis = d3.svg.axis()
          .scale(yScale)
          .orient('left')
          .ticks(5)

      svg.select('.y.axis')
          .call(yAxis)
          .attr("transform", `translate(0, ${margin.top})`);

    }

    scope.$watch('data', update);
    angular.element($window).bind('resize', function(){
      update();
    });
  }

  return {
    template: '<div class="timeDataArea"></div>',
    replace: true,
    restrict: 'EA',
    scope: {
      data: '@'
    },
    link: link
  }
})
