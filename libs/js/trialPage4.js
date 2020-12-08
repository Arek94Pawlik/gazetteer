
//Populate the select bar

$('window').ready(function () {


	$.ajax({
		url: "libs/php/initBorders.php",
		type: 'POST',
		dataType: 'json',
		data: {
			
		},
		success: function (result) {

			$('#countries').html(result['data']);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log("countriesError");
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});


});

//initial global variables

var londonLatitude = 51.5074;
var londonLongitude = 0.1278;
var latValue = document.getElementById("latitude");
var lngValue = document.getElementById("longitude");
var latDesc = document.getElementById("latDescription");
var lngDesc = document.getElementById("lngDescription");

//location generator

$('window').ready(function getLocation() {
	if (navigator.geolocation) {
		console.log("nav1");
		navigator.geolocation.getCurrentPosition(definePosition, showError);
	} else {
		console.log("nav2");
		console.log("Geolocation is not supported by this browser.")
		showPosition(londonLatitude, londonLongitude);
	}
});

function definePosition(position) {
	console.log("define1");
	console.log(position);
	latitude = position.coords.latitude;
	console.log(latitude);
	longitude = position.coords.longitude;
	console.log(longitude);
	showPosition(latitude, longitude);
}

//Geolocation position display

function showPosition(lat, lng) {
	latDesc.innerHTML = "Latitude: ";
	latValue.innerHTML = lat;
	lngDesc.innerHTML = "<br>Longitude: ";
	lngValue.innerHTML = lng;
	console.log(lat);
	console.log(lng);
	initialDisplay(lat, lng)
}

function showError(error) {
	switch (error.code) {
		case error.PERMISSION_DENIED:
			console.log("User denied the request for Geolocation.");
			break;
		case error.POSITION_UNAVAILABLE:
			console.log("Location information is unavailable.");
			break;
		case error.TIMEOUT:
			console.log("The request to get user location timed out.");
			break;
		case error.UNKNOWN_ERROR:
			console.log("An unknown error occurred.");
			break;
	}
	showPosition(londonLatitude, londonLongitude);
}

//MAP

$('#mapid').html("<div id='map' style='width: 100%; height: 100%;'></div>");
var exampleCountry = 'United Kingdom';
var osmUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
	osmAttribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> & mdash; Map data & copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
osmLayer = new L.TileLayer(osmUrl, { maxZoom: 18, attribution: osmAttribution });

var map = new L.Map('map');
var marker = null; 
var theCountry = null;
var bounds = null;

//position map and marker

function mapPosition(lat, lng, city) {

	var extraMarker = L.ExtraMarkers.icon({
		shape: 'star',
		markerColor: 'violet',
	});


	map.addLayer(osmLayer);
	map.setView(new L.LatLng(lat, lng), 4);

	if (marker != null) {
		map.removeLayer(marker);
	};

	marker = L.marker([lat, lng], { icon: extraMarker }).addTo(map);
	marker.bindPopup("Welcome to " + city + "!").openPopup();
}

//add borders and fit bounds

function borderBounds(object, region) {

	if (theCountry != null) {
		map.removeLayer(theCountry);
	};

	var boundsStyle = {};

	switch (region) {
		case "Europe":
			boundsStyle = {
				fillColor: "#6369ff",
				color: "#0000ff",
				weight: 3,
				opacity: 1,
				fillOpacity: 0.6
			};
			break;
		case "Asia":
			boundsStyle = {
				fillColor: "#f7fa52", 
				color: "#f8fc00",
				weight: 3,
				opacity: 1,
				fillOpacity: 0.6
			};
			break;
		case "Africa":
			boundsStyle = {
				fillColor: "#ffae45",
				color: "#ff9100",
				weight: 3,
				opacity: 1,
				fillOpacity: 0.6
			};
			break;
		case "Americas":
			boundsStyle = {
				fillColor: "#36db32",
				color: "#00ff00",
				weight: 3,
				opacity: 1,
				fillOpacity: 0.6
			};
			break;
		case "Oceania":
			boundsStyle = {
				fillColor: "#f54949",
				color: "#ff0000",
				weight: 3,
				opacity: 1,
				fillOpacity: 0.6
			};
			break;
    }

	theCountry = L.geoJson(object, boundsStyle).addTo(map);

	bounds = theCountry.getBounds();

	map.fitBounds(bounds);

}

//country selection

$("#countries").on("change", newCountrySelection);

function newCountrySelection(event) {
	selectDisplay(event.target.value);
}

//API calls

function initialDisplay(lat, lng) {


	$.ajax({
		url: "libs/php/initialLoad.php",
		type: 'POST',
		dataType: 'json',
		data: {
			LAT: lat,
			LNG: lng
		},
		success: function (result) {

			if (result) {

				displayInfo(result);

            }

			let currentSelector = result.data.restCountries.alpha3Code;
			let currentCity = result.data.revOpenCage[0].components.city;

			let region = result.data.restCountries.region;

			$('#countries option[value=' + currentSelector + ']').attr('selected', 'selected');
			
			mapPosition(lat, lng, currentCity);
			borderBounds(result.data.GeoBordersData, region);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});


};

function selectDisplay(isoCode) {

	$.ajax({
		url: "libs/php/selectLoad.php",
		type: 'POST',
		dataType: 'json',
		data: {
			ISO: isoCode
		},
		success: function (result) {

			if (result) {

				displayInfo(result);
				let latlng = result.data.ForwardOpenCage.results[0].geometry;
				let city = result.data.restCountries.capital;
				console.log(latlng);
				console.log(latlng['lat']);
				console.log(latlng['lng']);
				console.log(city);
				mapPosition(latlng['lat'], latlng['lng'], city);
				let region = result.data.restCountries.region;
				borderBounds(result.data.GeoBordersData, region);
			}

		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});


};


//Display API results

function displayInfo(result) {

	console.log("displayInfo1");
	console.log(result);

	//country info

	$('#countries').attr('selected', result.data.restCountries.alpha3Code);
	$('#countryInfoTitle').html(result.data.restCountries.nativeName);
	$('#flag-container img').attr('src', result.data.restCountries.flag);
	$('#flag-container img').attr('alt', 'Flag of ' + result.data.restCountries.nativeName);
	$('#capital').html(result.data.restCountries.capital);
	$('#dialing-code').html(result.data.restCountries.callingCodes[0]);
	$('#population').html(result.data.restCountries.population.toLocaleString("en-US"));
	$('#currencies').html(result.data.restCountries.currencies.filter(c => c.name).map(c => `${c.name} (${c.code})`).join(", "));
	$('#region').html(result.data.restCountries.region);
	$('#subregion').html(result.data.restCountries.subregion);

	//weather

	if (result.data.weatherData.cod == 400) {
		$('#weatherResults').css({ 'display': 'none' });
	} else {
		$('#weatherResults').css({ 'display': 'initial' });
		$('#weatherCity').html(result.data.weatherData['name']);
		$('#weatherCountry').html(result.data.weatherData.sys.country);
		$('#weatherIcon').attr("src", "http://openweathermap.org/img/wn/" + result.data.weatherData.weather[0]['icon'] + ".png");
		$('#txtTemp').html((k2c(result.data.weatherData['main']['temp'])).toFixed(2) + "\&degC");
		$('#txtFeelsLike').html((k2c(result.data.weatherData['main']['feels_like'])).toFixed(2) + "\&degC");
		$('#txtTempMin').html((k2c(result.data.weatherData['main']['temp_min'])).toFixed(2) + "\&degC");
		$('#txtTempMax').html((k2c(result.data.weatherData['main']['temp_max'])).toFixed(2) + "\&degC");
		$('#txtPressure').html(result.data.weatherData['main']['pressure'] + "hPa");
		$('#txtHumidity').html(result.data.weatherData['main']['humidity'] + "%");
		$('#txtWindSpeed').html(result.data.weatherData['wind']['speed'] + "M/s<sup>2</sup>");
		$('#windDirection').css({
			'-webkit-transform': 'rotate(' + result.data.weatherData['wind']['deg'] + 'deg)',
			'-moz-transform': 'rotate(' + result.data.weatherData['wind']['deg'] + 'deg)',
			'-ms-transform': 'rotate(' + result.data.weatherData['wind']['deg'] + 'deg)',
			'-o-transform': 'rotate(' + result.data.weatherData['wind']['deg'] + 'deg)',
			'transform': 'rotate(' + result.data.weatherData['wind']['deg'] + 'deg)'
		});
	}

	//exchange

	var base = result.data.restCountries.currencies['0']['code'];

	$('#baseCurrency').html(base);
	$('#txtExchange').empty();
	$.each(result.data.exchange['rates'], function (key, value) {

		$('#txtExchange').append("<tr><td align='right'>" + key + ": </td><td align='right'>" + usd2gbp(value) + "</td></tr>")
	});


	function usd2gbp(value) {
		let rate = value / result.data.exchange.rates[base];
		return rate.toFixed(5);
	}
}

function k2c(kelvin) {
	var celsius = kelvin - 273.15;
	return celsius;
}

