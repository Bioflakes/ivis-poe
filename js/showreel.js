
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

var svg2 = d3.select("body").append("svg")
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
    y.domain([0, d3.max(data, function(d) {
        var obj =  d[Object.keys(d)[1]]; //takes the second column value
        for(i = 2; i<= Object.keys(d).length-1; i++){
            obj = obj + d[Object.keys(d)[i]];
        }
        return obj;
    })]);

    for(i = 0; i< 4; i++){ //4 is the current number of leagues
        //random memes
        svg.selectAll(".bar"+i)
            .data(data)
            .enter().append("rect")
            .attr("class", "bar"+i)
            .attr("x", function(d) {return x(d[Object.keys(d)[0]]); })
            .attr("width", x.bandwidth())
            .attr("y", function(d) {
                var obj =  d[Object.keys(d)[1]]; //takes the second column value
                for(j = 0; j<i; j++){
                    if (i > 0) {
                        obj = obj + d[Object.keys(d)[j+2]];
                    }
                }
                return y(obj);
            })
            .attr("height", function(d) {return height - y(d[Object.keys(d)[i+1]]);})
            .attr("playerCount", i+1)
            .attr("lastColor", "")
            .attr("classSelected", "0")
            .on("mouseover", function() {
                //make the background 10% lighter

                if(d3.select(this).attr("classSelected") !== "1") {
                    var playerCount = d3.select(this).attr("playerCount");
                    d3.select(this).attr("lastColor", $(".bar" + (playerCount - 1)).css('fill'));
                    $(".bar" + (playerCount - 1)).css('fill', pSBC(0.05, $(".bar" + (playerCount - 1)).css('fill')));
                }
                //clear tooltip
                tooltip.style("display", null);
            })
            .on("mouseout", function() {
                //reset the color
                if(d3.select(this).attr("classSelected") !== "1") {
                    var playerCount = d3.select(this).attr("playerCount");
                    $(".bar" + (playerCount - 1)).css('fill', d3.select(this).attr("lastColor"));
                    d3.select(this).attr("lastColor", $(".bar" + (playerCount - 1)).css('fill'));
                }
                //remove tooltip
                tooltip.style("display", "none"); })
            .on("mousemove", function(d) {
                //display tooltip on mouse
                var playerCount = d3.select(this).attr("playerCount");
                var xPosition = d3.mouse(this)[0] - 15;
                var yPosition = d3.mouse(this)[1] - 25;
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                tooltip.select("text").text(d[Object.keys(d)[playerCount]]);
            })
            .on("click", function(d) {
            var playerCount = d3.select(this).attr("playerCount");

                if(d3.select(this).attr("classSelected") !== "1") {
                    $(".bar"+(playerCount-1)).css('fill', 'red');
                    d3.select(this).attr("classSelected", "1");

                    // CODE THAT DISPLAYS THE SPECIFIC VALUES OF SELECTED

                }
                else {
                    $(".bar" + (playerCount - 1)).css('fill', d3.select(this).attr("lastColor"));
                    d3.select(this).attr("classSelected", "0");

                    // CODE THAT RESETS THE SPECIFIC VALUES OF SELECTED
                }
        });
    }

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


//Make a color lighter or darker
//Crudos to Pimp Trizkit
//https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors

// Version 4.0
const pSBC=(p,c0,c1,l)=>{
    let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
    if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
    if(!this.pSBCr)this.pSBCr=(d)=>{
        let n=d.length,x={};
        if(n>9){
            [r,g,b,a]=d=d.split(","),n=d.length;
            if(n<3||n>4)return null;
            x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
        }else{
            if(n==8||n==6||n<4)return null;
            if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
            d=i(d.slice(1),16);
            if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
            else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
        }return x};
    h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
    if(!f||!t)return null;
    if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
    else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
    a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
    if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
    else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}