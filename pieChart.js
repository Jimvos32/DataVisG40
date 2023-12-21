import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


export default class PieChart {
    constructor(query, id) {
        this.query = query;
        this.id = id;
        this.svg = null;
        this.sumCount = 0;
        this.tooltip = null;
        this.g = null;
        this.width = window.innerWidth * 0.23;
        this.height = window.innerHeight * 0.23;
        this.lengend = null;
        this.pie = d3.pie().sort(null).value(function(d) { return d.value; });

        this.arc = d3.arc()
            .innerRadius(0)
            .outerRadius(Math.min(this.width, this.height) / 2);
        this.labelArc = d3.arc()
            .innerRadius(Math.min(this.width, this.height) / 2)
            .outerRadius(Math.min(this.width, this.height) / 2 * 1.2);

        this.arcTween = this.arcTween.bind(this);
        

        this.transDict = {"1": ["Unscathed", 0], "2": ["Killed", 3], "3": ["Hospitalized wounded", 2], "4": ["Light injury", 1]}
        this.margin = {top: 30, right: 10, bottom: 0, left: 30};
        window.pie = this
        this.setupPie();
    }

    async setupPie() {
        const data = await this.getData([{}]);



        this.sumCount = data.reduce((sum, element) => {
            return sum + element.value;
          },0);

        


        // Select the div and append an svg element to it
        this.svg = d3.select("#" + this.id)
            .append("svg")
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
                // Center the pie chart in the svg element
                .attr("transform", "translate(" + (this.width / 2 + this.margin.left - 100) + "," + (this.height / 2 + this.margin.top) + ")");

        // Create a group element for each segment of the pie chart
        this.g = this.svg.selectAll(".pie")
            .data(this.pie(data))
            .enter()
            .append("g")
            .attr("class", "pie"); 

        // Create a path element for each segment and set its d attribute
        this.g.append("path")
            .attr("d", this.arc)
            .style("fill", function(d, i) {
                // Color the segments
                var colors = ['#b2df8a','#33a02c', '#a6cee3','#1f78b4'];
                return colors[i];
            })
            .on("mouseover",  handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("mousemove", handleMouseMove);


        this.legend = this.svg.selectAll("legend")
            .data(data)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(" + (this.width / 2 - 50) + "," + (i * 20 - this.height / 2 + 50) + ")";
            }.bind(this));
    
        // Create a rectangle for the color of each legend item
        this.legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d, i) { 
                var colors = ['#b2df8a','#33a02c', '#a6cee3','#1f78b4'];
                return colors[i % colors.length];
            })
            .on("mouseover",  handleMouseOverLegend)
            .on("mouseout", handleMouseOut)
            .on("mousemove", handleMouseMove);
        
        // Create a text for the label of each legend item
        this.legend.append("text")
            .attr("x", 22)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .style("fill", "black")
            .style("visibility", "visible")
            .style("font-size", "10px")
            .text(function(d) { return d.label; });

    
        // Tooltip container
        this.tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")

        var tooltip = this.tooltip
        var svg = this.svg

        // Tooltip functions
        function handleMouseOver(d, j) {
            // Adjust the opacity of all paths
            svg.selectAll("path")
                .style("opacity", 0.5);
            svg.selectAll("rect")
                .style("opacity", (a) => (a.label === j.data.label) ? 1 : 0.5);

            // Highlight the selected paths
            d3.select(this)
                .style("opacity", 1)
                .attr("fill", "orange"); // Change color on hover
            
            // console.log(d3.select(this))

            tooltip.transition()
                .duration(500)
                .style("opacity", 0.9)
                .style("display", 'unset');
            window.tooltipString = j.data.label + ": " + j.data.value + " (" + Math.round(((j.data.value/window.pie.sumCount) + Number.EPSILON) * 10000) / 100 + "%)";


        }

        function handleMouseOverLegend(d, j) {
            // Adjust the opacity of all paths
            svg.selectAll("path")
                .style("opacity", (a) => (a.data.label === j.label) ? 1 : 0.5);
            svg.selectAll("rect")
                .style("opacity", 0.5);

            // Highlight the selected paths
            d3.select(this)
                .style("opacity", 1)
                .attr("fill", "orange"); // Change color on hover
            
            // console.log(d3.select(this))

            tooltip.transition()
                .duration(500)
                .style("opacity", 0.9)
                .style("display", 'unset');
            window.tooltipString = j.label + ": " + j.value + " (" + Math.round(((j.value/window.pie.sumCount) + Number.EPSILON) * 10000) / 100 + "%)";

        }

        function handleMouseOut(d, j) {
            // Restore the opacity of all paths
            svg.selectAll("path")
                .style("opacity", 1)
                .attr("fill", "#69b3a2"); // Restore original color on mouseout
            
            svg.selectAll("rect")
                .style("opacity", 1)
                .attr("fill", "#69b3a2");

            // Hide tooltip
            tooltip.transition()
                .duration(1)
                .style("opacity", 0)
                .style("display", 'none')
        }

        function handleMouseMove(d) {
            // Display tooltip
            var [xpt, ypt] = d3.pointer(d);
            // console.log(d);
            tooltip.html(`${window.tooltipString}`)
                .style("left", (d.clientX + 10) + "px")
                .style("top", (d.clientY - 40) + "px");
        }

        document.getElementById("totalSum").innerText = this.sumCount;
        // var countText = document.getElementById("counter");
        // countText.textContent = `Total ocurrences: ${this.sumCount}`;


    }

    async updatePie(queryDict) {
        const data = await this.getData(queryDict);

        this.sumCount = data.reduce((sum, element) => {
            return sum + element.value;
            },0);
        console.log(this.sumCount);
    
        // Create a new data join with the updated data
        var pie = d3.pie().sort(null).value(function(d) { return d.value; });
        // Select only the pie chart g elements
        var g = this.svg.selectAll(".pie")
            .data(pie(data));

        this.svg.selectAll("rect")
            .data(data);

        document.getElementById("totalSum").innerText = this.sumCount;

        this.svg.select(".count")
            .text(`Total occurences: ${this.sumCount}`);
        
        g.select("path")
            .transition()
            .duration(1000)
            .attrTween("d", this.arcTween);  // Use the arcTween function for the transition
        g.select("text")
            .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
            .text(function(d) { 
                return d.label; });

        // Handle the exit selection
        g.exit().remove();

    }

    arcTween(d) {
        var i = d3.interpolate(this._current, d);
        this._current = i(0);
        return function(t) {
            return this.arc(i(t));  // Use this.arc instead of arc
        }.bind(this);  // Bind this to the function scope
    }

    async getData(queryDict) {
        var data = [];

        const [grav, what] = this.query.queryList(queryDict);
        console.log(grav)
        for (let key in grav[1]) {
            console.log(grav[1])
            console.log(grav[1])
            let value = {};
            value["label"] = this.transDict[key][0];
            value["value"] = grav[1][key];
            // data.push(value);
            data[this.transDict[key][1]]=  value;
            console.log(value);
        }
        console.log(data);
        return data;
    }


}