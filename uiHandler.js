import QueryGraphData from './queryGraphData.js';
import Graphclass from './graphClass.js';
import PieChart from './pieChart.js';
import StackGraph from './stackedGraph.js';
import { graph } from "./graph.js"
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var queryDict = {}
var queryGraphData = new QueryGraphData();
var filterGraph = new QueryGraphData();
var gr = null;
var pie = null;
var openDropdown = null;

async function init() {
    
    await queryGraphData.getAllData('Data/scaled_14_15.csv');
    console.log("finished loading data");
    setClickListeners();
    gr = new Graphclass(queryGraphData, "plot");
    pie = new PieChart(queryGraphData, "pie");
    filterGraph = new StackGraph(queryGraphData, "filter");
    
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
                } else {
                    if (queryDict[dropdown.id].size == 1) {
                        delete queryDict[dropdown.id];
                    } else {
                        queryDict[dropdown.id].delete(parseInt(this.value));
                    }

                }
                prepareQuery();
            });
        });
    });
}

function prepareQuery() {
    gr.updateGraph([queryDict]);
    pie.updatePie([queryDict]);
    

    queryGraphData.queryList([{}]);
}


export function toggleDropdown(dropdownId) {
    var dropdown = document.getElementById(dropdownId);

    if (openDropdown && openDropdown !== dropdown) {
        openDropdown.style.display = "none";
    }

    dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
    openDropdown = dropdown;

    var filter = [];
    filter.push(dropdownId);
    
    // queryDict[dropdownId] = new Set();
    var labels = dropdown.querySelectorAll('label');

    var ids = []

    for (var i = 0; i < labels.length; i++) {
        var value = labels[i].querySelector('input[type="checkbox"]').value;
        var id = [labels[i].textContent, parseInt(value)];
        ids.push(id);
    }

    filter.push(ids);

    // console.log(openDropdown.style.display);
    
    if (openDropdown.style.display === "block") {
        filterGraph.updateFiltergraph(filter, queryDict);
    }
}

window.onclick = function(event) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
        var dropdown = dropdowns[i];
        if (dropdown.style.display === "block" && !event.target.matches('.dropdown-btn')) {
            dropdown.style.display = "none";
            openDropdown = null;
        }
    }
}


init();