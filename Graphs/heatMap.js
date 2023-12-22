import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//This class constructs the heatmap and handles all the update logic
export default class HeatMap {
    constructor(query, id) {
        this.query = query;
        this.id = id;
        this.svg = null;
        this.width = window.innerWidth * 0.2;
        this.height = window.innerHeight * 0.2;
        this.margin = {top: 30, right: 30, bottom: 100, left: 200};
        this.setupHeatMap();
    }

    async setupHeatMap() {
        //This is precomputed data and labels so during launch the heatmap is already visible. This is done to reduce loading time
        const data = [
            [0.0324, 0.0301, 0.0394, 0.0425, 0.0641, 0.0798, 0.0516, 0.0500, 0.0470],
            [0.0114, 0.0063, 0.0051, 0.0000, 0.0431, 0.0189, 0.0602, 0.0243, 0.0168],
            [0.0108, 0.0074, 0.0160, 0.0000, 0.0110, 0.0000, 0.0136, 0.0216, 0.0090],
            [0.0155, 0.0106, 0.0345, 0.0000, 0.0714, 0.0000, 0.0392, 0.0330, 0.0476],
            [0.0062, 0.0023, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0102, 0.0000],
            [0.0150, 0.0126, 0.0216, 0.0000, 0.0597, 0.0000, 0.0132, 0.0215, 0.0161],
            [0.0065, 0.0055, 0.0127, 0.0000, 0.0000, 0.0000, 0.0000, 0.0083, 0.0000],
            [0.0963, 0.0714, 0.2000, 0.0000, 0.0000, 0.0000, 0.2400, 0.0000, 0.0000],
            [0.0272, 0.0125, 0.0096, 0.0000, 0.0000, 0.0000, 0.0370, 0.0463, 0.0690]
        ];
        
        const labelsX = ['Normal', 'Light rain', 'Heavy rain', 'Snow - hail', 'Fog - smoke', 'Strong wind - storm', 'Dazzling weather', 'Cloudy weather', 'Other']
        const labelsY = ['Out of intersection', 'Intersection in X', 'Intersection in T', 'Intersection in Y', 'Intersection with more than 4 branches ', 'Giratory', 'Place', 'Level crossing', 'Other intersection'];
        
        
        this.svg = d3.select("#" + this.id)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // Check for 0 error
        const min = d3.min(data.flat(), d => (d > 0 ? d : Infinity));
        const max = 0.24;

        this.svg.selectAll("*").remove();
    
        const margin = { top: 30, right: 30, bottom: 100, left: 200 };
        const width = 460 - margin.left - margin.right;
        const height = 270 - margin.top - margin.bottom;

        // Create the ranges
        const xScale = d3.scaleBand().range([0, width]).domain(labelsX).padding(0.05);
        const yScale = d3.scaleBand().range([height, 0]).domain(labelsY).padding(0.05);
        const colorScale = d3.scaleSequentialLog()
            .domain([min, max])
            .interpolator(d3.interpolateInferno);

        this.svg.selectAll()
            .data(data.flat())
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(labelsX[i % data[0].length]))
            .attr("y", (d, i) => yScale(labelsY[Math.floor(i / data[0].length)]))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("fill", d => colorScale(d))
            .on("mouseover",  handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("mousemove", handleMouseMove);

        //This adds the x labels            
        this.svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
            .attr("transform", "rotate(-30)")
            .style("text-anchor", "end")
            .attr("dx", "-1em");

        //This adds the y labels
        this.svg.append("g").call(d3.axisLeft(yScale));

        // This defines the gradient for the legend
        const gradient = this.svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        const colors = d3.range(min, max, (max - min) / 100).map(d => colorScale(d));

        colors.forEach((color, i) => {
        gradient.append("stop")
            .attr("offset", i + "%")
            .attr("stop-color", color)
            .attr("stop-opacity", 1);
        });

        
        this.svg.append("rect")
            .attr("x", width + 40)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", height)
            .style("fill", "url(#gradient)");

        const yLegend = d3.scaleLinear().range([height, 0]).domain([min, max]);
        const yAxisLegend = d3.axisRight(yLegend);

        this.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (width + 60) + ",0)") 
            .call(yAxisLegend);

        // When the heatmap is loaded the loading indicator is hidden
        document.getElementById('loading').style.display = 'none';

        // Following lines handle the tooltip
        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")

        var tooltip = this.tooltip;
        var svg = this.svg;

        function handleMouseOver(d, j) {
            svg.selectAll("rect")
                .style("opacity", 0.5);

            d3.select(this)
                .style("opacity", 1)
                .attr("fill", "orange"); 

            tooltip.transition()
                .duration(500)
                .style("opacity", 0.9)
                .style("display", 'unset');
            window.tooltipString = "Fatality Rate" + ": "  + + Math.round((j) * 10000) / 100 + "%";
        }

        function handleMouseOut(d, j) {
            svg.selectAll("rect")
                .style("opacity", 1)
                .attr("fill", "#69b3a2"); 

            tooltip.transition()
                .duration(1)
                .style("opacity", 0)
                .style("display", 'none')
        }

