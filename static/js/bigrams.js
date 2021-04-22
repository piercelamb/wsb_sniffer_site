$(document).ready(function() {
    var w = 960
    var h = 500
    // define function to parse time in years format
	var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

    // create scales x & y for X and Y axis and set their ranges

    var xPadding = 100;
    var yPadding = 120;
    var yLabelPadding = 0;
    var bottomTextPadding = 75;
    var barPadding = 5;
    var x = d3.scaleTime().range([0, w - xPadding]);
    var y = d3.scaleLinear().range([h - yPadding, 0]);



    // append svg element to the body of the page
    // set dimensions and position of the svg element
    var svg = d3.select(".bi-grams-chart")
                .append("svg")
                .attr("width", w)
                .attr("height", h);


    // Get the data
	var pathToCsv = "/static/data/bigrams.csv";		// path to csv
    d3.dsv(",", pathToCsv)
      .then(function (data) {
        var nested_data = d3.nest()
        .key(function(d) {return d.date})
        .entries(data);
         nested_data = nested_data.map(function(d) {
              return {date: new Date(parseTime(d.key)), comment_count: d.values[0].comment_count,
                values:   d.values.map(function(d) {
              return {counts: d.counts, word_1: d.word_1, word_2: d.word_2};})};});
      let day = 24 * 24 * 60
      /* Create bar plot using data from csv */

      // set the domains of X and Y scales based on data
      x.domain([d3.timeDay.offset(nested_data[0].date, -1), d3.timeDay.offset(nested_data[nested_data.length - 1].date,1)]);

      y.domain([0, d3.max(nested_data, function(d) {return d.comment_count;})]);

      // Add bars to svg - create new elements based on your data

     var plotgroup = svg.append("g")
                .attr("transform", "translate(80,20)");

      var tooltip = d3.tip()
          .attr('class', 'd3-tip')
          //.offset([-10, 0])
          .html(function(d) {
            return "<div class=\"row\">\n" +
                    "  <div class=\"column\">" +
                    "<p>( " + d[0].word_1 + " , " + d[0].word_2 + " )</p>" +
                   "<p>( " + d[1].word_1 + " , " + d[1].word_2 + " )</p>" +
                   "<p>( " + d[2].word_1 + " , " + d[2].word_2 + " )</p>" +
                   "<p>( " + d[3].word_1 + " , " + d[3].word_2 + " )</p>" +
                   "<p>( " + d[4].word_1 + " , " + d[4].word_2 + " )</p>" +
                   "<p>( " + d[5].word_1 + " , " + d[5].word_2 + " )</p>" +
                   "<p>( " + d[6].word_1 + " , " + d[6].word_2 + " )</p>" +
                   "<p>( " + d[7].word_1 + " , " + d[7].word_2 + " )</p>" +
                   "<p>( " + d[8].word_1 + " , " + d[8].word_2 + " )</p>" +
                   "<p>( " + d[9].word_1 + " , " + d[9].word_2 + " )</p>" +
                    "</div>" +
                    "  <div class=\"column\">" +
                    "<p>&nbsp&nbsp&nbsp&nbsp&nbsp</p>" +
                    "</div>" +
                    "  <div class=\"column\">" +

                   "<p>" + d[0].counts + "</p>" +
                   "<p>" + d[1].counts + "</p>" +
                   "<p>" + d[2].counts + "</p>" +
                   "<p>" + d[3].counts + "</p>" +
                   "<p>" + d[4].counts + "</p>" +
                   "<p>" + d[5].counts + "</p>" +
                   "<p>" + d[6].counts + "</p>" +
                   "<p>" + d[7].counts + "</p>" +
                   "<p>" + d[8].counts + "</p>" +
                   "<p>" + d[9].counts + "</p>" +

                    "</div>";

          });

      svg.call(tooltip);
      let barwidth = (x.range()[1] - x.range()[0]) / (nested_data.length) - barPadding
      plotgroup.selectAll("rect")
        .data(nested_data)
        .enter()
        .append("rect")
        .attr("x", function(d) {
            return x(d.date) - barwidth / 2;
        })
        .attr("y", function(d) {
            return y(d.comment_count);
        })
        .attr("width", barwidth)
        .attr("height", function(d) {
            return y.range()[0] - y (d.comment_count);
        })
        .attr("fill", "steelblue")
        .on('mouseover', function(d) {
                    var height = parseInt(d3.select(this).style("height"));
                    tooltip.show(d.values, this);
                    d3.select(this).attr("fill", "orange");
                    // tooltip.offset(function() {
                    //   console.log(height);
                    //   return [height / 4, 110];
                    // })
                    let x = d3.event.offsetX;
                    let y = d3.event.offsetY;
                    // tooltip.style('top', Math.max(y - 250, 30) + 'px');
                    // tooltip.style('left', x + 30 +'px');

                })
        .on('mouseout', function(d) {
          tooltip.hide();
          d3.select(this).attr("fill", "steelblue");
          });


      // Add the X Axis
      plotgroup.append("g")
            .call(d3.axisBottom()
            .scale(x)
            .ticks(10)
            .tickFormat(d3.timeFormat("%m/%d")))
            .attr("transform", "translate(0," + (h - yPadding) + ")")
            .attr("id", "x_axis");


      // Add the text label for X Axis
      plotgroup.append("text")
        .attr("x", (w - xPadding) / 2)
        .attr("y", h - bottomTextPadding)
        .text("Date")
        .attr("text-anchor", "middle")
        .attr("id", "x_axis_label");
      // Add the Y Axis
      plotgroup.append("g")
        .call(d3.axisLeft()
        .scale(y))
        .attr("id", "y_axis");

      // Add the text label for Y axis
      plotgroup.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", - (h - yPadding) / 2)
        .text("Number of Comments")
        .attr("id", "y_axis_label");

      plotgroup.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 0)
        .attr("x",(w - xPadding) / 2)
        .text("Daily Comment Counts and Bigrams")
        .attr("id", "title")
        .style("font-size", "20px");



    }).catch(function (error) {
      console.log(error);
    });
})


