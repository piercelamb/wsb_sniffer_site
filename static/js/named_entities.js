$(document).ready(function(){
    //Chart setup
    var width = 1000;
    var height = 600;
    var barPadding = 25;
    var margin = 80;

    //Create the ranges
    var x_scale = d3.scaleBand().range([margin, width - margin]).padding(0.1); //band good for categorical names
    var y_scale = d3.scaleLinear().range([height-margin, margin]);
    //Create the axes
    var x_axis = d3.axisBottom().scale(x_scale).ticks(10);
    var y_axis = d3.axisLeft().scale(y_scale).ticks(10);

    d3.dsv(",", "/static/data/top_10_named_entities.csv", function(d){
        return {
            entity:d['entity'],
            count:parseInt(d['count'])
        };

    }).then(function(entities_data){

    //Create the domains
    x_scale.domain(
        entities_data.map(function(pair){
            return pair['entity'];
        })
    );

    y_scale.domain(
        d3.extent(
            entities_data.map(function(pair){
                return pair['count'];
            })
        )
    );

    //append the chart
    var svg = d3.select('.named-entities-chart')
        .append('svg')
        .attr("width", width)
        .attr("height", height);

    //append the bars
    svg.selectAll("rect")
        .data(entities_data)
        .enter()
        .append("rect")
        .attr("y", function(d){
            return y_scale(d['count'])
        })
        .attr("height", function(d){
            return height - margin - y_scale(d['count'])
        })
        .attr("x", function(d){
            return x_scale(d['entity'])
        })
        .attr("width", width / entities_data.length - barPadding)
        .attr("fill", "pink")

    //Add X axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0,"+(height - margin)+")")
        .call(x_axis)

    //Add Y axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+margin+", 0)")
        .call(y_axis)

      // Add the text label for X Axis
      svg.append("text")
          .attr('y', height - 30)
          .attr('x', width / 2 - 50)
          .text("Named Entity")

      // Add the text label for Y axis
      svg.append("text")
          .style("text-anchor", "middle")
          .attr("dy", "1em")
          .attr("transform", "rotate(-90)")
          .attr("x", 0 - (height / 2))
          .text("Mentions");

      // //title
      // svg.append("text")
      //     .text("Top 10 Named Entities")
      //     .attr("x", width / 2)
      //     .attr("y", 50)
      //     .attr("class", "chart-header")
    })
})