var width = 960,
    height = 760,
    padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 12;

var color = d3.scale.ordinal()
    .range(["#7A99AC", "#E4002B"]);

/**
 * takes the entire csv as a string and appends colNames to it, which handles as type accessors
 * throws error if not correct format (csv)
 * @type {string}
 */
d3.text("data/MOCK_DATA_1.csv", function(error, text) {
    if (error) throw error;

    var colNames = text;
    // data as an object Object
    var data = d3.csv.parse(colNames);

    //console.log("Data is : " + data + "\n");
    //console.log("ColName is : " + colNames);

    var dict_groups = []

    // goes through each data set, gets the size of each data
    data.forEach(function(d) {


        if(!dict_groups.includes(d.class)) {
            dict_groups.push({key: dict_groups.length+1, value: d.class});
            console.log("filled dict");
        }


        //console.log(d.gender);
        //d.size = +d.size;
        //console.log("doing some shit with d+ size - " + d.size);
    })

    console.log()
    dict_groups.forEach(function(d){
        console.log(d);
    });


    /**
     * goes through cluster groups, adds the groups to an accessible array
     * @type {Array}
     */
    var cs = [];
    data.forEach(function(d){
        if(!cs.contains(d.group)) {
            cs.push(d.group);

        }
    });

    var n = data.length, // total number of nodes
        m = cs.length; // number of distinct clusters

//create clusters and nodes
    var clusters = new Array(m);
    var nodes = [];
    for (var i = 0; i<n; i++){
        nodes.push(create_nodes(data,i));
    }

    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .gravity(.02)
        .charge(0)
        .on("tick", tick)
        .start();

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);


    var node = svg.selectAll("circle")
        .data(nodes)
        .enter().append("g").call(force.drag);


    node.append("circle")
        .style("fill", function (d) {
            return color(d.cluster);
        })
        .attr("r", function(d){return d.radius})


    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.text.substring(0, d.radius / 3); });




    function create_nodes(data,node_counter) {
        // gets data[i].group id
        // has to be changed or worked around with ids
        var i = cs.indexOf(data[node_counter].group),
            r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
            d = {
                cluster: i,
                radius: data[node_counter].size*1.5,
                text: data[node_counter].text,
                x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
                y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
            };

        // checks if group id exists in the clusters array
        // or if r (radius) is bigger than the radius of the cluster item
        if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
        return d;
    };



    function tick(e) {
        node.each(cluster(10 * e.alpha * e.alpha))
            .each(collide(.5))
            .attr("transform", function (d) {
                var k = "translate(" + d.x + "," + d.y + ")";
                return k;
            })

    }

// Move d to be adjacent to the cluster node.
    function cluster(alpha) {
        return function (d) {
            var cluster = clusters[d.cluster];
            if (cluster === d) return;
            var x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + cluster.radius;
            if (l != r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                cluster.x += x;
                cluster.y += y;
            }
        };
    }

// Resolves collisions between d and all other circles.
    function collide(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function (d) {
            var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                    if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }
});

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};