import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


export default class StackGraph {
    constructor(query, id) {
        this.query = query;
        this.id = id;
        this.svg = null;
        this.width = window.innerWidth * 0.3;
        this.height = window.innerHeight * 0.11;
        this.currentFilter = "";
        this.queryDict = new Object();
        this.transDict = {"1": "Unscathed", "2": "Killed", "3": "Hospitalized wounded", "4": "Light injury"};
        this.ignore = new Set();
        this.margin = {top: 5, right: 0, bottom: 90, left: 60};
        this.setupGraph();
        window.stack = this;
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

        const data = await this.getFilterStats(["atm", [['Normal', 1],['Light rain', 2]
            ,['Heavy rain', 3]
            ,['Snow - hail', 4]
            ,['Fog - smoke', 5]
            ,['Strong wind - storm', 6]
            ,['Dazzling weather', 7]
            ,['Cloudy weather', 8]
            ,['Other', 9]], [{}]]);

    
        var xScale = d3.scaleBand()
            .range([0, 42 * data.length])
            .domain(data.map(function(d) { return d.category; }))
            .padding(0.2);
    
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d.total; })])
            .range([this.height, 0]);
    
        var z = d3.scaleOrdinal()
            .range(["#8da0cb", "#66c2a5"]);
    
        var stack = d3.stack()
            .keys(["Severe or fatal injury", "Light or no injury"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

              // Add Y axis
        
        this.svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale));
  
        var series = stack(data);
    
        // Bind the new data to the bars
        var bars = this.svg.selectAll("g.bar-group")
            .data(series);

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
           .attr("transform", "translate(-10,0)rotate(-25)")
           .style("text-anchor", "end")
           .style("fill", "blue");

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
            .attr("width", xScale.bandwidth())
            .on("mouseover",  handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("mousemove", handleMouseMove);


        // // Tooltip container
        // this.tooltip = d3.select("body")
        // .append("div")
        // .attr("class", "tooltip")

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
                //.attr("fill", "orange"); // Change color on hover
            // console.log(j)
            tooltip.transition()
                .duration(500)
                .style("opacity", 0.9)
                .style("display", 'unset');
            var sum = 0;
            for (var key in j.data) {
                if(key == 'category' || key == 'total' || j.data[key] == 0) {
                    continue;
                } else {
                    if (j[0] == sum) {
                        window.tooltipString = key + ": " + j.data[key] + " (" + Math.round(((j.data[key]/j.data["total"]) + Number.EPSILON) * 10000) / 100 + "%)";
                        break;
                    } else {
                        sum += j.data[key]
                    }
                }
            }

        }

        function handleMouseOut(d, j) {
            // Restore the opacity of all bars
            svg.selectAll("rect")
                .style("opacity", 1)
                //.attr("fill", "#69b3a2"); // Restore original color on mouseout

            // Hide tooltip
            tooltip.transition()
                .duration(1)
                .style("opacity", 0)
                .style("display", 'none')
        }

        function handleMouseMove(d) {
            // Display tooltip
            // console.log(d)
            var [xpt, ypt] = d3.pointer(d);
            tooltip.html(`${window.tooltipString}`)
                .style("left", (d.clientX + 10) + "px")
                .style("top", (d.clientY - 40) + "px");
        }



        // function updateScales() {

        //     //yScale.domain([0, d3.max(data, d => d3.max(d.values, v => v[1]))]);
        //     yScale.domain([0, d3.max(data, function(d) { return d.total - 1780000; })])

        //     svg.select(".y-axis")
        //     .transition()
        //     .duration(1000)
        //     .call(d3.axisLeft(yScale));
        // }

        // Add click event for x-axis labels
        var filter = ["atm", [['Normal', 1],['Light rain', 2]
        ,['Heavy rain', 3]
        ,['Snow - hail', 4]
        ,['Fog - smoke', 5]
        ,['Strong wind - storm', 6]
        ,['Dazzling weather', 7]
        ,['Cloudy weather', 8]
        ,['Other', 9]]]

        const xAxisLabels = d3.selectAll('.x-axis .tick text');
        this.currentFilter = filter;
        var queryDict = this.queryDict;

        xAxisLabels.on('click', function(event, d) {
            const category = d;
            console.log(this);
            if(window.stack.ignore.has(d)) {
                window.stack.ignore.delete(d);
                console.log("removing")

            } else {
                window.stack.ignore.add(d);

            }

            window.stack.updateFiltergraph(filter, queryDict, true);
        });

        
    }

    async updateFiltergraph(filter, queryDict, persist = false) {
        console.log("test")
        console.log(filter)
        console.log(queryDict)
        if(!persist){
            this.ignore.clear();
            this.currentFilter = filter;
            this.queryDict = queryDict;
            console.log("cleared")
        }
        const data = await this.getFilterStats(filter, queryDict, persist);
    
        var xScale = d3.scaleBand()
            .range([0, 42 * data.length])
            .domain(data.map(function (d) { return d.category; }))
            .padding(0.2);
    
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return d.total; })])
            .range([this.height, 0]);
    
        var z = d3.scaleOrdinal()
            .range([["#8da0cb", "#66c2a5"]]);
    
        var stack = d3.stack()
            .keys(["Severe or fatal injury", "Light or no injury"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);
    
        var series = stack(data);
    
        // Bind the new data to the bars
        var bars = this.svg.selectAll("g.bar-group")
            .data(series, function (d) { return d.key; });
    
        // Handle the exit selection for groups
        bars.exit().remove();
    
        bars.transition()
        .duration(1000)
        .attr("transform", function (d) {
            return "translate(0,0)"; // Change this line
        });

        // Handle the enter selection for groups
        var newGroups = bars.enter().append("g")
        .attr("class", "bar-group")
        .attr("transform", function (d) {
            return "translate(0,0)"; // And this line
        });
            
    
        // Merge the new groups with the update selection
        bars = newGroups.merge(bars);
    
        // Handle the update selection for rectangles
        bars.selectAll("rect")
            .data(function (d) { return d; })
            .transition()
            .duration(1000)
            .attr("x", function (d) { return xScale(d.data.category); })
            .attr("y", function (d) { return yScale(d[1]); })
            .attr("height", function (d) { return yScale(d[0]) - yScale(d[1]); })
            .attr("width", xScale.bandwidth());
    
        // Handle the exit selection for rectangles
        bars.selectAll("rect")
            .data(function (d) { return d; })
            .exit().remove();
    
        // Handle the enter selection for rectangles
        bars.selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return xScale(d.data.category); })
            .attr("y", function (d) { return yScale(d[1]); })
            .attr("height", function (d) { return yScale(d[0]) - yScale(d[1]); })
            .attr("width", xScale.bandwidth())
            .attr("fill", function (d, i, nodes) { 
                return z(d3.select(nodes[i].parentNode).datum().key); 
            })
            .on("mouseover",  handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("mousemove", handleMouseMove);
    
        // Update or create the x-axis
        var xAxisGroup = this.svg.select(".x-axis");
    
        if (xAxisGroup.empty()) {
            xAxisGroup = this.svg.append("g")
                .attr("transform", "translate(0," + this.height + ")")
                .attr("class", "x-axis");
        }
    
        xAxisGroup.transition()
            .duration(1000)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-25)")
            .style("text-anchor", "end")
            .style("fill", d => {
                // Check the 'ignored' property to determine if the label should be grey
                return this.ignore.has(d) ? "grey" : "blue";
            })
            .style("text-decoration", d => {
                // Add strikethrough effect if the 'ignored' property is true
                return this.ignore.has(d) ? "line-through" : "none";
            });
    
        // Update the y-axis
        this.svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScale));


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
                //.attr("fill", "orange"); // Change color on hover
            // console.log(j)
            tooltip.transition()
                .duration(500)
                .style("opacity", 0.9)
                .style("display", 'unset');
            var sum = 0;
            for (var key in j.data) {
                if(key == 'category' || key == 'total') {
                    continue;
                } else {
                    if (j[0] == sum) {
                        window.tooltipString = key + ": " + j.data[key] + " (" + Math.round(((j.data[key]/j.data["total"]) + Number.EPSILON) * 10000) / 100 + "%)";
                        break;
                    } else {
                        sum += j.data[key]
                    }
                }
            }

        }

        function handleMouseOut(d, j) {
            // Restore the opacity of all bars
            svg.selectAll("rect")
                .style("opacity", 1)
                //.attr("fill", "#69b3a2"); // Restore original color on mouseout

            // Hide tooltip
            tooltip.transition()
                .duration(1)
                .style("opacity", 0)
                .style("display", 'none')
        }

        function handleMouseMove(d) {
            // Display tooltip
            // console.log(d)
            var [xpt, ypt] = d3.pointer(d);
            tooltip.html(`${window.tooltipString}`)
                .style("left", (d.clientX + 10) + "px")
                .style("top", (d.clientY - 40) + "px");
        }

        // Add click event for x-axis labels
        const xAxisLabels = d3.selectAll('.x-axis .tick text');

        xAxisLabels.on('click', function(event, d) {
            const category = d;
            console.log(this);
            if(window.stack.ignore.has(d)) {
                window.stack.ignore.delete(d);
                console.log("removing")
                //toggleBarVisibility(category);
            } else {
                window.stack.ignore.add(d);
                //toggleBarVisibility(category);
            }
            console.log(window.stack.ignore);
            //filter.add(filter)
            //filter.push(filter)
            // console.log(queryDict)
            // console.log(filter)
            window.stack.updateFiltergraph(window.stack.currentFilter, window.stack.queryDict, true);
        });
    }
    
    
    
    

    async getData(queryDict) {
        console.log(queryDict);
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

    async getFilterStats(filter, queryDict, persist=false) {
        const [str, list] = filter;

        
        var query = [];
        for (let i = 0; i < list.length; i++) {
            var x = { ...queryDict};
            x[str] = new Set([list[i][1]]);

            query.push(x);
        }

        var data =  [];



        const res = this.query.queryList(query);

        for (let i = 0; i < res.length; i++) {
            var add = {};
            add["category"] = list[i][0];
            if(persist && this.ignore.has(list[i][0])){
                add["Severe or fatal injury"] = 0;
                add["Light or no injury"] = 0;
                add["total"] = 0;//res[i][0];
            } else {
                add["Severe or fatal injury"] = res[i][1][2] + res[i][1][3];
                add["Light or no injury"] = res[i][1][1] + res[i][1][4];
                add["total"] = res[i][0];
            }
            
            // add["heavy"] = res[i][1][2];
            // add["light"] = res[i][1][1] + res[i][1][3] + res[i][1][4];
            data.push(add);
        }


        return data;

    }

}