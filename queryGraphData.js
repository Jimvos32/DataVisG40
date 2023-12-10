

export default class QueryGraphData {
    constructor() {
        this.data =null;

    }

    async init() {
        try {
            this.data = await d3.csv('Data/14_15_table.csv');
        } catch (err) {
            console.log(err);
        }
    }

    QueryGraphData(tuple, filters) {
        const [str, list] = tuple;

        let ret = Array(list.length).fill().map(() => [0, {1: 0, 2: 0, 3: 0, 4: 0}]);

        let startTime = performance.now();

        for (let entry of data) {
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
    }
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