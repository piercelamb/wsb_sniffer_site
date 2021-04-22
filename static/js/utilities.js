
    let utils = {}
    utils.analysis = utils.analysis || {};
    // Calculate a linear regression from the data

    // Takes 5 parameters:
    // (1) Your data
    // (2) The column of data plotted on your x-axis
    // (3) The column of data plotted on your y-axis
    // (4) The minimum value of your x-axis
    // (5) The minimum value of your y-axis

    // Returns an object with two points, where each point is an object with an x and y coordinate
    utils.analysis.calcLinear =
        function(data, x, y, minX, minY, maxX){
          /////////
          //SLOPE//
          /////////
          // Let n = the number of data points
          var n = data.length;

          // Get just the points
          var pts = [];
          data.forEach(function(d,i){
            var obj = {};
            obj.x = Math.round(new Date(d[x]).getTime());
            obj.y = d[y];
            obj.mult = obj.x*obj.y;
            pts.push(obj);
          });

          // Let a equal n times the summation of all x-values multiplied by their corresponding y-values
          // Let b equal the sum of all x-values times the sum of all y-values
          // Let c equal n times the sum of all squared x-values
          // Let d equal the squared sum of all x-values
          var sum = 0;
          var xSum = 0;
          var ySum = 0;
          var sumSq = 0;
          pts.forEach(function(pt){
            sum = sum + pt.mult;
            xSum = xSum + pt.x;
            ySum = ySum + pt.y;
            sumSq = sumSq + (pt.x * pt.x);
          });
          var a = sum * n;
          var b = xSum * ySum;
          var c = sumSq * n;
          var d = xSum * xSum;

          // Plug the values that you calculated for a, b, c, and d into the following equation to calculate the slope
          // slope = m = (a - b) / (c - d)
          var m = (a - b) / (c - d);

          /////////////
          //INTERCEPT//
          /////////////

          // Let e equal the sum of all y-values
          var e = ySum;

          // Let f equal the slope times the sum of all x-values
          var f = m * xSum;

          // Plug the values you have calculated for e and f into the following equation for the y-intercept
          // y-intercept = b = (e - f) / n
          var b = (e - f) / n;

                // Print the equation below the chart
                // document.getElementsByClassName("equation")[0].innerHTML = "y = " + m + "x + " + b;
                // document.getElementsByClassName("equation")[1].innerHTML = "x = ( y - " + b + " ) / " + m;

          // return an object of two points
          // each point is an object with an x and y coordinate
          return {
            ptA : {
              x: new Date(minX),
              y: m * minX + b
            },
            // ptB : {
            //   y: minY,
            //   x: new Date((minY - b) / m)
            // }
          ptB : {
              y: m * maxX + b,
              x: new Date(maxX)
            }
          }

        }