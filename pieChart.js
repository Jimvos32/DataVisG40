import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


export default class PieChart {
    constructor(query, id) {
        this.query = query;
        this.id = id;
        this.svg = null;
        this.g = null;
        this.width = 460;
        this.height = 270;
        this.lengend = null;
        this.pie = d3.pie().sort(null).value(function(d) { return d.value; });

        this.arc = d3.arc()
            .innerRadius(0)
            .outerRadius(Math.min(this.width, this.height) / 2);
        this.labelArc = d3.arc()
            .innerRadius(Math.min(this.width, this.height) / 2)
            .outerRadius(Math.min(this.width, this.height) / 2 * 1.2);

        this.arcTween = this.arcTween.bind(this);
        

        this.transDict = {"1": "Unscathed", "2": "Killed", "3": "Hospitalized wounded", "4": "Light injury"}
        this.margin = {top: 30, right: 30, bottom: 100, left: 60};
        this.setupPie();
    }

    async setupPie() {
        const data = await this.getData([{}]);


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
                var colors = ["#66c2a5", "#41ae76", "#238b45", "#005824"];
                return colors[i];
            });


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
                var colors = ["#66c2a5", "#41ae76", "#238b45", "#005824"];
                return colors[i % colors.length];
            });
        
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
    }

    async updatePie(queryDict) {
        const data = await this.getData(queryDict);
    
        // Create a new data join with the updated data
        var pie = d3.pie().sort(null).value(function(d) { return d.value; });
        // Select only the pie chart g elements
        var g = this.svg.selectAll(".pie")
            .data(pie(data));

        // // Add a class to the pie chart g elements
        // var enter = g.enter()
        //     .append("g")
        //     .attr("class", "pie");
        // enter.append("path")
        //     .attr("d", this.arc)
        //     .style("fill", function(d, i) {
        //         var colors = ["#66c2a5", "#41ae76", "#238b45", "#005824"];
        //         return colors[i];
        //     });
       
        // Handle the update selection
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
        for (let key in grav[1]) {
          
            let value = {};
            value["label"] = this.transDict[key];
            value["value"] = grav[1][key];
            data.push(value);
        }
        return data;
    }


}