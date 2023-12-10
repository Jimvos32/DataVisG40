import QueryGraphData from './queryGraphData.js';

var queryDict = {}
var queryGraphData = new QueryGraphData();


async function init() {
    
    await queryGraphData.getAllData('Data/14_15_table.csv');
    setClickListeners();
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
                        prepareQuery();
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
            });
        });
    });
}

function prepareQuery() {
    console.log()
    var a = queryGraphData.queryStats([lum, [new Set([1])]], queryDict);
    console.log(a);
}

init();