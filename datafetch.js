
const fs = require('fs').promises;

// Function to fetch and parse CSV data
async function fetchAndParseCSV(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
  
      // Split the CSV into rows
      const rows = data.split('\r\n');
  
      // Assuming the first row contains headers
      const headers = rows[0].split(',');
  
      // Parse the remaining rows
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

// Function to perform a join on two fields
async function joinTables() {
  const users_file = 'Data/users.csv';
  const table1 = await fetchAndParseCSV(users_file);

  const vehicles_file = 'Data/vehicles.csv';
  const table2 = await fetchAndParseCSV(vehicles_file);

  console.log("users:", table1.length);
  console.log("vehicles: ", table2.length);
  // Create a lookup object for the second table based on the join fields
  const lookupTable2 = table2.reduce((lookup, entry) => {

    let key = entry['"num_veh"']; 
    let num_acc = entry['"Num_Acc"'];
    const k = num_acc.concat(key);
    lookup[k] = entry;

    return lookup;
  }, {});

  // Perform the join
  return table1.map(entry1 => {
   
    const key = entry1['"Num_Acc"'] + entry1['"num_veh"'];
    const matchingEntry = lookupTable2[key];
    return { ...entry1, ...matchingEntry };
    
  });
}

async function joinTables3() {
  const characteristics_file = 'Data/caracteristics.csv';
  const table1 = await fetchAndParseCSV(characteristics_file);

  const places_file = 'Data/places.csv';
  const table2 = await fetchAndParseCSV(places_file);
  
  // Create a lookup object for the second table based on the join fields
  const lookupTable2 = table2.reduce((lookup, entry) => {
    const key = entry['"Num_Acc"']; 
    lookup[key] = entry;
    return lookup;
  }, {});

  // Perform the join
  return table1.map(entry1 => { 
    const key = entry1['"Num_Acc"'];
    const matchingEntry = lookupTable2[key];
    return { ...entry1, ...matchingEntry };
  });
}

function joinAll(table1, table2) {
  // Create a lookup object for the second table based on the join fields
  const lookupTable2 = table2.reduce((lookup, entry) => {
    const key = entry['"Num_Acc"'];  
    lookup[key] = entry;
    return lookup;
  }, {});

  // Perform the join
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
    const joinedTable = await joinTables();
    const joinedTable2 = await joinTables3();
  
    const monsterTable = joinAll(joinedTable, joinedTable2);

    const filteredTable = monsterTable.filter(row => row['"an"'] == "15" || row['"an"'] == "14");

    const keysToKeep = ['"atm"', '"int"', '"col"', '"lum"', '"catr"', '"surf"', '"grav"', '"catv"', '"catu"', '"secu"'];

    const newTable = filteredTable.map(row => {
        return Object.keys(row).reduce((newRow, key) => {
            if (keysToKeep.includes(key)) {
                newRow[key] = row[key];
            }
            return newRow;
        }, {});
    });


    console.log(newTable.length);
    let endTime = performance.now();;
    let elapsedTime = endTime - startTime;
    console.log(`Elapsed Time: ${elapsedTime} milliseconds for joining ${joinedTable.length} entries`);

    elapsedTime = endTime - startTime;
    console.log(`Elapsed Time: ${elapsedTime} milliseconds for joining ${monsterTable.length} entries`);

    const csvData = objectToCsv(newTable);
    // const csvA = objectToCsv(joinedTable);
    // const csvB = objectToCsv(joinedTable2);

    // Write data to CSV file
    fs.writeFile('scaled_14_15.csv', csvData, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });

    // // Write data to CSV file
    // fs.writeFile('collection_table.csv', csvData, (err) => {
    //   if (err) throw err;
    //   console.log('The file has been saved!');
    // });

    // // Write data to CSV file
    // fs.writeFile('user_vehicle_table.csv', csvA, (err) => {
    //   if (err) throw err;
    //   console.log('The file has been saved!');
    // });

    // // Write data to CSV file
    // fs.writeFile('char_place_table.csv', csvB, (err) => {
    //   if (err) throw err;
    //   console.log('The file has been saved!');
    // });
  }
  
  // Run the main function
  main();