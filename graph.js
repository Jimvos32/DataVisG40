import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { test } from "./queryData.js"
//import { query } from "./queryData.js";

// export const graph1 = () =>{
//     var container = d3.select("#plot");
//     // Declare the chart dimensions and margins.
//     const width = 640;
//     const height = 400;
//     const marginTop = 20;
//     const marginRight = 20;
//     const marginBottom = 30;
//     const marginLeft = 40;

//     // Declare the x (horizontal position) scale.
//     const x = d3.scaleUtc()
//         .domain([new Date("2023-01-01"), new Date("2024-01-01")])
//         .range([marginLeft, width - marginRight]);

//     // Declare the y (vertical position) scale.
//     const y = d3.scaleLinear()
//         .domain([0, 100])
//         .range([height - marginBottom, marginTop]);

//     // Create the SVG container.
//     const svg = d3.create("svg")
//         .attr("width", width)
//         .attr("height", height);

//     // Add the x-axis.
//     svg.append("g")
//         .attr("transform", `translate(0,${height - marginBottom})`)
//         .call(d3.axisBottom(x));

//     // Add the y-axis.
//     svg.append("g")
//         .attr("transform", `translate(${marginLeft},0)`)
//         .call(d3.axisLeft(y));

//     // Append the SVG element.
//     container.append(svg.node());
//     var filePath = './Data/users.csv';
//     var data;
//     data = d3.csv(filePath);
//     console.log(data);
// }



export const graph = () =>{

    // dimensions
    var margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // remove previous graph
    d3.select("#plot").select("svg").remove();

    // add graph to document
    var svg = d3.select("#plot")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    var data = test(["lum", [[1], [2], [3], [4], [5]]], {"surf" : [2,5,7], "catr" : [1]}, window.data)
    var sumCount = data.reduce((sum, element) => {
        return sum + element[0]
      },0);

    var xDomain = ["1", "2", "3", "4", "5"] //Need dictionary mapping
    var xScale = d3.scaleBand()
    .domain(xDomain)
    .range([ 0, width ])
    .padding(0.2);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    var yScale = d3.scaleLinear() 
    .domain([0, sumCount])
    .range([ height, 0]);
    svg.append("g")
    .call(d3.axisLeft(yScale));
    // Bars
    console.log(data)
    svg.selectAll("mybar")
    .data(data)
    .enter()
    .append("rect")
        .attr("x", (d, i) => xScale(xDomain[i]))
        .attr("y", d => yScale(d[0]))
        .attr("width", xScale.bandwidth())
        .attr("height", dval => height - yScale(dval[0]))
        .attr("fill", "#69b3a2")




}

//callback function
