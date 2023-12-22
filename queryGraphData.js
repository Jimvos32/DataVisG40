import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//This class is used to load the data into d3 and can be used to query the data
export default class QueryGraphData {
    constructor() {
        this.data =null;
    }

    //Loads the data into d3
    async getAllData(filePath) {
        try {
            console.log("loading data");
            this.data = await d3.csv(filePath);
        } catch (err) {
            console.log(err);
        }
    }

    //This class is used for the stackedbar chart and returns the total accidents and severity distribution per condioton value
    //Tuple holds the database name for the conditon (weather = 'atm'). And a is a list of all the values the condition can hold
    queryFilterStats(tuple, filters) {
        const [str, list] = tuple;
        console.log(list);

        let ret = Array(list.length).fill().map(() => [0, {1: 0, 2: 0, 3: 0, 4: 0}]);

        let startTime = performance.now();
    
        for (let entry of this.data) {
            let entryStr = parseInt(entry[str]);
            for (let i = 0; i < list.length; i++) {
                if (list[i].has(entryStr)) {
                    for (let key in filters) {
                        let entryKey = parseInt(entry[key]);
                        if (filters[key].has(entryKey)) {
                            ret[i][0] += 1;
                            ret[i][1][parseInt(entry["grav"])] += 1;
                        }
                    }
                }
            }
        }
    
        let endTime = performance.now();
        let elapsedTime = endTime - startTime;
        console.log(`Elapsed Time: ${elapsedTime} milliseconds for a single query`);
    
        return ret
    }
 
    //This is the main function to retrieve data from the database
    //Filters is a list of dictionaries. Each dictionary is a query. The keys are the database names and the values are a set of values to query for.
    queryList(filters) {
        //The return statement gives the total number of accidents and the severity distribution for each query
        let ret = Array(filters.length).fill().map(() => [0, {1: 0, 2: 0, 3: 0, 4: 0}]);
    

        //For each entry in the database it is checked if it matches a query
        for (let entry of this.data) {
            let entryKeys = {};
            for (let key in entry) {
                entryKeys[key] = parseInt(entry[key]);
            }
    
            for (let i = 0; i < filters.length; i++) {
                let valid = true;
                for (let key in filters[i]) {
                    if (!filters[i][key].has(entryKeys[key])) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    ret[i][0] += 1;
                    ret[i][1][entryKeys["grav"]] += 1;
                }
            }
        }
        return ret;
    }

    
}
