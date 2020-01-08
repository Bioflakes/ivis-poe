var width = 960,
    height = 760,
    padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 12;

var color = d3.scale.ordinal()
    .range(["#7A99AC", "#E4002B"]);

var dataset = "data/ClassFixed_MOCKDATA_v3.csv"

/**
 * takes the entire csv as a string and appends colNames to it, which handles as type accessors
 * throws error if not correct format (csv)
 * @type {string}
 */
d3.text(dataset, function(error, text) {
    if (error) throw error;

    var colNames = text;
    // data as an object Object
    var data = d3.csv.parse(colNames);

    //console.log("Data is : " + data + "\n");
    //console.log("ColName is : " + colNames);

    var dict_groups = new Map();


    // goes through each data set, gets the size of each data
    data.forEach(function(d) {



        if(!dict_groups.has(d.class)) {
            dict_groups.set(d.class, 1);
        }
        else {
            dict_groups.set(d.class, dict_groups.get(d.class)+1)
        }

        //console.log(d.gender);
        //d.size = +d.size;
        //console.log("doing some shit with d+ size - " + d.size);
    })

    console.log()

    let value = 0;
    var indexed_classes = [];
    for (let key of dict_groups.keys()) {
        console.log(key + ': ' + dict_groups.get(key));
        value = value + dict_groups.get(key);
        // pushes to a list of indexed classes, for use in grouping them together
        indexed_classes.push(key).toString();
    }
    console.log("amount of classes: " + value);
    console.log("Indexed classes: " + indexed_classes);


    /**
     * goes through cluster groups, adds the groups to an accessible array of type number
     * @type {Array}
     */


    var grouped_classes = [];
    data.forEach(function(d){
        if(!grouped_classes.contains(indexed_classes.indexOf(d.class))) {
            grouped_classes.push(indexed_classes.indexOf(d.class));

        }
    });

    console.log("length of grouped classes: " + grouped_classes.length);
    console.log("grouped classes are: " + grouped_classes);

    var n = data.length, // total number of nodes
        m = grouped_classes.length; // number of distinct clusters


//create clusters and nodes
    var clusters = new Array(m);
    var nodes = [];
    for (var i = 0; i<n; i++){
        nodes.push(create_nodes(data,i));
    }

    console.log("nodes : " + nodes);

    var force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .gravity(.02)
        .charge(0)
        .on("tick", tick)
        .start()
        console.log("called tick");


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
        .attr("r", function(d){return dict_groups.get(d.class)})


    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.text.substring(0, d.radius / 3); });
        //.text(function(d) { return d.class});




    function create_nodes(data,node_counter) {
        // gets data[i].group id
        // has to be changed or worked around with ids
        //
        // console.log("data node counter : " + data[node_counter].class)
        var i = grouped_classes.indexOf(indexed_classes.indexOf(data[node_counter])),
            r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
            d = {
                cluster: i,
                //radius: data[node_counter].size*1.5,
                radius: dict_groups.get(data[node_counter].class*1.5),
                text: data[node_counter].class,
                x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
                y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
            };

        //console.log("after decl. " +  d.x + " " + d.y);
        // checks if group id exists in the clusters array
        // or if r (radius) is bigger than the radius of the cluster item
        if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
        return d;
    };


    function tick(e) {
        //console.log("entered tick function.");
        //console.log("event is: " + e.x);
        node.each(cluster(10 * e.alpha * e.alpha))
            .each(collide(.5))
            .attr("transform", function (d) {

                //console.log("d.x and d.y are: " +d.x+"-"+d.y);
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
