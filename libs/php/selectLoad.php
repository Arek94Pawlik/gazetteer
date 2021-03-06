<?php

	$executionStartTime = microtime(true) / 500;

	//REST Countries API call

	$urlRestCountries = 'https://restcountries.eu/rest/v2/alpha/'.$_REQUEST['ISO'];

	$rc = curl_init();
	curl_setopt($rc, CURLOPT_URL,$urlRestCountries);
	curl_setopt($rc, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($rc, CURLOPT_RETURNTRANSFER, true);

	$resultRest=curl_exec($rc);

	curl_close($rc);

	$restCountries = json_decode($resultRest,true);	

	$restCity=$restCountries['capital'];
	$restISO=$restCountries['alpha3Code'];

	//weather API call

	$weatherAPIkey =<<APIKEY>>';
	
	$urlWeather='api.openweathermap.org/data/2.5/weather?q=' . $restCity . '&appid='.$weatherAPIkey;
	
	$wd = curl_init();
	curl_setopt($wd, CURLOPT_URL,$urlWeather);
	curl_setopt($wd, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($wd, CURLOPT_RETURNTRANSFER, true);

	$resultWeather=curl_exec($wd);

	curl_close($wd);

	$weatherData = json_decode($resultWeather,true);	

	//exchange API call

	$exchangeAPIkey='<<APIKEY>>';

	$urlExchange='https://openexchangerates.org/api/latest.json?app_id='.$exchangeAPIkey;

	$ex = curl_init();
	curl_setopt($ex, CURLOPT_URL,$urlExchange);
	curl_setopt($ex, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ex, CURLOPT_RETURNTRANSFER, true);

	$resultEX=curl_exec($ex);

	curl_close($ex);

	$exchangeData = json_decode($resultEX,true);
	
	//Borders
	
	$bordersGeo = file_get_contents("../vendors/countryBorders.geo.json");

	$borders = json_decode($bordersGeo,true);

	$iso =$restISO;

	$GeoBorders = array();

	foreach($borders['features'] as $feature) {
		if ($feature['properties']['iso_a3'] == $iso) {
			$GeoBorders[] = $feature['geometry'];
		}	
	}

	//output

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data']['restCountries'] = $restCountries;
	$output['data']['weatherData'] = $weatherData;
	$output['data']['exchange'] = $exchangeData;
	$output['data']['GeoBordersData'] = $GeoBorders;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
