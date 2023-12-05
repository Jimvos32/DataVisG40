import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
//import { query } from "./queryData.js";

export const graph1 = () =>{
    var container = d3.select("#plot");
    // Declare the chart dimensions and margins.
    const width = 640;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    // Declare the x (horizontal position) scale.
    const x = d3.scaleUtc()
        .domain([new Date("2023-01-01"), new Date("2024-01-01")])
        .range([marginLeft, width - marginRight]);

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    // Add the x-axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x));

    // Add the y-axis.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y));

    // Append the SVG element.
    container.append(svg.node());
    var filePath = './Data/users.csv';
    var data;
    data = d3.csv(filePath);
    console.log(data);
}



export const graph = () =>{
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#plot")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    var filePath = './Data/users.csv';
    var data;
    d3.csv(filePath).then(handleData);

    function handleData(data) {
        console.log(data[99])
        // X axis
        var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.grav; }))
        .padding(0.2);
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([0, 13000])
        .range([ height, 0]);
        svg.append("g")
        .call(d3.axisLeft(y));
        //res = query
        // Bars
        svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", function(d) { return x(d.sexe); })
            .attr("y", function(d) { return y(d.grav); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.grav); })
            .attr("fill", "#69b3a2")
    }



}

//callback function
