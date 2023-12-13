import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


export default class HeatMap {
    constructor(query, id) {
        this.query = query;
        this.id = id;
        this.svg = null;
        this.width = 460;
        this.height = 270;

        this.margin = {top: 30, right: 30, bottom: 100, left: 200};
        this.setupHeatMap();
    }

    async setupHeatMap() {
        // Assuming data is a 2D array representing your heatmap
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

        
        // Create the SVG
        this.svg = d3.select("#" + this.id)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        
      

        const labelsX = ['Normal', 'Light rain', 'Heavy rain', 'Snow - hail', 'Fog - smoke', 'Strong wind - storm', 'Dazzling weather', 'Cloudy weather', 'Other']
        const labelsY = ['Out of intersection', 'Intersection in X', 'Intersection in T', 'Intersection in Y', 'Intersection with more than 4 branches ', 'Giratory', 'Place', 'Level crossing', 'Other intersection'];

        const min = 0;
        const max = 0.24;

        // const [data, min, max] = await this.getData(queryDict, mode, labelsX.length, labelsY.length);
        console.log("data", data);
        console.log("min", min);
        console.log("max", max);
        // Clear the existing heatmap
        this.svg.selectAll("*").remove();
    
        // Define the dimensions of your SVG and heatmap
        const margin = { top: 30, right: 30, bottom: 100, left: 200 };
        const width = 460 - margin.left - margin.right;
        const height = 270 - margin.top - margin.bottom;
    
        // Create the scales
        const xScale = d3.scaleBand().range([0, width]).domain(labelsX).padding(0.05);
        const yScale = d3.scaleBand().range([height, 0]).domain(labelsY).padding(0.05);
        const colorScale = d3.scaleSequential()
            .domain([min, max])
            .interpolator(d3.interpolateInferno);
        // Add the squares
        this.svg.selectAll()
            .data(data.flat())
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(labelsX[i % data[0].length]))
            .attr("y", (d, i) => yScale(labelsY[Math.floor(i / data[0].length)]))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("fill", d => colorScale(d));

        // Add the axes.attr("transform", "translate(-10,0)rotate(-45)")
            
        this.svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        this.svg.append("g").call(d3.axisLeft(yScale));

        // Define the gradient
        const gradient = this.svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        // Create an array of colors
        const colors = d3.range(min, max, (max - min) / 100).map(d => colorScale(d));

        // Add color stops to the gradient
        colors.forEach((color, i) => {
        gradient.append("stop")
            .attr("offset", i + "%")
            .attr("stop-color", color)
            .attr("stop-opacity", 1);
        });

        // Draw the rectangle and fill with gradient
        this.svg.append("rect")
            .attr("x", width + 40) // Adjust this value
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", height)
            .style("fill", "url(#gradient)");

        // Create a scale and axis for the legend
        const yLegend = d3.scaleLinear().range([height, 0]).domain([min, max]);
        const yAxisLegend = d3.axisRight(yLegend);

        this.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (width + 60) + ",0)") // Adjust this value
            .call(yAxisLegend);
    }

    async updateHeater(queryDict, labelsX, labelsY, mode) {
        let startTime = performance.now();
    
 

        const [data, min, max] = await this.getData(queryDict, mode, labelsX.length, labelsY.length);
      
        // Clear the existing heatmap
        this.svg.selectAll("*").remove();
    
        // Define the dimensions of your SVG and heatmap
        const margin = { top: 30, right: 30, bottom: 100, left: 200 };
        const width = 460 - margin.left - margin.right;
        const height = 270 - margin.top - margin.bottom;
    
        // Create the scales
        const xScale = d3.scaleBand().range([0, width]).domain(labelsX).padding(0.05);
        const yScale = d3.scaleBand().range([height, 0]).domain(labelsY).padding(0.05);
        const colorScale = d3.scaleSequential()
            .domain([min, max])
            .interpolator(d3.interpolateInferno);
        // Add the squares
        this.svg.selectAll()
            .data(data.flat())
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(labelsX[i % data[0].length]))
            .attr("y", (d, i) => yScale(labelsY[Math.floor(i / data[0].length)]))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("fill", d => colorScale(d));

            
        this.svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        this.svg.append("g").call(d3.axisLeft(yScale));

        // Define the gradient
        const gradient = this.svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        // Create an array of colors
        const colors = d3.range(min, max, (max - min) / 100).map(d => colorScale(d));

        // Add color stops to the gradient
        colors.forEach((color, i) => {
        gradient.append("stop")
            .attr("offset", i + "%")
            .attr("stop-color", color)
            .attr("stop-opacity", 1);
        });

        // Draw the rectangle and fill with gradient
        this.svg.append("rect")
            .attr("x", width + 40) // Adjust this value
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", height)
            .style("fill", "url(#gradient)");

        // Create a scale and axis for the legend
        const yLegend = d3.scaleLinear().range([height, 0]).domain([min, max]);
        const yAxisLegend = d3.axisRight(yLegend);

        this.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (width + 60) + ",0)") // Adjust this value
            .call(yAxisLegend);
                
        let endTime = performance.now();
        let elapsedTime = endTime - startTime;
        console.log(`Elapsed Time: ${elapsedTime} milliseconds`);

    }
    
    
    
    

    async getData(queryDict, mode, x, y) {
        var res = [];
        const results = this.query.queryList(queryDict);
      
        let min = 0;
        let max = 0;

        if (mode == '1') {
            const transformedData = results.map(result => result[0] == 0 ? 0 : result[1][2] / result[0]);
            min = Math.min(...transformedData);
            max = Math.max(...transformedData);
            for (let i = 0; i < y; i++) {
                res[i] = transformedData.slice(i * x, (i + 1) * x);
            }
        } else {
            const transformedData = results.map(result => result[0]);
            min = Math.min(...transformedData);
            max = Math.max(...transformedData);
            for (let i = 0; i < y; i++) {
                res[i] = transformedData.slice(i * x, (i + 1) * x);
            }
        }
        return [res, min, max];
    }
}