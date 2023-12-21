import QueryGraphData from './queryGraphData.js';
import PieChart from './pieChart.js';
import Graphclass from './graphClass.js';
import StackGraph from './stackedGraph.js';
import HeatMap from './heatMap.js';
import { graph } from "./graph.js"
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var queryDict = {};
var defaultStrings = {};
var queryGraphData = new QueryGraphData();
var filterGraph = null;
var heat = null;
var gr = null;
var pie = null;
var openDropdown = null;
var heatMapVals = {1: "atm", 2: "int", 3: '1'};
var lastFilter = ["atm", [['Normal', 1],['Light rain', 2],['Heavy rain', 3],['Snow - hail', 4]
    ,['Fog - smoke', 5],['Strong wind - storm', 6],['Dazzling weather', 7],['Cloudy weather', 8],['Other', 9]]];

async function init() {
    
    await queryGraphData.getAllData('Data/scaled_5432.csv');
    // await queryGraphData.getAllData('Data/scaled_14_15.csv');
    // await queryGraphData.getAllData('Data/scaled_collection.csv');
    console.log("finished loading data");
    setClickListeners();
    pie = new PieChart(queryGraphData, "pie");
    //gr = new Graphclass(queryGraphData, "plot");
    filterGraph = new StackGraph(queryGraphData, "filter");
    heat = new HeatMap(queryGraphData, "heatmap");
    
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

                var selected = queryDict[dropdown.id];
                var dropdownText = document.querySelector('.dropdown-btn[data-dropdown='+ dropdown.id +']');
                if(!defaultStrings[dropdown.id]) {
                    defaultStrings[dropdown.id] = dropdownText.textContent;
                }
                if(!selected) {
                    dropdownText.textContent = defaultStrings[dropdown.id];
                } else {
                    var strings = [];
                    for (let val of selected) {
                        var element = document.querySelector('#' + dropdown.id + ' input[value="' + val + '"]').parentNode;
                        strings.push(" " + element.textContent);
                    }
                    
                    dropdownText.textContent = strings;
                }
                prepareQuery();
            });
        });
    });


    window.handleSelectChange = function(event, d) {
        const selectedValue = event.target.value;
        heatMapVals[d] = selectedValue;
        const valueDivX = document.getElementById(heatMapVals[1]);
        const valueDivY = document.getElementById(heatMapVals[2]);

        var labelsX = valueDivX.querySelectorAll('label');
        var idsX = [];
        var namesX = [];
        for (var i = 0; i < labelsX.length; i++) {
            var value = labelsX[i].querySelector('input[type="checkbox"]').value;
            namesX.push(labelsX[i].textContent);
            idsX.push(parseInt(value));
        }

        var labelsY = valueDivY.querySelectorAll('label');
        var idsY = [];
        var namesY = [];
        for (var i = 0; i < labelsY.length; i++) {
            var value = labelsY[i].querySelector('input[type="checkbox"]').value;
            namesY.push(labelsY[i].textContent);
            idsY.push(parseInt(value));
        }

        var query = [];
        for (let i = 0; i < idsY.length; i++) { 
            for (let j = 0; j < idsX.length; j++) { 
                var dict = {};
                dict[heatMapVals[2]] = new Set([idsY[i]]);
                dict[heatMapVals[1]] = new Set([idsX[j]]);
                query.push(dict);
            }
        }

        heat.updateHeater(query, namesX, namesY, heatMapVals[3]);
       
            
    }
}

function prepareQuery() {
    //gr.updateGraph([queryDict]);
    console.log(queryDict);
    pie.updatePie([queryDict]);
    

    queryGraphData.queryList([{}]);
}

export function updateToFixed(sCase) {
    var guideDict
    if (sCase == 1) {
        guideDict = {"atm": new Set([2]), "lum": new Set([3]), "secu": new Set([12])};
    }
    if (sCase == 2) {
        guideDict = {"atm": new Set([1]), "col": new Set([2, 4]), "lum": new Set([1]), "catr": new Set([4]), "catu": new Set([1, 2]), "secu": new Set([11])};
    }
    if (sCase == 3) {
        guideDict = {"lum": new Set([3]), "catr": new Set([1]), "catu": new Set([3])};
    }
    //Reset Button
    if (sCase == 0) {
        guideDict = {};
    }
    queryDict = guideDict
    
    var dropdowns = document.querySelectorAll('.dropdown-content');
    dropdowns.forEach(function(dropdown) {
        var checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
        //console.log(dropdown);
        checkboxes.forEach(function(checkbox) {

            if(guideDict[dropdown.id]  && guideDict[dropdown.id].has(parseInt(checkbox.value))) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
            var selected = queryDict[dropdown.id];
            var dropdownText = document.querySelector('.dropdown-btn[data-dropdown='+ dropdown.id +']');
            if(!defaultStrings[dropdown.id]) {
                defaultStrings[dropdown.id] = dropdownText.textContent;
            }
            if(!selected) {
                dropdownText.textContent = defaultStrings[dropdown.id];
            } else {
                var strings = [];
                for (let val of selected) {
                    var element = document.querySelector('#' + dropdown.id + ' input[value="' + val + '"]').parentNode;
                    strings.push(" " + element.textContent);
                }
                
                dropdownText.textContent = strings;
            }
        })
    })

    //console.log(lastFilter);
    pie.updatePie([queryDict]);
    filterGraph.updateFiltergraph(lastFilter, queryDict);

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

    lastFilter = filter;
    console.log(filter);
    console.log(queryDict);
 
    if (openDropdown.style.display === "block" && filterGraph.currentFilter[0] != dropdownId) {
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