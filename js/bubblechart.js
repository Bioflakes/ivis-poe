var width = 680,
    height = 550,
    padding = 80, // separation between same-color nodes
    clusterPadding = 90, // separation between different-color nodes
    maxRadius = 12;

var color_by_size = ['#124963', '#3E637A', '#648093', '#8A9EAD', '#B0BDC8', '#D7DEE3', '#FFDF00'];

var dataset_bubbles = "data/minimized/ClassFixed_MOCKDATA_v3_min_0.csv"

var skill_groups = new Map();
var skilldata;

var nodes = [];

var svg1;
function bubble_main() {
    require(["d3"], function(d3) {
        svg1 = d3.select("#bubbles").append("svg")
            .attr("id", "bubbles-svg")
            .attr("width", width)
            .attr("height", height);

        bubblechart();
    });
}



var active_league = 0;

/**
 * takes the entire csv as a string and appends colNames to it, which handles as type accessors
 * throws error if not correct format (csv)
 * @type {string}
 */

function bubblechart() {

    d3.select('#bubbles-svg').selectAll("*").remove();
    readSkillFile();
    readClassFile();
}

function changeDatasetBubbles(value) {
    dataset_bubbles = "data/minimized/ClassFixed_MOCKDATA_v3_min_" + value + ".csv";

    skill_groups = null;
    nodes = null;

    skill_groups = new Map();
    nodes = [];

    active_league = value;

    bubblechart();
}

function readSkillFile() {
    d3.text("data/SKILL_LIST.csv", function(error, skilltext) {
        if(error) throw error;

        var headers = skilltext;

        skilldata = d3.csv.parse(headers);

        // dict with all skills
        skilldata.forEach(function(d) {
            skill_groups.set(d.id, d.skill)
        })

    })
}

function readClassFile() {
    d3.text(dataset_bubbles, function(error, text) {
        if (error) throw error;

        var colNames = text;

        // data as an object Object
        var data = d3.csv.parse(colNames);

        var dict_groups = new Map();


        // goes through each data set, gets the size of each data
        data.forEach(function(d) {



            if(!dict_groups.has(d.class)) {
                dict_groups.set(d.class, 1);
            }
            else {
                dict_groups.set(d.class, dict_groups.get(d.class)+1)
            }

        })


        let value = 0;
        var indexed_classes = [];
        for (let key of dict_groups.keys()) {
            value = value + dict_groups.get(key);
            // pushes to a list of indexed classes, for use in grouping them together
            indexed_classes.push(key).toString();
        }


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
                d.radius = (Math.random() * 3)+1;
                hidden_nodes.push(d);
            }

        });

        var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .gravity(.02)
            .charge(0)
            .on("tick", tick)
            .start()



        var mouseX, mouseY;
        var lastMouseX, lastMouseY;
        var node = svg1.selectAll("circle")
            .data(nodes)
            .enter().append("g")
            .call(force.drag)
            .on("mousedown", function(d) {
                mouseX = getCursorPositionX(d);
                mouseY = getCursorPositionY(d);
            })
            .on("mouseup", function(d) {
                lastMouseX = getCursorPositionX(d);
                lastMouseY = getCursorPositionY(d);

                if(!(dict_groups.has(d.text))) {
                }
                else if(!(Math.abs(mouseX - lastMouseX) > 10 || Math.abs(mouseY - lastMouseY) > 10)) {
                    display_skills(d);
                }


            })
            .on("mouseover", function(d) {
                //d.style("tooltip", d.text);
            });



        function getCursorPositionX(d) {
            return d.x;
        }
        function getCursorPositionY(d) {
            return d.y;
        }

        function display_skills(d) {

            var tempnodes = nodes;
            nodes = [];

            hidden_nodes.forEach(function(node) {
                if(d.cluster === node.cluster) {
                    nodes.push(node);
                }
            });

            bubblechart();
        }



        node.append("circle")
            .style("fill", function (d) {



                    if(dict_groups.has(d.text)) {
                        switch(true) {
                            case(d.radius >= 10): return color_by_size[0]
                                break;
                            case(d.radius >= 8): return color_by_size[1]
                                break;
                            case(d.radius >= 6): return color_by_size[2]
                                break;
                            case(d.radius >= 4): return color_by_size[3]
                                break;
                            case(d.radius >= 2): return color_by_size[4]
                                break;
                            default: return color_by_size[5];
                        }
                    }
                    else {return color_by_size[6]}

            })
            .style("opacity", function (d) {
                if(dict_groups.has(d.text)) {
                    return 1;
                }
                else {return 0.8}
            })
            .attr("r", function(d){
                if(dict_groups.has(d.text)) {
                    return d.radius*6;
                }
                else {
                    return d.radius*6}
                //return dict_groups.get(d.text) * 4}
            })


        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .style("fill", "#FFFFFF")
            //text(function(d) { return d.text.substring(0, d.radius / 3); });
            .text(function(d) {
                return d.text});




        function create_nodes(data,node_counter) {
            // gets data[i].group id
            // has to be changed or worked around with ids
            //
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
}



Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};
