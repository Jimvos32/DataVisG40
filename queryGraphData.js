import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default class QueryGraphData {
    constructor() {
        this.data =null;
    }

    async getAllData(filePath) {
        try {
            console.log("loading data");
            this.data = await d3.csv(filePath);
            console.log(this.data.length);
        } catch (err) {
            console.log(err);
        }
    }

    queryStats(tuple, filters) {
        const [str, list] = tuple;

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
        console.log(ret);
    
        let endTime = performance.now();
        let elapsedTime = endTime - startTime;
        console.log(`Elapsed Time: ${elapsedTime} milliseconds for a single query`);
    
        return ret
    }

    queryList(filters) {
        let ret = Array(filters.length).fill().map(() => [0, {1: 0, 2: 0, 3: 0, 4: 0}]);
        for (let i = 0; i < filters.length; i++) {
            for (let key in filters[i]) {
                console.log(key, ": ", this.data[0][key]);
            }
        }
        for (let entry of this.data) {

            for (let i = 0; i < filters.length; i++) {
                let valid = true;
                for (let key in filters[i]) {

                    let entryKey = parseInt(entry[key]);
                    if (!filters[i][key].has(entryKey)) {
                        valid = false;
                    }
                }
                if (valid) {
                    ret[i][0] += 1;
                    ret[i][1][parseInt(entry["grav"])] += 1;
                }
            }
        }
        return ret
    }
}
