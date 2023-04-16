const fs = require('fs');

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
        content = [
            timestamp,
            stations[i].station_id,
            stations[i].num_bikes_available_types[0].mechanical,
            stations[i].num_bikes_available_types[1].ebike,
            stations[i].num_docks_available,
            stations[i].is_renting,
            stations[i].is_returning
        ];
        fs.appendFileSync('data/data_test.csv', content.join(';') + '\n');
    }
    console.log(timestamp + " : " + readTimestamp(timestamp));

  } catch (error) {
    console.error(error);
  }
}

function scheduleFetchData() {
    const now = new Date();
    const minutes = now.getMinutes();
    const remainder = 10 - (minutes % 10);
    const timeUntilNextCall = remainder * 60 * 1000;

    setTimeout(() => {
        fetchData();
        setInterval(fetchData, 600000);
    }, timeUntilNextCall);
}

scheduleFetchData();
