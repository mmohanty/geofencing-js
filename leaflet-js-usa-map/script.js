// Initialize the map
const map = L.map('map').setView([39.8282, -98.5795], 4); // Center on USA with zoom level 4

// Set basemap (e.g., OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to display coordinates on map click
function onMapClick(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;
  const coordsText = `Coordinates: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`;
  document.getElementById('coordinates').textContent = coordsText;
}

// Enable map click event listener
map.on('click', onMapClick);