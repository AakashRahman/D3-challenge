// @TODO: YOUR CODE HERE!
//declare a function for all
function makeResponsive() {
    // define dimention of SVG areas
    var svgWidth = 960;
    var svgHeight = 500;
    // define the chart's margin as an object
    var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left:100
    };
    // Define dimensions of the chart area
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;
    
    // Select scatter from the html, append SVG area to it, and set the dimensions
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    
        // Append a group to the SVG area 

    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    //Import Data from data.csv file
    d3.csv("assets/data/data.csv")
        .then(function(riskData){
    //print/see the riskData
    console.log(riskData);
    //Get data from data.csv file and turn strings into integers if needed
        //use for loop
        riskData.forEach(function(data) {
            data.age = +data.age;
            data.smokes = +data.smokes;
            data.healthcare = +data.healthcare;
            data.poverty = +data.poverty;
            data.abbr = data.abbr;
            data.income = +data.income;
        });
    //Create Linear scales for Xaxis and Yaxis
    //proverty vs healthcare
        var xLinearScale = d3.scaleLinear()
            .domain([8.5, d3.max(riskData, d => d.poverty)])
            .range([0, width]);
    
        var yLinearScale = d3.scaleLinear()
            .domain([3.5, d3.max(riskData, d => d.healthcare)])
            .range([height, 0]);
    
    
    //Create X axis and Yaxis
        var xAxis = d3.axisBottom(xLinearScale);
        var yAxis = d3.axisLeft(yLinearScale);
    
    //Append axis to the chartGroup
        chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
    
        chartGroup.append("g")
        .call(yAxis);
        
    //create circles for states
        var circlesGroup = chartGroup.selectAll("circle")
            .data(riskData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", 16)
            .attr("fill", "lightblue")
            .attr("opacity", ".6")
            .attr("stroke-width", "1")
            .attr("stroke", "black");
    
            chartGroup.select("g")
            .selectAll("circle")
            .data(riskData)
            .enter()
            .append("text")
            .text(d => d.abbr)
            .attr("x", d => xLinearScale(d.poverty))
            .attr("y", d => yLinearScale(d.healthcare))
            .attr("dy",-395)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "black");
         
            //console.log(riskData);
        //Append a div to the body to create tooltips, assign it a class                
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            //.offset([80, -60])
            .html(function(d)
                {
                    return `States: ${d.state} <br> Healthcare: ${d.healthcare} <br> Poverty: ${d.poverty}`;
                });
            circlesGroup.call(toolTip);   
 
//Add an onmouse event to make the tooltip visible
        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data,this)        
        })
// Add an onmouseout event to make the tooltip invisible
        .on("mouseout", function(data) {
        toolTip.hide(data);
     });
    // Add an onmouseout event to make the tooltip invisible

        //Make labels for the healthrisk graph
        chartGroup.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - 50)
          .attr("x", 0 -250)
          .attr("dy", "1em")
          .attr("class", "axisText")
          .text("Lacks Healthcare (%)");
    
        chartGroup.append("text")
          .attr("transform", `translate(${width / 2.5}, ${height + margin.top + 25})`)
          .attr("class", "axisText")
          .text("In Poverty (%)");
    
    
    
    });
    }
    
    makeResponsive();