
//initial global variables

var londonLatitude = 51.5074;
var londonLongitude = 0.1278;
var latValue = document.getElementById("latitude");
var lngValue = document.getElementById("longitude");
var latDesc = document.getElementById("latDescription");
var lngDesc = document.getElementById("lngDescription");

//location generator

function getLocation() {
	if (navigator.geolocation) {
		console.log("nav1");
		navigator.geolocation.getCurrentPosition(definePosition, showError);
	} else {
		console.log("nav2");
		console.log("Geolocation is not supported by this browser.")
		showPosition(londonLatitude, londonLongitude);
	}
}

function definePosition(position) {
	console.log("define1");
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
	latValue.innerHTML = latitude;
	lngDesc.innerHTML = "<br>Longitude: ";
	lngValue.innerHTML = longitude;
	reverseOpenCageResults(lat, lng);

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

// instantiate a map

function buildMap(lat, lng, iso_code3, bounds) {
	console.log('mapBuilder1');
	console.log(iso_code3);
	$('#mapid').html("<div id='map' style='width: 100%; height: 100%;'></div>");
	var exampleCountry = 'United Kingdom';
	var osmUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
		osmAttribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> & mdash; Map data & copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
		osmLayer = new L.TileLayer(osmUrl, { maxZoom: 18, attribution: osmAttribution });

	var countries = $.ajax({
		type: 'GET',
		url: "libs/vendors/countryBorders.geo.json",
		dataType: "json",
		success: console.log("County data successfully loaded."),
		error: function (xhr) {
			alert(xhr.statusText)
		}
	})
	// 'northeast' 'southwest'
	$.when(countries).done(function () {
		var map = new L.Map('map');
		map.setView(new L.LatLng(lat, lng), 4);
		map.addLayer(osmLayer);
		var marker = L.marker([lat, lng]).addTo(map);
		
		console.log(bounds);
		console.log(bounds['northeast']);
		let boundaries = (bounds['northeast']) ? 
		[[bounds['northeast']['lat'], bounds['northeast']['lng']], [bounds['southwest']['lat'], bounds['southwest']['lng']]] : [[bounds[0]['lat'], bounds[0]['lng']], [bounds[1]['lat'], bounds[1]['lng']]]
		console.log(boundaries);
		map.fitBounds(boundaries);

		var result = countries.responseJSON;
		console.log("mapBounds");
		console.log(countries.responseJSON);
		console.log(result.feature);

		var theCountry = L.geoJson(result, { filter: countryFilter }).addTo(map);

		function countryFilter(feature) {
			if (feature.properties.iso_a3 === iso_code3) return true
		}

		var places = getLandmarks(lat, lng);

		function getLandmarks(lat, lng) {

			console.log("amadeus1");

			$.ajax({
				url: "libs/php/amadeusToken2.php",
				type: 'POST',
				dataType: 'json',
				data: {
					latitude: lat,
					longitude: lng
				},

				success: function (result) {

					console.log("amadeus2");
					console.log(result);

					landmarks = result['data'];
					console.log(result['data']);

					landmarks.forEach(landmark => L.marker([landmark.geoCode.latitude, landmark.geoCode.longitude]).addTo(map).bindPopup(landmark.name));

				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				}
			});

		}
	});



}

//Reverse OpenCage Ajax call to PHP

function reverseOpenCageResults(lat, lng) {

	console.log("revopencage1");
	console.log(lat);
	console.log(lng);



	$.ajax({
		url: "libs/php/reverseOpenCage.php",
		type: 'POST',
		dataType: 'json',
		data: {
			LAT: lat,
			LNG: lng
		},
		success: function (result) {

			console.log("revopencage2");
			console.log(result);

			if (result.status.name == "ok") {

				console.log("revopencage3");

				$('#reverseOpenCageContinent').html(result['data']['0']['components']['continent']);
				$('#reverseOpenCageCountry').html(result['data']['0']['components']['country']);
				$('#reverseOpenCageCountryAlpha3Code').html(result['data']['0']['components']['ISO_3166-1_alpha-3']);
				$('#reverseOpenCageCity').html(result['data']['0']['components']['city']);
				$('#reverseOpenCageCallingCode').html(result['data']['0']['annotations']['callingcode']);
				$('#reverseOpenCageCurrency').html(result['data']['0']['annotations']['currency']['name']);
				$('#reverseOpenCageAnnotation').html(result['data']['0']['annotations']['currency']['html_entity']);
				$('#reverseOpenCageIsoCode').html(result['data']['0']['annotations']['currency']['iso_code']);
				REST();
				weatherUpdate(result['data']['0']['components']['city']);
			}

		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});


};

//Forward OpenCage Ajax call to PHP

function forwardOpenCageResults(city, country) {

	console.log("forwardopencage1");

	const result = $.ajax({
		url: "libs/php/forwardOpenCage.php",
		type: 'POST',
		dataType: 'json',
		data: {
			PLACENAME: country.replace(' ', '+')
		},
		success: function (result) {

			console.log("forwardopencage2");
			console.log(result);

			if (result.status.name == "ok") {

				console.log("forwardopencage3");

				if (result.data == null) {

					console.log("forwardBackUp1");
					console.log(result);

					const backUpResult = $.ajax({
						url: "libs/php/forwardOpenCage.php",
						type: 'POST',
						dataType: 'json',
						data: {
							PLACENAME: city.replace(' ', '+')
						},
						success: function (result) {

							console.log("forwardBackUp2");
							console.log(result);

							if (result.status.name == "ok") {
								$('#forwardOpenCageContinent').html(result['data']['results']['0']['components']['continent']);
								let country = result['data']['results']['0']['components']['country'];
								$('#forwardOpenCageSovereign').html(country);
								$('#forwardOpenCageCallingCode').html(result['data']['results']['0']['annotations']['callingcode']);

								if (!result['data']['results']['0']['annotations']['currency']) {
									$('#forwardOpenCageCurrency').html("No data.");
									$('#forwardOpenCageAnnotation').html("No data.");
									$('#forwardOpenCageIsoCode').html("No data.");
								} else {
									$('#forwardOpenCageCurrency').html(result['data']['results']['0']['annotations']['currency']['name']);
									$('#forwardOpenCageAnnotation').html(result['data']['results']['0']['annotations']['currency']['html_entity']);
									$('#forwardOpenCageIsoCode').html(result['data']['results']['0']['annotations']['currency']['iso_code']);
								}

								let lat = result['data']['results']['0']['geometry']['lat'];
								let lng = result['data']['results']['0']['geometry']['lng'];
								$('#forwardOpenCageLat').html(lat);
								$('#forwardOpenCageLng').html(lng);
								console.log("forward lat test");
								let bounds = [result['data']['results']['0']['bounds']['northeast'], result['data']['results']['0']['bounds']['southwest']];
								console.log(bounds);
								let iso_code3 = result['data']['results']['0']['components']['ISO_3166-1_alpha-3'];
								console.log(iso_code3);

								buildMap(lat, lng, iso_code3, bounds);
							} else {

								confirm("No map data for the selected country. Please pick a different country");

								$('#forwardOpenCageContinent').html('No data');
								$('#forwardOpenCageSovereign').html('No data');
								$('#forwardOpenCageCallingCode').html('No data');
								$('#forwardOpenCageCurrency').html('No data');
								$('#forwardOpenCageAnnotation').html('No data');
								$('#forwardOpenCageIsoCode').html('No data');
								$('#forwardOpenCageLat').html('No data');
								$('#forwardOpenCageLng').html('No data');
							}

						},
						error: function (jqXHR, textStatus, errorThrown) {
							console.log(jqXHR);
							console.log(textStatus);
							console.log(errorThrown);
						}
					});
				}

				else {

					console.log("forwardopencage5");

					if (result.data.status.code == 400) {

						const backUpResult2 = $.ajax({
							url: "libs/php/forwardOpenCage.php",
							type: 'POST',
							dataType: 'json',
							data: {
								PLACENAME: country.replace(' ', '+')
							},
							success: function (result) {

								console.log("forwardBackUp2");
								console.log(result);

								if (result.status.name == "ok") {
									$('#forwardOpenCageContinent').html(result['data']['results']['0']['components']['continent']);
									let country = result['data']['results']['0']['components']['country'];
									$('#forwardOpenCageSovereign').html(country);
									$('#forwardOpenCageCallingCode').html(result['data']['results']['0']['annotations']['callingcode']);

									if (!result['data']['results']['0']['annotations']['currency']) {
										$('#forwardOpenCageCurrency').html("No data.");
										$('#forwardOpenCageAnnotation').html("No data.");
										$('#forwardOpenCageIsoCode').html("No data.");
									} else {
										$('#forwardOpenCageCurrency').html(result['data']['results']['0']['annotations']['currency']['name']);
										$('#forwardOpenCageAnnotation').html(result['data']['results']['0']['annotations']['currency']['html_entity']);
										$('#forwardOpenCageIsoCode').html(result['data']['results']['0']['annotations']['currency']['iso_code']);
									}

									let lat = result['data']['results']['0']['geometry']['lat'];
									let lng = result['data']['results']['0']['geometry']['lng'];
									$('#forwardOpenCageLat').html(lat);
									$('#forwardOpenCageLng').html(lng);
									console.log("forward lat test");
									let bounds = result['data']['results']['0']['bounds'];
									console.log(bounds);
									let iso_code3 = result['data']['results']['0']['components']['ISO_3166-1_alpha-3'];
									console.log(iso_code3);

									buildMap(lat, lng, iso_code3, bounds);
								} else {

									confirm("No map data for the selected country. Please pick a different country");

									$('#forwardOpenCageContinent').html('No data');
									$('#forwardOpenCageSovereign').html('No data');
									$('#forwardOpenCageCallingCode').html('No data');
									$('#forwardOpenCageCurrency').html('No data');
									$('#forwardOpenCageAnnotation').html('No data');
									$('#forwardOpenCageIsoCode').html('No data');
									$('#forwardOpenCageLat').html('No data');
									$('#forwardOpenCageLng').html('No data');
								}

							},
							error: function (jqXHR, textStatus, errorThrown) {
								console.log(jqXHR);
								console.log(textStatus);
								console.log(errorThrown);
							}
						});
					}
					else {

						console.log("forwardopencage7");

						$('#forwardOpenCageContinent').html(result['data']['results']['0']['components']['continent']);
						let country = result['data']['results']['0']['components']['country'];
						$('#forwardOpenCageSovereign').html(country);
						$('#forwardOpenCageCallingCode').html(result['data']['results']['0']['annotations']['callingcode']);

						if (!result['data']['results']['0']['annotations']['currency']) {
							$('#forwardOpenCageCurrency').html("No data.");
							$('#forwardOpenCageAnnotation').html("No data.");
							$('#forwardOpenCageIsoCode').html("No data.");
						} else {
							$('#forwardOpenCageCurrency').html(result['data']['results']['0']['annotations']['currency']['name']);
							$('#forwardOpenCageAnnotation').html(result['data']['results']['0']['annotations']['currency']['html_entity']);
							$('#forwardOpenCageIsoCode').html(result['data']['results']['0']['annotations']['currency']['iso_code']);
						}

						let lat = result['data']['results']['0']['geometry']['lat'];
						let lng = result['data']['results']['0']['geometry']['lng'];
						$('#forwardOpenCageLat').html(lat);
						$('#forwardOpenCageLng').html(lng);
						console.log("forward lat test");
						let bounds = result['data']['results']['0']['bounds'];
						console.log(bounds);
						let iso_code3 = result['data']['results']['0']['components']['ISO_3166-1_alpha-3'];

						buildMap(lat, lng, iso_code3, bounds);
					}
				}
			}
			console.log("forwardCage8");
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

//REST API functionality



function REST() {

	const countriesList = document.getElementById("countries");
	let countries; // 


	countriesList.addEventListener("change", newCountrySelection);

	function newCountrySelection(event) {
		console.log("country select")
		displayAndForward(event.target.value);
	}

	fetch("https://restcountries.eu/rest/v2/all")
		.then(res => res.json())
		.then(data => initialize(data))
		.catch(err => console.log("Error:", err));

	function initialize(countriesData) {
		countries = countriesData;
		let options = "";

		console.log(countriesData);

		countries.forEach(country => options += `<option value="${country.alpha3Code}">${country.name}</option>`);

		countriesList.innerHTML = options;

		initialDisplay(document.getElementById("reverseOpenCageCountryAlpha3Code").innerHTML);

	}

	function initialDisplay(initValue) {
		let restReturn = displayCountryInfo(initValue);
		console.log("initialDisplay1");
		console.log(restReturn);
		let cageResults = forwardOpenCageResults(restReturn[0], restReturn[2]);
		console.log("initialDisplay2");
		let weatherResults = weatherUpdate(restReturn[0]);
		console.log("initialDisplay3");
		let exchange = exchangeDisplay(restReturn[1]);
		console.log("initialDisplay4");
	}

	function displayAndForward(initValue) {
		let restReturn = displayCountryInfo(initValue);
		console.log("displayAndForward1");
		console.log(restReturn);

		forwardOpenCageResults(restReturn[0], restReturn[2]);

		console.log("displayAndForward3");
		let weatherResults = weatherUpdate(restReturn[0]);
		console.log("displayAndForward4");
		let exchange = exchangeDisplay(restReturn[1]);
		console.log("displayAndForward5");
	}

	function displayCountryInfo(countryByAlpha3Code) {
		const countryData = countries.find(country => country.alpha3Code === countryByAlpha3Code);
		$('#countries').attr('selected', countryData.name);
		$('#countryInfoTitle').html(countryData.name);
		$('#flag-container img').attr('src', countryData.flag);
		$('#flag-container img').attr('alt', 'Flag of ' + countryData.name);
		$('#capital').html(countryData.capital);
		$('#dialing-code').html(countryData.callingCodes[0]);
		$('#population').html(countryData.population.toLocaleString("en-US"));
		$('#currencies').html(countryData.currencies.filter(c => c.name).map(c => `${c.name} (${c.code})`).join(", "));
		$('#region').html(countryData.region);
		$('#subregion').html(countryData.subregion);
		let capital = countryData.capital;
		let currencyCode = countryData.currencies.filter(c => c.name).map(c => c.code)['0'];
		let country = countryData.name;
		console.log(currencyCode);
		return [capital, currencyCode, country];
	}
}


function weatherUpdate(city) {

	console.log("weather1");
	console.log(city);

	$.ajax({
		url: "libs/php/weather.php",
		type: 'POST',
		dataType: 'json',
		data: {
			CITY: city
		},
		success: function (result) {

			console.log("weather2");
			console.log(result);

			if (result) {

				if (result['data']['cod'] == 400) {
					$('#weatherResults').css({ 'display': 'none' });
				} else {
					$('#weatherResults').css({ 'display': 'initial' });
					$('#weatherCity').html(result['data']['name']);
					$('#weatherCountry').html(result['data']['sys']['country']);
					$('#weatherIcon').attr("src", "http://openweathermap.org/img/wn/" + result['data']['weather'][0]['icon'] + ".png");
					$('#txtTemp').html((k2c(result['data']['main']['temp'])).toFixed(2) + "\&degC");
					$('#txtFeelsLike').html((k2c(result['data']['main']['feels_like'])).toFixed(2) + "\&degC");
					$('#txtTempMin').html((k2c(result['data']['main']['temp_min'])).toFixed(2) + "\&degC");
					$('#txtTempMax').html((k2c(result['data']['main']['temp_max'])).toFixed(2) + "\&degC");
					$('#txtPressure').html(result['data']['main']['pressure'] + "hPa");
					$('#txtHumidity').html(result['data']['main']['humidity'] + "%");
					$('#txtWindSpeed').html(result['data']['wind']['speed'] + "M/s<sup>2</sup>");
					$('#windDirection').css({
						'-webkit-transform': 'rotate(' + result['data']['wind']['deg'] + 'deg)',
						'-moz-transform': 'rotate(' + result['data']['wind']['deg'] + 'deg)',
						'-ms-transform': 'rotate(' + result['data']['wind']['deg'] + 'deg)',
						'-o-transform': 'rotate(' + result['data']['wind']['deg'] + 'deg)',
						'transform': 'rotate(' + result['data']['wind']['deg'] + 'deg)'
					});
				}
			}

		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});

};


function k2c(kelvin) {
	var celsius = kelvin - 273.15;
	return celsius;
}

function exchangeDisplay(base) {

	console.log("EX1");

	$.ajax({
		url: "libs/php/exchange.php",
		type: 'POST',
		dataType: 'json',
		data: {

		},
		success: function (result) {

			console.log("EX2");
			console.log(base);
			console.log(result);
			console.log(result['data']['rates'][base]);


			if (result.status.name == "ok") {
				console.log("EX3");

				$('#baseCurrency').html(base);
				$('#txtExchange').empty();
				$.each(result['data']['rates'], function (key, value) {

					$('#txtExchange').append("<tr><td align='right'>" + key + ": </td><td align='right'>" + usd2gbp(value) + "</td></tr>")
				});

				function usd2gbp(value) {
					let rate = value / result['data']['rates'][base];
					return rate.toFixed(5);
				}

			}

		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});


};



