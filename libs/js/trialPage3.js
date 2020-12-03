
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
	console.log("show1");
	console.log(latitude + " and " + longitude);
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

function mapPosition(lat, lng) {

	console.log("mapPosition1");

	map.addLayer(osmLayer);
	map.setView(new L.LatLng(lat, lng), 4);

	if (marker != null) {
		console.log("mapPosition2");
		map.removeLayer(marker);
	};

	marker = L.marker([lat, lng]).addTo(map);

}

//add borders and fit bounds

function borderBounds(object) {

	if (theCountry != null) {
		console.log("mapPosition2");
		map.removeLayer(theCountry);
	};

	theCountry = L.geoJson(object).addTo(map);

	bounds = theCountry.getBounds();

	map.fitBounds(bounds);

}

//country selection

$("#countries").on("change", newCountrySelection);

function newCountrySelection(event) {
	console.log("select1");
	console.log(event.target.value);
	selectDisplay(event.target.value);
}

//API calls

function initialDisplay(lat, lng) {

	console.log("initialLoad1");

	$.ajax({
		url: "libs/php/initialLoad.php",
		type: 'POST',
		dataType: 'json',
		data: {
			LAT: lat,
			LNG: lng
		},
		success: function (result) {

			console.log("initialLoad2");

			if (result) {

				console.log("initialLoad3");

				displayInfo(result);

            }

			mapPosition(lat, lng);
			borderBounds(result.data.GeoBordersData);
			console.log("initialLoad4");
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});


};

function selectDisplay(isoCode) {

	console.log("selectLoad1");
	console.log(isoCode);

	$.ajax({
		url: "libs/php/selectLoad.php",
		type: 'POST',
		dataType: 'json',
		data: {
			ISO: isoCode
		},
		success: function (result) {

			console.log("selectLoad2");

			if (result) {

				console.log("selectLoad3");

				displayInfo(result);
				let latlng = result.data.restCountries.latlng;
				mapPosition(latlng[0], latlng[1]);
				borderBounds(result.data.GeoBordersData);
			}

			
			console.log("selectLoad4");
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

	console.log(base);

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

