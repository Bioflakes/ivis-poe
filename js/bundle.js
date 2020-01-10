(function(d3){

    const render = data => {
        const league = d => d.league;
    }

    // create svg element
    var svg = d3.select("#lineChart")
        .append("svg")
        .attr("width", 1000)
        .attr("height", 300)

    // Create the scale
    var x = d3.scaleBand()
        .domain(league)         // This is what is written on the Axis: from 0 to 100
        .range([0, 800]);         // Note it is reversed

    // Draw the axis
    svg
        .append("g")
        .attr("transform", "translate(100,100)")      // This controls the rotate position of the Axis
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,10)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", 20)
        .style("fill", "#69a3b2");



    d3.csv('data/MOCK_DATA.csv').then(function (data) {
        data.forEach(function (d) {
            d.league = d.league;
        });

        render(data);

    });

}(d3));


// // set the dimensions and margins of the graph
// var margin = {top: 10, right: 30, bottom: 30, left: 60},
//     width = 460 - margin.left - margin.right,
//     height = 400 - margin.top - margin.bottom;
//
// // append the svg object to the body of the page
// var svg = d3.select("#lineChart")
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform",
//         "translate(" + margin.left + "," + margin.top + ")");
//
//     //Read the data
//     d3.csv("data/MOCK_DATA.csv",
//
//     // When reading the csv, I must format variables:
//     function(d){
//         return { league : d.league, zombie : d.zombie }
//     },
//
//     // Now I can use this dataset:
//     function(data) {
//
//         // Add X axis --> it is a date format
//         // var x = d3.scaleTime()
//         //     .domain(d3.extent(data, function(d) { return d.date; }))
//         //     .range([ 0, width ]);
//
//         var  x = d3.scaleBand()
//             .domain("1","2")
//             .range(0, width);
//
//
//         svg.append("g")
//             .call(d3.axisBottom(x).tickValues(["A", "B", "C"]))
//
//         // Add Y axis
//         var y = d3.scaleLinear()
//             .domain([0, d3.max(data, function(d) { return +d.zombie; })])
//             .range([ height, 0 ]);
//         svg.append("g")
//             .call(d3.axisLeft(y));
//
//         // Add the line
//         svg.append("path")
//             .datum(data)
//             .attr("fill", "none")
//             .attr("stroke", "steelblue")
//             .attr("stroke-width", 1.5)
//             .attr("d", d3.line()
//                 .x(function(d) { return x(d.league) })
//                 .y(function(d) { return y(d.zombie) })
//             )
//
//     });