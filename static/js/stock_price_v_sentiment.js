$(document).ready(function(){

    utils.analysis = utils.analysis || {};

    var width = 1000;
    var height = 600;
    var barPadding = 25;
    var margin = 80;

    //Create the ranges
    var x_scale = d3.scaleTime().range([margin, width - margin])
    var y_scale = d3.scaleLinear().range([height-margin, margin]);
    var sent_scale = d3.scaleLinear().range([height-margin, margin]);

    //create timestamp parsers
    var timeFormat = "%Y-%m-%d %H:%M:%S";
    var tickFormat = "%Y-%m-%d";
    var parseDate = d3.timeParse(timeFormat)

    //Create the axes
    var y_axis = d3.axisLeft().scale(y_scale).ticks(10);
    var sent_axis = d3.axisRight(sent_scale).ticks(10);

    var stock_sentiment_data = d3.dsv(",", '/static/data/sentiment_price_vs_time_rolling.csv', function(d){

        return {
            datetime:d['time'],
            price:parseFloat(d['open']),
            sentiment:parseFloat(d['rolling_average'])
        };

    })

    Promise.all([
        stock_sentiment_data
    ]).then (
        result => ready(null, result[0])
    )

    function ready(error, data){
        //Discover how many distinct days in the dataset
        var distinct_days = Array();
        var stored_day = [0, 0];
        for(var j = 0; j < data.length; j++){
            var date_obj = new Date(data[j]['datetime'])
            var date_pair = [date_obj.getMonth(), date_obj.getDate(), date_obj];
            if(stored_day[0] === date_pair[0] && stored_day[1] !== date_pair[1]){
                stored_day = date_pair
                distinct_days.push(date_pair)
            } else if (stored_day[0] !== date_pair[0]){
                stored_day = date_pair
                distinct_days.push(date_pair)
            }
        }
        //Discover how we can evenly divide the days
        var factors_of_time_period = Array();
        var distinct_days_count = distinct_days.length
        for(var k = 2; k <= distinct_days_count; k++){
            if(distinct_days_count % k === 0){
                factors_of_time_period.push(k)
            }
        }

        //Create the day split dropdown
        var day_split = document.getElementById('day_split')
        for(var x = 0; x < factors_of_time_period.length; x++){
            var option = document.createElement("option")
            option.text = factors_of_time_period[x]
            option.value = factors_of_time_period[x]
            day_split.add(option)
        }
        //Get the time period dropdown
        var time_period = document.getElementById('time_period')

        //When the day split changes, update the time period dropdown and chart accordingly
        day_split.addEventListener('change', function(e){
            $('#time_period').children().remove();
            var selected_split = e.target.value
            updateTimePeriod(time_period, distinct_days, parseInt(selected_split))
            createChart(data, time_period.value, parseInt(selected_split))
        })
        //When the time period changes, update the chart
        time_period.addEventListener('change', function(e){
            var selected_period = e.target.value
            createChart(data, selected_period, parseInt(day_split.value))
        })

        $('.trendline').on('click', function(){
            var trendlines = ['.price', '.sentiment'];
            $.each(trendlines, function(i, className){
                if($(className).hasClass('hide')){
                    $(className).removeClass('hide');
                } else {
                    $(className).addClass('hide')
                }
            })

        })
        //On initial load, update the time period and chart
        updateTimePeriod(time_period, distinct_days, parseInt(day_split.value))
        createChart(data, time_period.value, parseInt(day_split.value))
    }

    //Updates the time period dropdown according to the selected day split
    function updateTimePeriod(select, distinct_days, selected_split){
        //Get the smallest factor other than 1
        //append weeks to the dropdown
        for(var i = 0; i < distinct_days.length; i += selected_split ){
            var first_date_obj = distinct_days[i][2]
            var first_day_number = distinct_days[i][1]
            var first_month_name = first_date_obj.toLocaleString('default', {month: 'short'})
            //Get the increment. This ternary stops the increment from going passed the end of the loop
            var increment = i + selected_split === distinct_days.length ? i + selected_split-1 : i+selected_split
            var second_date_obj = distinct_days[increment][2]
            var second_day_number = distinct_days[increment][1]
            var second_month_name = second_date_obj.toLocaleString('default', {month: 'short'})
            var option = document.createElement("option")
            option.text = first_month_name +' '+first_day_number+ ' - '+second_month_name+ ' '+second_day_number
            option.value = first_date_obj.toString()+ '|' +second_date_obj.toString()
            select.add(option)
        }
    }

    function createChart(data, select_value, day_increment) {
        var dates = select_value.split("|")

        var date_filtered = data.filter(obj => {
            return Date.parse(obj['datetime']) >= Date.parse(dates[0]) &&
                Date.parse(obj['datetime']) <= Date.parse(dates[1])
        });
        //day_increment = day_increment > 8 ? 8 : day_increment;
        var x_axis = d3.axisBottom().scale(x_scale).tickFormat(d3.timeFormat(tickFormat)).ticks(day_increment);

        x_scale.domain(
            d3.extent(
                date_filtered.map(function(item){
                    return parseDate(item['datetime'])
                })
            )
        )

        y_scale.domain(
            d3.extent(
                date_filtered.map(function(item){
                    return item['price']
                })
            )
        )

        sent_scale.domain(
            d3.extent(
                date_filtered.map(function(item){
                    return item['sentiment']
                })
            )
        )


        var price_regression = utils.analysis.calcLinear(
            date_filtered,
            "datetime",
            "price",
            d3.min(date_filtered, function(d){
                var date_obj = new Date(d['datetime'])
                return Math.round(date_obj.getTime())
            }),
            d3.min(date_filtered, function(d){return d['price']}),
            d3.max(date_filtered, function(d){
                var date_obj = new Date(d['datetime'])
                return Math.round(date_obj.getTime())
            }),
        )

        var sent_regression = utils.analysis.calcLinear(
            date_filtered,
            "datetime",
            "sentiment",
            d3.min(date_filtered, function(d){
                var date_obj = new Date(d['datetime'])
                return Math.round(date_obj.getTime())
                //return parseDate(d['datetime'])
            }),
            d3.min(date_filtered, function(d){return d['sentiment']}),
            d3.max(date_filtered, function(d){
                var date_obj = new Date(d['datetime'])
                return Math.round(date_obj.getTime())
            }),
        )

        //Remove existing chart
        var container = $('.dropdown-container')
        container.siblings().remove()
        //append the chart
        var svg = d3.select('.stock-price-sentiment')
            .append('svg')
            .attr("width", width)
            .attr("height", height);

        var price_line = d3.line()
            .x(function(d){
                return x_scale(parseDate(d['datetime']));
            })
            .y(function(d){return y_scale(d['price'])})
            .curve(d3.curveNatural);

        var sent_line = d3.line()
            .x(function(d){
                return x_scale(parseDate(d['datetime']));
            })
            .y(function(d){
                return sent_scale(d['sentiment'])
            })
            .curve(d3.curveNatural)

        //append the price line
        svg.append("path")
            .datum(date_filtered)
            .attr("class","line")
            .attr("d", price_line);

        //append the sentiment line
        svg.append("path")
            .datum(date_filtered)
            .attr("class","line")
            .attr("d", sent_line)
            .style('stroke', 'red');

        // //append the price scatter plot
        // svg.selectAll("price_point")
	    //     .data(date_filtered)
	    //     .enter().append("circle")
	    //     .attr("class", "price-point")
	    //     .attr("r", 3)
	    //     .attr("cy", function(d){ return y_scale(d['price']); })
	    //     .attr("cx", function(d){ return x_scale(parseDate(d['datetime'])) })
        //
        // svg.selectAll("sentiment_point")
	    //     .data(date_filtered)
	    //     .enter().append("circle")
	    //     .attr("class", "sentiment-point")
	    //     .attr("r", 3)
	    //     .attr("cy", function(d){ return sent_scale(d['sentiment']); })
	    //     .attr("cx", function(d){ return x_scale(parseDate(d['datetime'])) })

        svg.append("line")
            .attr("class", "price hide")
            .attr("x1", x_scale(price_regression.ptA.x))
            .attr("y1", y_scale(price_regression.ptA.y))
            .attr("x2", x_scale(price_regression.ptB.x))
            .attr("y2", y_scale(price_regression.ptB.y))

        svg.append("line")
            .attr("class","sentiment hide")
            .attr("x1", x_scale(sent_regression.ptA.x))
            .attr("y1", sent_scale(sent_regression.ptA.y))
            .attr("x2", x_scale(sent_regression.ptB.x))
            .attr("y2", sent_scale(sent_regression.ptB.y))

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

        //Add sent axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate("+(width-margin)+", 0)")
            .call(sent_axis)

              // Add the text label for X Axis
      svg.append("text")
          .attr('y', height - 30)
          .attr('x', width / 2 - 50)
          .text("Days")

      // Add the text label for Y axis
      svg.append("text")
          .style("text-anchor", "middle")
          .attr("dy", "1em")
          .attr("transform", "rotate(-90)")
          .attr("x", 0 - (height / 2))
          .text("Stock Price");

      // Add the text label for sent axis
      svg.append("text")
          .style("text-anchor", "middle")
          .attr("dy", width)
          .attr("transform", "rotate(-90)")
          .attr("x", 0 - (height / 2))
          .text("Sentiment Value");

      //title
      // svg.append("text")
      //     .text("Comparison of Stock Price and Sentiment over time")
      //     .attr("x", width / 2)
      //     .attr("y", 50)
      //     .attr("class", "chart-header")
        var circlex = 775
        var circley = 30
        svg.append("circle").attr("cx",circlex).attr("cy",circley).attr("r", 6).style("fill", "steelblue")
        svg.append("circle").attr("cx",circlex).attr("cy", circley+30).attr("r", 6).style("fill", "red")
        svg.append("text").attr("x", circlex+10).attr("y", circley+5).text("Price").style("font-size", "15px")
        svg.append("text").attr("x", circlex+10).attr("y", circley+35).text("Sentiment").style("font-size", "15px")
    }
})