var width = 1080,
    height = 900,
    padding = 60, // separation between same-color nodes
    clusterPadding = 70, // separation between different-color nodes
    maxRadius = 12;

var color = d3.scale.ordinal()
    .range(["#7A99AC", "#E4002B","#E4002B","#FFC300","#DAF7A6","#581845","#3498DB","#148F77","#BA4A00","#1D8348","#808000","#00FFFF","#935116","#27AE60","#2C3E50","#9B59B6","#FF33CA","#FF00D8","#B44D01","#0E7574","#E4002B"]);

var dataset = "data/minimized/ClassFixed_MOCKDATA_v3_min_0.csv"

var skill_groups = new Map();
var skilldata;

var nodes = [];

var active_league = 0;

/**
 * takes the entire csv as a string and appends colNames to it, which handles as type accessors
 * throws error if not correct format (csv)
 * @type {string}
 */

function main() {
    console.log("called main");

    d3.select('#bubbles-svg').remove();
    readSkillFile();
    readClassFile();
}

function changeDatasetBubbles(value) {
    dataset = "data/minimized/ClassFixed_MOCKDATA_v3_min_" + value + ".csv";

    skill_groups = null;
    nodes = null;

    skill_groups = new Map();
    nodes = [];

    active_league = value;

    main();
}

function readSkillFile() {
    d3.text("data/SKILL_LIST.csv", function(error, skilltext) {
        if(error) throw error;

        console.log("reading skill file");

        var headers = skilltext;

        skilldata = d3.csv.parse(headers);

        // dict with all skills
        skilldata.forEach(function(d) {
            skill_groups.set(d.id, d.skill)
        })

    })
}

function readClassFile() {
    d3.text(dataset, function(error, text) {
        if (error) throw error;




        console.log(skill_groups);


        var colNames = text;
        //console.log("colnames are : " + colNames);
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
        //console.log("amount of classes: " + value);
        //console.log("Indexed classes: " + indexed_classes);


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

        //console.log("length of grouped classes: " + grouped_classes.length);
        //console.log("grouped classes are: " + grouped_classes);

        var n = data.length, // total number of nodes
            m = grouped_classes.length; // number of distinct clusters


//create clusters and nodes
        var clusters = new Array(m);
        var nodes_container = [];
        var nodes_container_names = [];

        var hidden_nodes = [];
        for (var i = 0; i<n; i++){

            nodes_container.push(create_nodes(data,i));

        }
        nodes_container.forEach(function(d) {

            if(!nodes_container_names.contains(d.text)) {
                nodes_container_names.push(d.text);
                nodes.push(d);
            }
            else {
                var randomSkill = Math.floor(Math.random() * skill_groups.size);
                d.text = skill_groups.get(randomSkill.toString());
                d.radius = (Math.random() * 2)+1;
                //d.text = d.radius;
                //console.log("random number: " + randomSkill);
                //console.log("randomed " + skill_groups.get(randomSkill.toString()));
                hidden_nodes.push(d);
            }

        })

        var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .gravity(.02)
            .charge(0)
            .on("tick", tick)
            .start()
        console.log("called tick");


        var svg = d3.select("#bubbles").append("svg")
            .attr("id", "bubbles-svg")
            .attr("width", width)
            .attr("height", height);


        var node = svg.selectAll("circle")
            .data(nodes)
            .enter().append("g")
            .call(force.drag)
            .on("click", function(d) {
                display_skills(d);
            })
            .on("mouseover", function(d) {
                console.log(d.text);
            });




        function display_skills(d) {

            var tempnodes = nodes;
            nodes = [];

            hidden_nodes.forEach(function(node) {
                if(d.cluster === node.cluster) {
                    console.log("----------------------------------------------------------");
                    console.log("node cluster: " + node.cluster + " - given data cluster: " + d.cluster);
                    console.log("node text: " + node.text + " - given text: " + d.text);



                    console.log("d - " + JSON.stringify(d));
                    console.log("node - " + JSON.stringify(node));
                    nodes.push(node);


                }
            });

            main();
        }



        node.append("circle")
            .style("fill", function (d) {
                return color(d.cluster);
            })
            .style("opacity", function (d) {
                if(dict_groups.has(d.text)) {
                    return 1;
                }
                else {return 0.5}
            })
            .attr("r", function(d){
                if(dict_groups.has(d.text)) {
                    //existing_playerclass.push(d.text);
                    //console.log("pushed to list" + d.text);
                    return d.radius*6;
                }
                else {
                    return d.radius*6}
                //return dict_groups.get(d.text) * 4}
            })


        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            //text(function(d) { return d.text.substring(0, d.radius / 3); });
            .text(function(d) { return d.text});




        function create_nodes(data,node_counter) {
            // gets data[i].group id
            // has to be changed or worked around with ids
            //
            // console.log("data node counter : " + data[node_counter].class)
            var i = indexed_classes.indexOf(data[node_counter].class),
                r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
                d = {
                    cluster: i,
                    //radius: data[node_counter].size*1.5,
                    radius: dict_groups.get(data[node_counter].class),
                    text: data[node_counter].class,
                    x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
                    y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
                };

            //console.log("data is : " + data[node_counter].class);
            //console.log("i = " + i);
            //console.log("r = " + r);
            //console.log("d = cluster: " + d.cluster + "\nradius: " +d.radius + "\ntext: " +d.text + "\nx, y: " + d.x + ", " +d.y);
            //
            // checks if group id exists in the clusters array
            // or if r (radius) is bigger than the radius of the cluster item
            if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
            return d;
        };



        console.log("nodes are: " + JSON.stringify(nodes[0]));


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
                //console.log("radius in cluster function: " + r);
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
}



Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};
