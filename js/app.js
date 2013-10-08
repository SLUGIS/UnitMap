var basemap = new L.TileLayer(baseUrl, {maxZoom: 19, attribution: baseAttribution, subdomains: subdomains, opacity: opacity});

var center = new L.LatLng(0, 0);

var map = new L.Map('map', {center: center, zoom: 2, maxZoom: maxZoom, layers: [basemap]});

//otherBasemaps
//var mbStreets = L.tileLayer('http://{s}.tiles.mapbox.com/v3/slugis.map-56nzvdgc/{z}/{x}/{y}.png', { attribution: 'Map tiles &copy; <a href="http://mapbox.com">MapBox</a>', maxZoom: 19 });

var hotosm = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {attribution: '&copy; <a href="/copyright">OpenStreetMap contributors</a>. Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'});

var combined2011 = L.tileLayer('http://gis.slocounty.ca.gov/arcgis/rest/services/Aerials/2011_Combined_WGSWMAS/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20,
    attribution: 'Data <a href="http://www.slocounty.ca.gov/IT/GIS">San Luis Obispo County</a> | <a href="https://github.com/SLUGIS/leaflet-basic">Code</a>'
});

var oneFoot2007 = L.tileLayer('http://gis.slocounty.ca.gov/arcgis/rest/services/Aerials/2007_Aerials_1ft_WGSWMAS/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20,
    attribution: 'Data <a href="http://www.slocounty.ca.gov/IT/GIS">San Luis Obispo County</a> | <a href="https://github.com/SLUGIS/leaflet-basic">Code</a>'
});

var oneFoot2003 = L.tileLayer('http://gis.slocounty.ca.gov/arcgis/rest/services/Aerials/2003_Aerials_1ft_WGSWMAS/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20,
    attribution: 'Data <a href="http://www.slocounty.ca.gov/IT/GIS">San Luis Obispo County</a> | <a href="https://github.com/SLUGIS/leaflet-basic">Code</a>'
});
//endOtherBasemaps

var popupOpts = {
    autoPanPadding: new L.Point(5, 50),
    autoPan: true
};

var points = L.geoCsv (null, {
    firstLineTitles: true,
    fieldSeparator: fieldSeparator,
    onEachFeature: function (feature, layer) {
        var popup = '<div class="popup-content"><table class="table table-striped table-bordered table-condensed">';
        for (var clave in feature.properties) {
            var title = points.getPropertyTitle(clave).strip();
            var attr = feature.properties[clave];
            if (title == labelColumn) {
                layer.bindLabel(feature.properties[clave], {className: 'map-label'});
            }
            if (attr.indexOf('http') === 0) {
                attr = '<a target="_blank" href="' + attr + '">'+ attr + '</a>';
            }
            if (attr) {
                popup += '<tr><th>'+title+'</th><td>'+ attr +'</td></tr>';
            }
        }
        popup += "</table></popup-content>";
        layer.bindPopup(popup, popupOpts);
    },
    filter: function(feature, layer) {
        total += 1;
        if (!filterString) {
            hits += 1;
            return true;
        }
        var hit = false;
        var lowerFilterString = filterString.toLowerCase().strip();
        $.each(feature.properties, function(k, v) {
            var value = v.toLowerCase();
            if (value.indexOf(lowerFilterString) !== -1) {
                hit = true;
                hits += 1;
                return false;
            }
        });
        return hit;
    }
});

var hits = 0;
var total = 0;
var filterString;
var markers = new L.MarkerClusterGroup();
var dataCsv;

var addCsvMarkers = function() {
    hits = 0;
    total = 0;
    filterString = document.getElementById('filter-string').value;

    if (filterString) {
        $("#clear").fadeIn();
    } else {
        $("#clear").fadeOut();
    }

    map.removeLayer(markers);
    points.clearLayers();

    markers = new L.MarkerClusterGroup(clusterOptions);
    points.addData(dataCsv);
    markers.addLayer(points);

    map.addLayer(markers);
    try {
        var bounds = markers.getBounds();
        if (bounds) {
            map.fitBounds(bounds);
        }
    } catch(err) {
        // pass
    }
    if (total > 0) {
        $('#search-results').html("Showing " + hits + " of " + total);
    }
    return false;
};

var typeAheadSource = [];

function ArrayToSet(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}

function populateTypeAhead(csv, delimiter) {
    var lines = csv.split("\n");
    for (var i = lines.length - 1; i >= 1; i--) {
        var items = lines[i].split(delimiter);
        for (var j = items.length - 1; j >= 0; j--) {
            var item = items[j].strip();
            item = item.replace(/"/g,'');
            if (item.indexOf("http") !== 0 && isNaN(parseFloat(item))) {
                typeAheadSource.push(item);
                var words = item.split(/\W+/);
                for (var k = words.length - 1; k >= 0; k--) {
                    typeAheadSource.push(words[k]);
                }
            }
        }
    }
}

if(typeof(String.prototype.strip) === "undefined") {
    String.prototype.strip = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

var baseLayers = {
    "basemap": basemap,
    "HOTOSM style": hotosm,
    "(2011) combined": combined2011,
    "(2007) 12\"": oneFoot2007,
    "(2003) 12\"": oneFoot2003
};     

L.control.layers(baseLayers, null, {position: 'bottomleft'}).addTo(map);

map.addLayer(markers);

new L.Control.GeoSearch({
        provider: new L.GeoSearch.Provider.Google(),
        position: 'topcenter',
        showMarker: true
    }).addTo(map);

$(document).ready( function() {
    $.ajax ({
        type:'GET',
        dataType:'text',
        url: dataUrl,
        contentType: "text/csv; charset=utf-8",
        error: function() {
            alert('Error retrieving csv file');
        },
        success: function(csv) {
            dataCsv = csv;
            populateTypeAhead(csv, fieldSeparator);
            typeAheadSource = ArrayToSet(typeAheadSource);
            $('#filter-string').typeahead({source: typeAheadSource});
            addCsvMarkers();
        }
    });

    $("#clear").click(function(evt){
        evt.preventDefault();
        $("#filter-string").val("").focus();
        addCsvMarkers();
    });

});
