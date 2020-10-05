 //https://stackoverflow.com/questions/33122961/svg-getscreenctm-is-not-a-function
// call function for resizes the Chart
function makeResponsive() {

  // select the svg
  var svgArea = d3.select("body").select("svg");

  // clear the svg areas if not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }
  
  // define dimention of SVG areas
  var svgWidth = 980;
  var svgHeight = 600;
// define the chart's margin as an object
   var margin = {
    top: 20,
    right: 40,
    bottom: 90,
    left: 100
  };

  // Define dimensions of the chart area
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Select scatter from the html, append SVG area to it, and set the dimensions
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append an SVG group by transform method
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Parameters
    // Initialize variable
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  // Function for updating xScale upon click on Axis label
  function xScale(acsData, chosenXAxis) {
    // Create Scale functions for the chart as chosenXAxis
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(acsData, d => d[chosenXAxis]) * 0.8,
        d3.max(acsData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
    return xLinearScale;
  }

// Function for updating xScale upon click on Yxis label
  function yScale(acsData, chosenYAxis) {
   // Create Scale functions for the chart as chosenYAxis
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(acsData, d => d[chosenYAxis]) * 0.8,
        d3.max(acsData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
    return yLinearScale;
  }

  // function for xAxis click on Axis label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
  }

  // function for yAxis click on Axis label
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }

  // Function for circles group with a transition to new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }

  // Function for text group with a transition to new text
  function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]))
      .attr("text-anchor", "middle");

    return textGroup;
  }

  // Function for circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {

    if (chosenXAxis === "poverty") {
      var xLabel = "In Poverty (%)";
    }
    else if (chosenXAxis === "age") {
      var xLabel = "Age (Median)";
    }
    else {
      var xLabel = "Household Income (Median)";
    }
    if (chosenYAxis === "healthcare") {
      var yLabel = "Lacks Healthcare (%)";
    }
    else if (chosenYAxis === "obesity") {
      var yLabel = "Obese (%)";
    }
    else {
      var yLabel = "Smokes (%)";
    }

    // Initialize Tool Tip
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([90, 90])
      .html(function(d) {
        return (`States: ${d.abbr}<br>${xLabel}:  ${d[chosenXAxis]}<br>${yLabel}:  ${d[chosenYAxis]}`);
      });
    // Create Circles Tooltip in the Chart
    circlesGroup.call(toolTip);
    // Create Event Listeners to Display and Hide the Circles Tooltip
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout Event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
    // Create Text Tooltip in the Chart
    textGroup.call(toolTip);
    // Create Event Listeners to Display and Hide the Text Tooltip
    textGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout Event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
    return circlesGroup;
  }

  // Import Data from the data.csv File & Execute Everything Below
  d3.csv("assets/data/data.csv")
    .then(function(acsData) {

    // Format/Parse the Data (Cast as Numbers)
    acsData.forEach(function(data) {
      data.id =+data.id
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

    // Create xLinearScale & yLinearScale functions for the chart
    var xLinearScale = xScale(acsData, chosenXAxis);
    var yLinearScale = yScale(acsData, chosenYAxis);

    // Create Axis functions for the chart
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append xAxis to the chart
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append yAxis to the chart
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // create & append initial circles
    var circlesGroup = chartGroup.selectAll(".stateCircle")
      .data(acsData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("class", "stateCircle")
      .attr("r", 10)
      .attr("opacity", ".75");

    // Append Text to Circles
    var textGroup = chartGroup.selectAll(".stateText")
      .data(acsData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]*.98))
      .text(d => (d.abbr))
      .attr("class", "stateText")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("fill", "white");

    // Create Group for 3 xAxis Labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
    // Append xAxis
    var povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // Value for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // Value for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // Value for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // Create Group for 3 yAxis Labels
    var yLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(-25, ${height / 2})`);
    // Append yAxis
    var healthcareLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", 0)
      .attr("value", "healthcare")
      .attr("dy", "1em")
      .classed("axis-text", true)
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text") 
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", 0)
      .attr("value", "smokes")
      .attr("dy", "1em")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -70)
      .attr("x", 0)
      .attr("value", "obesity")
      .attr("dy", "1em")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Obese (%)");

    // updateToolTip Function
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

    // xAxis Labels Event Listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        // Get Value of Selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
          // Replaces chosenXAxis with Value
          chosenXAxis = value;
          // Updates xScale for New Data
          xLinearScale = xScale(acsData, chosenXAxis);
          // Updates xAxis with Transition
          xAxis = renderXAxes(xLinearScale, xAxis);
          // Updates Circles with New Values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          // Updates Text with New Values
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
          // Updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
          // changes classes to bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
    
      // yAxis Labels Event Listener
    yLabelsGroup.selectAll("text")
      .on("click", function() {
        // Get Value of Selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
          // Replaces chosenYAxis with Value
          chosenYAxis = value;
          // Updates yScale for New Data
          yLinearScale = yScale(acsData, chosenYAxis);
          // Updates yAxis with Transition
          yAxis = renderYAxes(yLinearScale, yAxis);
          // Updates Circles with New Values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          // Updates Text with New Values
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
          // Updates Tooltips with New Information
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
          // changes classes to the bold text
          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obesity") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  });
}
// Called makeResponsive function
makeResponsive();

// if browser is resized, makeResponsive() is Called
d3.select(window).on("resize", makeResponsive);