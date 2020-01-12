
// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
var y = d3.scaleLinear()
    .range([height, 0]);

var colors = ["#b33040", "#d25c4d", "#f2b447", "#d9d574"];

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// get the data
d3.csv("data/MOCK_DATA_Fixed.csv").then(function(data) {

    // format the data
    data.forEach(function(d) {
        d.scion = +d.scion;
        d.maurauder = +d.maurauder;
        d.templar = +d.templar;
        d.zombie = +d.zombie;
    });

    // Scale the range of the data in the domains
    x.domain(data.map(function(d) { return d.league; }));
    y.domain([0, d3.max(data, function(d) { return d.scion+d.maurauder+d.zombie+ d[Object.keys(d)[4]]; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.league); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.scion); })
        .attr("height", function(d) { return height - y(d.scion); })
        .on("mouseover", function() { tooltip.style("display", null); })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function(d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d.scion);
        });

    svg.selectAll(".bar2")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar2")
        .attr("x", function(d) { return x(d.league); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.maurauder+d.scion);})
        .attr("height", function(d) { return height - y(d.maurauder); })
        .on("mouseover", function() { tooltip.style("display", null); })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function(d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d.maurauder);
        });

    svg.selectAll(".bar3")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar3")
        .attr("x", function(d) { return x(d.league); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.maurauder+d.scion+d.zombie);})
        .attr("height", function(d) { return height - y(d.zombie); })
        .on("mouseover", function() { tooltip.style("display", null); })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function(d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d.zombie);
        });

    svg.selectAll(".bar4")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar4")
        .attr("x", function(d) { return x(d.league); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.maurauder+d.scion+d.zombie+d.templar);})
        .attr("height", function(d) { return height - y(d.templar); })
        .on("mouseover", function() { tooltip.style("display", null); })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function(d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d.templar);
        });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));


    // Prep the tooltip bits, initial display is hidden
    var tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    tooltip.append("rect")
        .attr("width", 30)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.5);

    tooltip.append("text")
        .attr("x", 15)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold");

});