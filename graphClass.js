import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


export default class Graphclass {
    constructor(query, id) {
        this.query = query;
        this.id = id;
        this.svg = null;
        this.tooltip = null;
        this.sumCount = 0;
        this.width = 460;
        this.height = 270;
        this.tooltipString = "";
        this.transDict = {"1": "Unscathed", "2": "Killed", "3": "Hospitalized wounded", "4": "Light injury"}
        this.margin = {top: 30, right: 30, bottom: 100, left: 60};
        window.graph = this;
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

        this.sumCount = data.reduce((sum, element) => {
            return sum + element.y;
          },0);


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
            .attr("fill", "#69b3a2")
            .on("mouseover",  handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("mousemove", handleMouseMove);


        var tooltip = window.pie.tooltip
        var svg = this.svg
        // Tooltip functions
        function handleMouseOver(d, j) {
            // Adjust the opacity of all bars
            svg.selectAll("rect")
                .style("opacity", 0.5);

            // Highlight the selected bar
            d3.select(this)
                .style("opacity", 1)
                .attr("fill", "orange"); // Change color on hover

            tooltip.transition()
                .duration(500)
                .style("opacity", 0.9)
                .style("display", 'unset');
            window.tooltipString = j.x + ": " + j.y + " (" + Math.round(((j.y/window.pie.sumCount) + Number.EPSILON) * 10000) / 100 + "%)";

        }

        function handleMouseOut(d, j) {
            // Restore the opacity of all bars
            svg.selectAll("rect")
                .style("opacity", 1)
                .attr("fill", "#69b3a2"); // Restore original color on mouseout

            // Hide tooltip
            tooltip.transition()
                .duration(1)
                .style("opacity", 0)
                .style("display", 'none')
        }

        function handleMouseMove(d) {
            // Display tooltip
            console.log(d)
            var [xpt, ypt] = d3.pointer(d);
            tooltip.html(`${window.tooltipString}`)
                .style("left", (d.screenX + 10) + "px")
                .style("top", (d.screenY - 128) + "px");
        }


    }

    async updateGraph(queryDict) {
        const [max, data] = await this.getData(queryDict);

        
        this.sumCount = data.reduce((sum, element) => {
            return sum + element.y;
          },0);

        console.log(this.sumCount);

    
        var xScale = d3.scaleBand()
            .range([0, this.width])
            .domain(data.map(function(d) { return d.x; }))
            .padding(0.2);

        var yScale = d3.scaleLinear()
            .domain([0, max])
            .range([this.height, 0]);

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

    async updateFiltergraph(filter, queryDict) {
        const data = await this.getFilterStats(filter, queryDict);

    
        this.svg.selectAll("rect").remove();
    
        var xScale = d3.scaleBand()
            .range([0, 20 * data.length])
            .domain(data.map(function(d) { return d.category; }))
            .padding(0.2);
    
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d.total; })])
            .range([this.height, 0]);
    
        var z = d3.scaleOrdinal()
            .range(["#66c2a5", "#41ae76"]);
    
        var stack = d3.stack()
            .keys(["heavy", "light"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);
    
        var series = stack(data);
        console.log(series);
    
        // Bind the new data to the bars
        var bars = this.svg.selectAll("g.bar-group")
            .data(series);
    
        // Handle the exit selection
        bars.exit().remove();
    
        // Handle the enter selection
        bars.enter().append("g")
            .attr("class", "bar-group")
            .attr("fill", function(d) { return z(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return xScale(d.data.category); })
            .attr("y", function(d) { return yScale(d[1]); })
            .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
            .attr("width", xScale.bandwidth());

        // Remove the old x-axis
        this.svg.select(".x-axis").remove();
    
        // Update the y-axis
        this.svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScale));

        // // Update the y-axis
        // this.svg.select(".x-axis")
        //     .transition()
        //     .duration(1000)
        //     .call(d3.axisLeft(yScale));
    
        // Update or create the x-axis
        var xAxisGroup = this.svg.select(".x-axis");

        if (xAxisGroup.empty()) {
            xAxisGroup = this.svg.append("g")
                .attr("transform", "translate(0," + this.height + ")")
                .attr("class", "x-axis");
        }

        // Update the x-axis
        xAxisGroup.transition()
            .duration(1000)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
    }
    
    

    async getData(queryDict) {
        var data = [];
        var max = 0;
        console.log(queryDict); 
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

    async getFilterStats(filter, queryDict) {
        const [str, list] = filter;

        console.log(filter);
        
        var query = [];
        for (let i = 0; i < list.length; i++) {
            var x = { ...queryDict};
            x[str] = new Set([list[i][1]]);

            query.push(x);
        }

        var data =  [];



        const res = this.query.queryList(query);
        let max = 0;

        for (let i = 0; i < res.length; i++) {
            var add = {};
            add["category"] = list[i][0];
            add["heavy"] = res[i][1][2] + res[i][1][3];
            add["light"] = res[i][1][1] + res[i][1][4];
            add["total"] = res[i][0];
            if (res[i][0] > max) {
                max = res[i][0];
            }
            // add["heavy"] = res[i][1][2];
            // add["light"] = res[i][1][1] + res[i][1][3] + res[i][1][4];
            data.push(add);
        }

        console.log(data);

        return data;

    }


}