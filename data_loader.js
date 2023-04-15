const fs = require('fs');

const date_options = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
};

// Function to read timestamp
function readTimestamp(minutesSinceEpoch) {
    const millisecondsSinceEpoch = minutesSinceEpoch * 60 * 1000;
    const date = new Date(millisecondsSinceEpoch);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
}

// Function to read data in the API and store it in the csv
async function fetchData() {
  try {
    const response = await fetch('https://velib-metropole-opendata.smoove.pro/opendata/Velib_Metropole/station_status.json');
    const data = await response.json();
    
    // Create timestamp, minutes since the Unix epoch
    const timestamp = Math.floor(new Date().getTime() / (1000 * 60));

    // Add data for every stations
    const stations = data.data.stations;
    for (i in stations) {
        fs.appendFileSync('data.csv', [timestamp, stations[i].station_id, stations[i].num_bikes_available_types[0].mechanical, stations[i].num_bikes_available_types[1].ebike, stations[i].num_docks_available].join(';') + '\n');
    }
    console.log(timestamp + " : " + readTimestamp(timestamp))

  } catch (error) {
    console.error(error);
  }
}

// Call every 10 minutes
console.log('Added data with timestamp : ')
fetchData();
// setInterval(fetchData, 10 * 60 * 1000);
setInterval(fetchData, 60000);
