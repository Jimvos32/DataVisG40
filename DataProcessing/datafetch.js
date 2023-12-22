
const fs = require('fs').promises;

// Function to fetch and parse CSV data and put into an object
async function fetchAndParseCSV(filePath) {
    try {

      const data = await fs.readFile(filePath, 'utf-8');
      const rows = data.split('\r\n');
      const headers = rows[0].split(',');
  
      const result = rows.slice(1).map(row => {
        const values = row.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });

      return result;
    } catch (error) {
      console.error('Error fetching or parsing CSV:', error);
    }
  }

// Afunction to join the orignal tables of users and vehichles. Not included for file size reasons
async function joinTables() {
  const users_file = 'Data/users.csv';
  const table1 = await fetchAndParseCSV(users_file);

  const vehicles_file = 'Data/vehicles.csv';
  const table2 = await fetchAndParseCSV(vehicles_file);

  const lookupTable2 = table2.reduce((lookup, entry) => {

    let key = entry['"num_veh"']; 
    let num_acc = entry['"Num_Acc"'];
    const k = num_acc.concat(key);
    lookup[k] = entry;

    return lookup;
  }, {});

  return table1.map(entry1 => {
   
    const key = entry1['"Num_Acc"'] + entry1['"num_veh"'];
    const matchingEntry = lookupTable2[key];
    return { ...entry1, ...matchingEntry };
    
  });
}

// A function to join the characteristics and places tables. Not included for file size reasons
async function joinTables3() {
  const characteristics_file = 'Data/caracteristics.csv';
  const table1 = await fetchAndParseCSV(characteristics_file);

  const places_file = 'Data/places.csv';
  const table2 = await fetchAndParseCSV(places_file);
  
  const lookupTable2 = table2.reduce((lookup, entry) => {
    const key = entry['"Num_Acc"']; 
    lookup[key] = entry;
    return lookup;
  }, {});

  return table1.map(entry1 => { 
    const key = entry1['"Num_Acc"'];
    const matchingEntry = lookupTable2[key];
    return { ...entry1, ...matchingEntry };
  });
}

//Function that join the 2 joined tables into 1
function joinAll(table1, table2) {
  const lookupTable2 = table2.reduce((lookup, entry) => {
    const key = entry['"Num_Acc"'];  
    lookup[key] = entry;
    return lookup;
  }, {});

  return table1.map(entry1 => {  
    const key = entry1['"Num_Acc"'];
    const matchingEntry = lookupTable2[key];
    return { ...entry1, ...matchingEntry };    
  });
}

// Convert object to CSV
function objectToCsv(data) {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));
  for (const row of data) {
      const values = headers.map(header => {
          const escaped = ('' + row[header]).replace(/"/g, '\\"');
          return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}

// Main function
async function main() {
    let startTime = performance.now();

    //There are 3 join table functions so the original tables will not be stored in memory. Joining tables uses around 10GB of RAM
    const joinedTable = await joinTables();
    const joinedTable2 = await joinTables3();
    const monsterTable = joinAll(joinedTable, joinedTable2);


    //Filter used to ensure only data from 2015, 2014, 2013 and 2012 is used
    const a = monsterTable.filter(row => row['"an"'] == "15" || row['"an"'] == "14" || row['"an"'] == "13" || row['"an"'] == "12");
    const filteredTable = a.filter(row => row['"grav"'] == "1" || row['"grav"'] == "2" || row['"grav"'] == "3" || row['"grav"'] == "4");

    const keysToKeep = ['"atm"', '"int"', '"col"', '"lum"', '"catr"', '"surf"', '"grav"', '"catv"', '"catu"', '"secu"'];

    const newTable = filteredTable.map(row => {
        return Object.keys(row).reduce((newRow, key) => {
            if (keysToKeep.includes(key)) {
                newRow[key] = row[key];
            }
            return newRow;
        }, {});
    });


    let endTime = performance.now();;
    
    elapsedTime = endTime - startTime;
    console.log(`Elapsed Time: ${elapsedTime} milliseconds for joining ${monsterTable.length} entries`);

    const csvData = objectToCsv(newTable);
    const csvMonster = objectToCsv(monsterTable);

    // Write data to CSV file
    fs.writeFile('scaled_5432.csv', csvData, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });

    // Write data to CSV file
    fs.writeFile('collection_table.csv', csvMonster, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
  }
  
  main();