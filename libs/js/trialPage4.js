
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
	marker.bindPopup("Welcome to " + city + "!").openPopup();
}

function addCities(cities, iso) {
	console.log(cities);
	console.log(iso);

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

	if (cityMarkers) {
		map.removeLayer(cityMarkers);
	};
	
	var cityMarkers = new L.layerGroup();

	cities.forEach(function (city) {
		//console.log(city);
		
		if (city.fcode != 'PPLC' && city.countrycode == iso && city.population >= 500000) {
			marker = new L.marker([city.lat, city.lng], { icon: largerCityMarker }).bindPopup("Welcome to " + city.name + "!<br> Population:" + city.population).addTo(cityMarkers);
		} else if (city.fcode != 'PPLC' && city.countrycode == iso && city.population < 500000 && city.population >= 200000) {
			marker = new L.marker([city.lat, city.lng], { icon: largeCityMarker }).bindPopup("Welcome to " + city.name + "!<br> Population:" + city.population).addTo(cityMarkers);
		} else if (city.fcode != 'PPLC' && city.countrycode == iso && city.population < 200000) {
			marker = new L.marker([city.lat, city.lng], { icon: smallCityMarker }).bindPopup("Welcome to " + city.name + "!<br> Population:" + city.population).addTo(cityMarkers);
		} else if (city.countrycode != iso) {
			marker = new L.marker([city.lat, city.lng], { icon: foreignCityMarker }).bindPopup("Welcome to " + city.name + "!<br> Population:" + city.population).addTo(cityMarkers);
		};
	})
	 
	cityMarkers.addTo(map);

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

	console.log("initail1");
	console.log(lat);
	console.log(lng);

	$.ajax({
		url: "libs/php/initialLoad.php",
		type: 'POST',
		dataType: 'json',
		data: {
			LAT: lat,
			LNG: lng
		},
		success: function (result) {

			console.log("initail2");

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

	console.log("select1");

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


	console.log("display1");
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

	//news

	if (result.data.News.articles.length != 0) {
		$('#newsCountry').html(result.data.restCountries.nativeName);
		$('#newsNavButton').prop('disabled', false);
		$('#newsNavButton').removeClass('nav-link-disabled');
		$('#newsNavButton').removeAttr('data-toggle').removeAttr('data-placement').removeAttr('data-original-title');
		$('#newsNavButton').attr('data-toggle', 'modal');
		let carouselIndicators = '';
		let newsArticles = '';
		let counter = 0;
		result.data.News.articles.forEach(function (article) {
			if (counter == 0) {
				let articleTitle = article.title;
				let articleUrl = article.url;
				let articleUrlToImage = (article.urlToImage != null) ? article.urlToImage : "../images/noimage.png";
				newsArticles += '<div class="carousel-item active"><div class="card"><div class="card-header">' + articleTitle + '</div><div class="card-body"><a href="' + articleUrl + '" target="_blank"><img src="' + articleUrlToImage + '" /></a></div><div class="card-footer">' + article.description + '</div></div></div>';
				carouselIndicators += '<li data-target="#newsCarousel" data-slide-to="'+counter+'" class="active"></li>';
				counter += 1;
			} else {
				newsArticles += '<div class="carousel-item"><div class="card"><div class="card-header">' + article.title + '</div><div class="card-body"><a href="' + article.url + '" target="_blank"><img src="' + article.urlToImage + '" alt="'+article.title+'" /></a></div><div class="card-footer">' + article.description + '</div></div></div>';
				carouselIndicators += '<li data-target="#newsCarousel" data-slide-to="'+counter+'"></li>';
				counter += 1;
            }
		});
		$('#newsCarouselIndicators').html(carouselIndicators)
		$('#newsCarouselInner').html(newsArticles);
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
		console.log(geoCities);
		addCities(geoCities.geonames, iso2);
	};
	

}

function k2c(kelvin) {
	var celsius = kelvin - 273.15;
	return celsius;
}

