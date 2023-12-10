import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


export default class Graphclass {
    constructor(query, id) {
        this.query = query;
        this.id = id;
        this.svg = null;
        this.width = 460;
        this.height = 270;

        this.transDict = {"1": "Unscathed", "2": "Killed", "3": "Hospitalized wounded", "4": "Light injury"}
        this.margin = {top: 30, right: 30, bottom: 100, left: 60};
        this.setupGraph();
    }

    async setupGraph() {
        this.width -= this.margin.left - this.margin.right,
        this.height -= this.margin.top - this.margin.bottom;

        this.svg = d3.select("#" + this.id)
        .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")");


        var xDomain = ["Unscathed", "Killed", "Hospitalized wounded", "Light injury"] //Need dictionary mapping
        var xScale = d3.scaleBand()
        .domain(xDomain)
        .range([ 0, this.width ])
        .padding(0.2);

        

        this.svg.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        const [max, data] = await this.getData([{}]);

        // Add Y axis
        var yScale = d3.scaleLinear() 
            .domain([0, max])
            .range([ this.height, 0]);
        this.svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale));
        // Bars
        this.svg.selectAll("mybar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d) => xScale(d.x))
            .attr("y", (d) => yScale(d.y))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => this.height - yScale(d.y))
            .attr("fill", "#69b3a2");
    }

    async updateGraph(queryDict) {
        const [max, data] = await this.getData(queryDict);
    
        var xScale = d3.scaleBand()
            .range([0, this.width])
            .domain(data.map(function(d) { return d.x; }))
            .padding(0.2);

        var yScale = d3.scaleLinear()
            .domain([0, max])
            .range([this.height, 0]);

        // this.svg.append("g")
        //     .call(d3.axisLeft(yScale).tickFormat(function(d) {
        //         // Return the label for tick value d
        //         return "Label " + d;
        //     }));

        // Select all bars and bind new data
        console.log(data);
        var bars = this.svg.selectAll("rect")
            .data(data);

        // Use the .exit() and .remove() methods to remove any data not needed
        bars.exit().remove();

        // Use the .enter() method to get new data not currently on the graph
        bars.enter()
            .append("rect")
            .attr("x", (d) => xScale(d.x))
            .attr("width", xScale.bandwidth())
            .attr("fill", "#69b3a2")
            .merge(bars)
            .transition() // Add a transition if you want the changes to animate
            .duration(500)
            .attr("y", (d) => yScale(d.y))
            .attr("height", (d) => this.height - yScale(d.y));

        this.svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScale));
    }

    async getData(queryDict) {
        var data = [];
        var max = 0;
        const [grav, what] = this.query.queryList(queryDict);
        for (let key in grav[1]) {
          
            let value = {};
            value["x"] = this.transDict[key];
            value["y"] = grav[1][key];
            if (grav[1][key] > max) {
                max = grav[1][key];
            }
            data.push(value);
        }
        return [max, data];
    }


}