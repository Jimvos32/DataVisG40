// const fs = require('fs').promises;
// const readline = require('readline');
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function getAllData(filePath) {
    try {
      //const data = await fs.readFile(filePath, 'utf-8');
      d3.csv(filePath).then(callBack);
      // Split the CSV into rows
      function callBack(data) {
        console.log(data);
        // const rows = data
    
        // // Assuming the first row contains headers
        // const headers = data.columns
  
        // for (i = 0; i < headers.length; i++) {
        //     headers[i] = headers[i].slice(1,-1);
        // }
    
        // // Parse the remaining rows
        // const result = rows.slice(1).map(row => {
        //   const values = row.split(',');
        //   for (i = 0; i < values.length; i++) {
        //       values[i] = values[i].slice(1,-1);
        //   }
        //   return headers.reduce((obj, header, index) => {
        //     obj[header] = values[index];
        //     return obj;
        //   }, {});
        // });
        main2(data);
      }

    } catch (error) {
      console.error('Error fetching or parsing CSV:', error);
    }
  }


async function main() {
    getAllData('./collection_table.csv');
    
}

function main2(alldata) {
    let startTime = performance.now();

    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });
    console.log(alldata.length);
    //rl.on('line', (input) => {
    test(["lum", [[1], [2], [3,4], [5]]], {"surf" : [2,5,7], "catr" : [1]}, alldata);
        //console.log(`Received: ${input}`);
    //});
    let endTime = performance.now();;
    let elapsedTime = endTime - startTime;
    console.log(`Elapsed Time: ${elapsedTime} milliseconds for retrieving ${alldata.length} entries`);
}

// Function(list, filters)

// Tuple list = ("lum", [[1]])
// Dict filters = [("crossing", [1,2,3,5,6]), ("weather", [1, 3, 5])]



async function queryData(tuple, filters, data, inte) {
    const [str, list] = tuple;
    ret = []
    for (i = 0; i < list.length; i++) {
        let dic = {
            1 : 0,
            2 : 0,
            3 : 0,
            4 : 0
          };
        ret[i] = [0, dic];
    }
    let startTime = performance.now();


    for (let entry of data) {   
        for (i = 0; i < list.length; i++) { 
            if (list[i].includes(parseInt(entry[str]))) {
                for (let key in filters) {
                    if (filters[key].includes(parseInt(entry[key]))) {
                        ret[i][0] += 1;
                        ret[i][1][parseInt(entry["grav"])] += 1;
                    }    
                }   
            }
        }
    }
    console.log(ret)
    

    let endTime = performance.now();;
    let elapsedTime = endTime - startTime;
    console.log(`Elapsed Time: ${elapsedTime} milliseconds for a single query`);


}


async function test(tuple, filters, data) {
    const [str, list] = tuple;
    const listSet = list.map(subList => new Set(subList.map(Number)));
    const filtersSet = Object.fromEntries(Object.entries(filters).map(([key, values]) => [key, new Set(values.map(Number))]));

    let ret = Array(list.length).fill().map(() => [0, {1: 0, 2: 0, 3: 0, 4: 0}]);

    let startTime = performance.now();

    for (let entry of data) {
        let entryStr = parseInt(entry[str]);
        for (let i = 0; i < listSet.length; i++) {
            if (listSet[i].has(entryStr)) {
                for (let key in filtersSet) {
                    let entryKey = parseInt(entry[key]);
                    if (filtersSet[key].has(entryKey)) {
                        ret[i][0] += 1;
                        ret[i][1][parseInt(entry["grav"])] += 1;
                    }
                }
            }
        }
    }

    console.log(ret);

    let endTime = performance.now();
    let elapsedTime = endTime - startTime;
    console.log(`Elapsed Time: ${elapsedTime} milliseconds for a single query`);
}
main();