        function handleMouseMove(d) {
            var [xpt, ypt] = d3.pointer(d);
            tooltip.html(`${window.tooltipString}`)
                .style("left", (d.clientX + 10) + "px")
                .style("top", (d.clientY - 40) + "px");
        }
    }

    //This function is called when the heatmap is updated
    //QueryDict is a dictionary of all the filters. LabelsX and labelsY are the names of the filters. Mode is the mode of the heatmap (0 = occurrences, 1 = fatality rate)
    async updateHeater(queryDict, labelsX, labelsY, mode) {

        // Show the loading indicator
        document.getElementById('heatmap').style.display = 'none';
        document.getElementById('loading').style.display = 'block';

        // Wait for the changes to be visible
        await new Promise(resolve => setTimeout(resolve, 0));

        let same = labelsX.every((val, index) => val === labelsY[index]);
        const [data, min, max] =  await this.getData(queryDict, mode, labelsX.length, labelsY.length, same);

        // Check for 0 error
        const adjustedMin = min === 0 ? 0.0001 : min;
        
        this.svg.selectAll("*").remove();
    
        const margin = { top: 30, right: 30, bottom: 100, left: 200 };
        const width = 460 - margin.left - margin.right;
        const height = 270 - margin.top - margin.bottom;
    
        // Create the ranges
        const xScale = d3.scaleBand().range([0, width]).domain(labelsX).padding(0.05);
        const yScale = d3.scaleBand().range([height, 0]).domain(labelsY).padding(0.05);
        const colorScale = d3.scaleSequentialLog()
            .domain([adjustedMin, max])
            .interpolator(d3.interpolateInferno);
        
        //Fill in heatmap
        this.svg.selectAll()
            .data(data.flat())
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(labelsX[i % data[0].length]))
            .attr("y", (d, i) => yScale(labelsY[Math.floor(i / data[0].length)]))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("fill", d => colorScale(d))
            .on("mouseover",  handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("mousemove", handleMouseMove);

            
        this.svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
            .attr("transform", "rotate(-30)")
            .style("text-anchor", "end");

        this.svg.append("g").call(d3.axisLeft(yScale));

        // The following lines are for the legend
        const gradient = this.svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        const colors = d3.range(min, max, (max - min) / 100).map(d => colorScale(d));

        colors.forEach((color, i) => {
        gradient.append("stop")
            .attr("offset", i + "%")
            .attr("stop-color", color)
            .attr("stop-opacity", 1);
        });

        this.svg.append("rect")
            .attr("x", width + 40) 
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", height)
            .style("fill", "url(#gradient)");

        
        const yLegend = d3.scaleLinear().range([height, 0]).domain([min, max]);
        const yAxisLegend = d3.axisRight(yLegend);

        this.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (width + 60) + ",0)") // Adjust this value
            .call(yAxisLegend);



        // Hide the loading indicator
        document.getElementById('loading').style.display = 'none';
        document.getElementById('heatmap').style.display = 'block';
                

        // The following lines are for the tooltip
        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")

        var tooltip = this.tooltip
        var svg = this.svg
        function handleMouseOver(d, j) {
            svg.selectAll("rect")
                .style("opacity", 0.5);

            d3.select(this)
                .style("opacity", 1)
                .attr("fill", "orange"); 

            tooltip.transition()
                .duration(500)
                .style("opacity", 0.9)
                .style("display", 'unset');
            if (mode == 1) {
                window.tooltipString = "Fatality Rate" + ": "  + + Math.round((j) * 10000) / 100 + "%";
            } else {
                window.tooltipString = "Occurrences" + ": "  + j;
            }

        }

        function handleMouseOut(d, j) {
            svg.selectAll("rect")
                .style("opacity", 1)
                .attr("fill", "#69b3a2");

            tooltip.transition()
                .duration(1)
                .style("opacity", 0)
                .style("display", 'none')
        }

        function handleMouseMove(d) {
            var [xpt, ypt] = d3.pointer(d);
            tooltip.html(`${window.tooltipString}`)
                .style("left", (d.clientX + 10) + "px")
                .style("top", (d.clientY - 40) + "px");
        }
    }
    
    
    
    
    //This function retrieves the data from the database and parses into a 2d array so d3 heatmap can use it. Also the min and max values are returned
    //QueryDict is a dictionary of all the filters. Mode is the mode of the heatmap (0 = occurrences, 1 = fatality rate)
    async getData(queryDict, mode, x, y, same=false) {
        var res = [];
        const results = this.query.queryList(queryDict);

        let min = 0;
        let max = 0;

        //This mode is for fatality rate
        if (mode == '1') {
            const transformedData = results.map(result => result[0] == 0 ? 0 : result[1][2] / result[0]);
            min = Math.min(...transformedData);
            max = Math.max(...transformedData);
            for (let i = 0; i < y; i++) {
                res[i] = transformedData.slice(i * x, (i + 1) * x);
            }
        //This mode is for occurrences
        } else {
            const transformedData = results.map(result => result[0]);
            min = Math.min(...transformedData);
            max = Math.max(...transformedData);
            for (let i = 0; i < y; i++) {
                res[i] = transformedData.slice(i * x, (i + 1) * x);
            }
        }
        // This is for the case when the x and y labels are the same and only values on the diaganal should be shown.
        if (same) {
            for(let i=0; i<x; i++) {
                for(let j=0; j<x; j++) {
                    if(i != j) {
                        res[i][j] = 0;
                    }
                }
            }
        }
        return [res, min, max];
    }
}