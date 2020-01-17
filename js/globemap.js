

var width = 600,
        height = 500,
        sens = 0.25,
        focused;

//Setting projection
    var projection = d3.geo.orthographic()
        .scale(245)
        .rotate([0, 0])
        .translate([width / 2, height / 2])
        .clipAngle(90);

    var path = d3.geo.path()
        .projection(projection);

    var sliderValue = 0;


//SVG container
    var svg = d3.select("#globe").append("svg")
        .attr("width", width)
        .attr("height", height);

    var max_population = [];
    var rScale = d3.scale.sqrt();
    var peoplePerPixel = 50000;

// Append empty placeholder g element to the SVG
    var group = svg.append("g");

    /*visualizationData = d3.json('data/geonames_cities_100k.geojson')
        visualizationData = svg.append("g");*/

//Adding water

    svg.append("path")
        .datum({type: "Sphere"})
        .attr("class", "ocean")
        .attr("d", path);

    var countryTooltip = d3.select("#globe").append("div").attr("class", "countryTooltip"),
        countryList = d3.select("#globe").append("select").attr("name", "countries");

    function getData(nameCSV){

        queue()
            .defer(d3.json, "data/world-110m.json")
            .defer(d3.tsv, "data/world-110m-country-names.tsv")
            .defer(d3.json, "data/geonames_cities_100k.geojson")
            .defer(d3.csv, nameCSV)
            .defer(d3.csv, "data/listOfLeagues.csv")
            .await(ready);
    }
    getData("data/ClassFixed_MOCKDATA_v3.csv")

    function changeDataset(value) {
        dataset = "data/minimized/ClassFixed_MOCKDATA_v3_" + value + ".csv";
        console.log(dataset);
        sliderValue = value;
        console.log("SliderValue: " + sliderValue);


        changeDatasetBubbles(value);
        getData(dataset);
    }


//Main function

    function ready(error, world, countryData, cityData, classData, leagueData) {

        var countryById = {},
            countries = topojson.feature(world, world.objects.countries).features;
        console.log(countries);

        //Adding countries to select
        countryData.forEach(function(d) {
            countryById[d.id] = d.name;
            option = countryList.append("option");
            option.text(d.name);
            option.property("value", d.id);
        });




        /* list sum of players of all countries
        ** key = list of countries ordered by country
        ** rollup = sum of country
        */
        var countryClasssCount = d3.nest()
            .key(function(d) { return d.country; })
            .rollup(function(v) { return v.length; })
            .entries(classData);
        console.log(JSON.stringify(countryClasssCount));

        // define colorScale for heatmapped data
        var colorScale = d3.scale.threshold()
            .domain([0,10, 40, 70, 100, 130])
            .range(['#D7DEE3','#B0BDC8', '#8A9EAD', '#648093', '#3E637A', '#104761', '#024059']);

        svg.selectAll("path.country").remove();

        //Drawing countries on the globe
        var world = svg.selectAll("path.country")
            .data(countries)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", function (d) {

                //loop through countryClassCount and test if country is the same as the id of the path.country
                for (i=0; i < countryClasssCount.length; i++) {
                    var test2 = countryClasssCount[i].key;

                    if (test2 === countryById[d.id]) {

                        return colorScale(countryClasssCount[i].values);
                    }
                }

            })



            //Drag event
            .call(d3.behavior.drag()
                .origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
                .on("drag", function() {
                    var rotate = projection.rotate();
                    projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
                    svg.selectAll("path.country, path.cities").attr("d", path);
                    svg.selectAll(".focused").classed("focused", focused = false);
                }))

            //Mouse events
            .on("mouseover", function(d) {
                countryTooltip.text(countryById[d.id] )
                    .style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px")
                    .style("display", "block")
                    .style("opacity", 1);
            })
            .on("mouseout", function(d) {
                countryTooltip.style("opacity", 0)
                    .style("display", "none");
            })
            .on("mousemove", function(d) {
                countryTooltip.style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
            })
            .on("click", function (d) {

                //get name of League
                var leagueValue = leagueData[sliderValue].leagues;

                //get count Values of the Selected Country
                for (i=0; i < countryClasssCount.length; i++) {
                    var test2 = countryClasssCount[i].key;

                    if (test2 === countryById[d.id]) {

                        var count = countryClasssCount[i].values;

                    }
                }

                // CODE THAT DISPLAYS THE SPECIFIC VALUES OF SELECTED
                var infoDivID="infoDiv"+countryById[d.id];

                $( "#selectedDiv2" ).append( "<div id='"+infoDivID+"' class='infoDiv'><strong>League: </strong>"+leagueValue+"<br>" +
                    "<strong>Country: </strong>"+countryById[d.id]+"<br>" +
                    "<strong>Count: </strong>"+count+"<br>" +
                    "</div>" )

            });

        //Country focus on option select
        d3.select("select").attr("id", "selectOption").on("change", function() {
            var rotate = projection.rotate(),
                focusedCountry = country(countries, this),
                p = d3.geo.centroid(focusedCountry);

            svg.selectAll(".focused").classed("focused", focused = false);


            //Globe rotating
            (function transition() {
                d3.transition()
                    .duration(2500)
                    .tween("rotate", function() {
                        var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                        return function(t) {
                            projection.rotate(r(t));
                            svg.selectAll("path").attr("d", path)
                                .classed("focused", function(d, i) { return d.id == focusedCountry.id ? focused = d : false; });
                        };
                    })
            })();
        });

        function country(cnt, sel) {
            for(var i = 0, l = cnt.length; i < l; i++) {
                if(cnt[i].id == sel.value) {return cnt[i];}
            }
        };


    };

    var scrollSpeed = 50,
        speed = 1e-2,
        start = Date.now();

    /*function bgscroll(){

        projection.rotate([speed * (Date.now() - start), -15]);
        svg.selectAll("path").attr("d", path);
    }

        setInterval(bgscroll, scrollSpeed);*/

