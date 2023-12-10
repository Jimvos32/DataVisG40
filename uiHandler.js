import QueryGraphData from './queryGraphData.js';
import Graphclass from './graphClass.js';
import PieChart from './pieChart.js';
import { graph } from "./graph.js"
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var queryDict = {}
var queryGraphData = new QueryGraphData();
var gr = null;
var pie = null;

async function init() {
    
    await queryGraphData.getAllData('Data/scaled_14_15.csv');
    console.log("finished loading data");
    setClickListeners();
    gr = new Graphclass(queryGraphData, "plot");
    pie = new PieChart(queryGraphData, "pie");
    
    // graph.updateGraph();
    // createGraph(queryGraphData);
}

function setClickListeners() {
    var dropdowns = document.querySelectorAll('.dropdown-content');
    dropdowns.forEach(function(dropdown) {
        var checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(function(checkbox) {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    if (dropdown.id in queryDict && queryDict[dropdown.id] instanceof Set) {
                        queryDict[dropdown.id].add(parseInt(this.value));
                        
                    } else {
                        queryDict[dropdown.id] = new Set([parseInt(this.value)]);
                    }

                    console.log(queryDict);
                } else {
                    if (queryDict[dropdown.id].size == 1) {
                        delete queryDict[dropdown.id];
                    } else {
                        queryDict[dropdown.id].delete(parseInt(this.value));
                    }

                    console.log(queryDict);
                }
                prepareQuery();
            });
        });
    });
}

function prepareQuery() {
    gr.updateGraph([queryDict]);
    pie.updatePie([queryDict]);
    var b = queryGraphData.queryList([{}]);
    console.log(b);
}



init();