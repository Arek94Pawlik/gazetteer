
//Populate the select bar

$('window').ready(function () {

	console.log("countries1");

	$.ajax({
		url: "libs/php/initBorders.php",
		type: 'POST',
		dataType: 'json',
		data: {

		},
		success: function (result) {

			console.log("countries2");

			let options = '';

			$.each(result.data.countries, function (index, country) {
				options += '<option value="' + country[1] + '">' + country[0] + '</option>'
			});

			$('#countries').html(options);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log("countriesError");
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});


});

//spinner

//initial global variables

var londonLatitude = 51.5074;
var londonLongitude = 0.1278;

//location generator

$('window').ready(function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(definePosition, showError);
	} else {
		console.log("Geolocation is not supported by this browser.")
		showPosition(londonLatitude, londonLongitude);
	}
});

function definePosition(position) {
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
	showPosition(latitude, longitude);
}

//Geolocation position display

function showPosition(lat, lng) {

	initialDisplay(lat, lng);

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
var osmUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
	osmAttribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> & mdash; Map data & copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
osmLayer = new L.TileLayer(osmUrl, { maxZoom: 18, attribution: osmAttribution });

var map = new L.Map('map');
var marker = null;
var theCountry = null;
var bounds = null;

var easyInfo = L.easyButton(
	'fa-info', function (btn, map) {
		$('#myModalInfo').modal('show');
	}).addTo(map);
var easyWeather = L.easyButton(
	'fa-bolt', function (btn, map) {
		$('#myModalWeather').modal('show');
	}).addTo(map);
var easyExchange = L.easyButton(
	'fa-gbp', function (btn, map) {
		$('#myModalEX').modal('show');
	}).addTo(map);
var easyNews = L.easyButton(
	'fas fa-address-card', function (btn, map) {
		$('#myModalNews').modal('show');
	}).addTo(map);


L.Map.include({

	'clear': function () {

		this.eachLayer(function (layer) {

			if (layer.options.pane === "tooltipPane") {

				layer.removeFrom(map);

			}

			if (layer instanceof L.Marker) {

				this.removeLayer(layer);

			}

			if (layer instanceof L.Circle) {

				this.removeLayer(layer);

			}

			if (layer instanceof L.Polygon) {

				this.removeLayer(layer);

			}

			if (layer instanceof L.Polyline) {

				this.removeLayer(layer);

			}

			if (layer instanceof L.CircleMarker) {

				this.removeLayer(layer);

			}
		}, this)
	}
});


//position map and marker

function mapPosition(lat, lng, city) {

	map.addLayer(osmLayer);
	map.setView(new L.LatLng(lat, lng), 4);

	var extraMarker = L.ExtraMarkers.icon({
		shape: 'circle',
		markerColor: 'cyan',
	});

	if (marker != null) {
		map.removeLayer(marker);
	};

	marker = L.marker([lat, lng], { icon: extraMarker }).addTo(map);
	marker.bindPopup("Welcome to " + city + "!<br>Click <strong>here</strong> for pictures").openPopup();
}

function addCities(cities, iso) {

	map.clear();

	let clusters = new L.MarkerClusterGroup().addTo(map);

	let largerCities = new L.featureGroup()
		.addTo(map);

	let largeCities = new L.featureGroup()
		.addTo(map);

	let smallCities = new L.featureGroup()
		.addTo(map);

	let foreignCities = new L.featureGroup()
		.addTo(map);


	var overlayMaps = {
		"Large cities": largerCities,
		"Medium cities": largeCities,
		"Small cities": smallCities,
		"Nearby foreign cities": foreignCities
	};


	//if (layerscontrol) {
	//	layerscontrol.remove();
	//} 

	let layerscontrol = new L.control.layers(null, overlayMaps).addTo(map);

	var foreignCityMarker = L.ExtraMarkers.icon({
		shape: 'star',
		markerColor: 'blue',
	});

	var largerCityMarker = L.ExtraMarkers.icon({
		shape: 'penta',
		markerColor: 'red',
	});

	var largeCityMarker = L.ExtraMarkers.icon({
		shape: 'penta',
		markerColor: 'orange',
	});

	var smallCityMarker = L.ExtraMarkers.icon({
		shape: 'penta',
		markerColor: 'yellow',
	});


	cities.forEach(function (city) {

		if (city.fcode != 'PPLC' && city.countrycode == iso && city.population >= 500000) {
			marker = new L.marker([city.lat, city.lng], { icon: largerCityMarker }).bindPopup("Welcome to " + city.name + "<br> Population:" + city.population + "<br>Click <strong>here</strong> for pictures").addTo(largerCities);
		} else if (city.fcode != 'PPLC' && city.countrycode == iso && city.population < 500000 && city.population >= 200000) {
			marker = new L.marker([city.lat, city.lng], { icon: largeCityMarker }).bindPopup("Welcome to " + city.name + "<br> Population:" + city.population + "<br>Click <strong>here</strong> for pictures").addTo(largeCities);
		} else if (city.fcode != 'PPLC' && city.countrycode == iso && city.population < 200000) {
			marker = new L.marker([city.lat, city.lng], { icon: smallCityMarker }).bindPopup("Welcome to " + city.name + "<br> Population:" + city.population + "<br>Click <strong>here</strong> for pictures").addTo(smallCities);
		} else if (city.countrycode != iso) {
			marker = new L.marker([city.lat, city.lng], { icon: foreignCityMarker }).bindPopup("Welcome to " + city.name + "<br> Population:" + city.population + "<br>Click <strong>here</strong> for pictures").addTo(foreignCities);
		};

	})

	clusters.addLayer(marker);

}

$('#pixacity').click(function () {
	var value = $('#pixacity').val
	console.log(value);

	//$.ajax({
	//	url: "libs/php/pixabay.php",
	//	type: 'POST',
	//	dataType: 'json',
	//	data: {
	//		CITY: city,
	//	},
	//	success: function (result) {

	//		console.log(result);
	//		//var images = '';
	//		//$.each(result.data.hits, function (index, item) {
	//		//	images += "<img src='" + item.previewURL + "'><br />";
	//		//})

	//		//console.log(images);

	//		//$('#images').html(images);


	//	},
	//	error: function (jqXHR, textStatus, errorThrown) {

	//		console.log(jqXHR);
	//		console.log(textStatus);
	//		console.log(errorThrown);
	//	}
	//});

});

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

				console.log(result);
				displayInfo(result);

			}

			let currentCity = null;

			let currentSelector = result.data.restCountries.alpha3Code;
			if (result.data.revOpenCage[0].components.city) {
				currentCity = result.data.revOpenCage[0].components.city;
			} else if (result.data.revOpenCage[0].components.town) {
				currentCity = result.data.revOpenCage[0].components.town;
			}


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

			console.log("select1");

			if (result) {

				displayInfo(result);
				let latlng = result.data.ForwardOpenCage.results[0].geometry;
				let city = result.data.restCountries.capital;
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
	var curName = result.data.restCountries.currencies['0']['name'];
	var curSign = result.data.restCountries.currencies['0']['symbol'];
	$('#baseCurrencyName').html(curName);
	$('#baseCurrencySign').html(curSign);
	$('#txtExchange').empty();
	$.each(result.data.exchange['rates'], function (key, value) {
		let currencyName = '';
		let currencySymbol = '';
		$.each(result.data.currencies, function (index, item) {
			if (key == item.cc) {
				currencyName = item.name;
				currencySymbol = item.symbol;
			}
		});
		$.each(result.data.currencies, function (index, item) {
			if (key == item.cc) {
				$('#txtExchange').append("<tr><td>" + currencyName + " (" + key + ")</td><td>" + usd2gbp(value) + " (" + currencySymbol + ")</td>");
			}
		});
	});


	function usd2gbp(value) {
		let rate = value / result.data.exchange.rates[base];
		return rate.toFixed(5);
	}

	//news

	if (result.data.News.articles.length != 0) {
		$('#newsCountry').html(result.data.restCountries.nativeName);
		$('#newsNavButton').prop('disabled', false);
		$('#newsNavButton').removeClass('nav-link-disabled');
		$('#newsNavButton').removeAttr('data-toggle').removeAttr('data-placement').removeAttr('data-original-title');
		$('#newsNavButton').attr('data-toggle', 'modal');
		let newsArticles = '';
		result.data.News.articles.forEach(function (article) {
			let articleTitle = article.title;
			let articleUrl = article.url;
			let articleUrlToImage = (article.urlToImage != null) ? article.urlToImage : "../images/noimage.png";
			newsArticles += '<tr><td><a class="newsImage" href="' + articleUrl + '" target="_blank"><img src="' + articleUrlToImage + '" /></a></td><td colspan="2"><a href"' + articleUrl + '" target="_blank">' + articleTitle + '</a></td></tr>';
		});
		$('#newsList').html(newsArticles);
	} else {
		$('#newsNavButton').prop('disabled', true);
		$('#newsNavButton').addClass('nav-link-disabled');
		$('#newsNavButton').removeAttr('data-toggle');
		$('#newsNavButton').attr('data-toggle', 'tooltip').attr('data-original-title', 'No news for chosen country');
		$('#newsNavButton').hover(function () {
			$('[data-toggle="tooltip"]').tooltip();
		});
	}


	//places

	var iso2 = result.data.restCountries.alpha2Code;
	var geoCities = result.data.geoPlaces;


	if (result.data.geoPlaces.geonames) {
		addCities(geoCities.geonames, iso2);
	};

	 //covid

	var iso3 = result.data.restCountries.alpha3Code;
	var covidCountry = result.data.restCountries.name;

	$.each(result.data.covid.features, function (index, item) {
		if (item.attributes.ISO3 == iso3) {
			$('#covidCountry').html(covidCountry);
			$('#covidActive').html(item.attributes.Active);
			$('#covidDeaths').html(item.attributes.Deaths);
			$('#covidConfirmed').html(item.attributes.Confirmed);
			$('#covidRecovered').html(item.attributes.Recovered);
        }
	})

	$('#covid').html()

}

function k2c(kelvin) {
	var celsius = kelvin - 273.15;
	return celsius;
}

