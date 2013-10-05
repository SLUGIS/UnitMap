var dataUrl = 'data/data.csv';
var maxZoom = 19;
var fieldSeparator = ',';
var baseUrl = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
var baseAttribution = '&copy; <a href="/copyright">OpenStreetMap contributors</a>. Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>';
var subdomains = 'abcd';
var clusterOptions = {showCoverageOnHover: false, maxClusterRadius: 50};
var labelColumn = "name";
var opacity = 1.0;