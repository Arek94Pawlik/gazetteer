<?php

	$executionStartTime = microtime(true) / 500;

	//ReverseOpenCage API call


	$openCageAPIkey = <<APIkey>>;

	$urlOpenCage='https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST{'LAT'} . '+' . $_REQUEST{'LNG'} . '&key=' . $openCageAPIkey;


	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL,$urlOpenCage);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	
	$resultOpenCage=curl_exec($ch);

	curl_close($ch);

	$revOpenCage = json_decode($resultOpenCage,true);	
	
	$openCageIsoCode2 = $revOpenCage['results']['0']['components']['ISO_3166-1_alpha-2'];
	$openCageIsoCode3 = $revOpenCage['results']['0']['components']['ISO_3166-1_alpha-3'];
	
	if (isset($revOpenCage['results']['0']['components']['city'])) {
		$revOpenCageCity=$revOpenCage['results']['0']['components']['city'];
	} elseif (isset($revOpenCage['results']['0']['components']['town'])) {
		$revOpenCageCity=$revOpenCage['results']['0']['components']['town'];
	}


	//REST Countries API call

	$urlRestCountries = 'https://restcountries.eu/rest/v2/alpha/'.$openCageIsoCode3;


	$rc = curl_init();
	curl_setopt($rc, CURLOPT_URL,$urlRestCountries);
	curl_setopt($rc, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($rc, CURLOPT_RETURNTRANSFER, true);

	$resultRest=curl_exec($rc);

	curl_close($rc);

	$restCountries = json_decode($resultRest,true);	

	//weather API call

	$weatherAPIkey =<<APIkey>>;
	
	$urlWeather='api.openweathermap.org/data/2.5/weather?q=' . $revOpenCageCity . '&appid='.$weatherAPIkey;
	
	$wd = curl_init();
	curl_setopt($wd, CURLOPT_URL,$urlWeather);
	curl_setopt($wd, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($wd, CURLOPT_RETURNTRANSFER, true);

	$resultWeather=curl_exec($wd);

	curl_close($wd);

	$weatherData = json_decode($resultWeather,true);	
	
	//exchange API call

	$exchangeAPIkey=<<APIkey>>;

	$urlExchange='https://openexchangerates.org/api/latest.json?app_id='.$exchangeAPIkey;

	$ex = curl_init();
	curl_setopt($ex, CURLOPT_URL,$urlExchange);
	curl_setopt($ex, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ex, CURLOPT_RETURNTRANSFER, true);

	$resultEX=curl_exec($ex);

	curl_close($ex);

	$exchangeData = json_decode($resultEX,true);

	//news API call
	
	$apiKeyNews=<<APIkey>>;
	
	$urlNews='https://newsapi.org/v2/top-headlines?country='.$openCageIsoCode2.'&apiKey='.$apiKeyNews;

	$nw = curl_init();
	curl_setopt($nw, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($nw, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($nw, CURLOPT_URL,$urlNews);

	$resultNews=curl_exec($nw);

	curl_close($nw);

	$newsData = json_decode($resultNews,true);
	
	//geoPlaces API call

	$geoNamesUsername=<<APIkey>>;

	$geoCountry = $openCageIsoCode2;
	
	$urlGeoBounds = 'http://api.geonames.org/countryInfoJSON?country='.$geoCountry.'&username='.$geoNamesUsername;

	$gc = curl_init();
	curl_setopt($gc, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($gc, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($gc, CURLOPT_URL,$urlGeoBounds);

	$resultGeoCities=curl_exec($gc);

	curl_close($gc);

	$geoCitiesData = json_decode($resultGeoCities,true);

	$geoBoundSouth = $geoCitiesData['geonames'][0]['south'];
	$geoBoundNorth = $geoCitiesData['geonames'][0]['north'];
	$geoBoundEast = $geoCitiesData['geonames'][0]['east'];
	$geoBoundWest = $geoCitiesData['geonames'][0]['west'];

	
	$urlGeoPlaces='http://api.geonames.org/citiesJSON?maxRows=100&north='.$geoBoundNorth.'&south='.$geoBoundSouth.'&east='.$geoBoundEast.'&west='.$geoBoundWest.'&lang=en&username='.$geoNamesUsername;

	$gp = curl_init();
	curl_setopt($gp, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($gp, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($gp, CURLOPT_URL,$urlGeoPlaces);

	$resultGeoPlaces=curl_exec($gp);

	curl_close($gp);

	$geoPlaces = json_decode($resultGeoPlaces,true);	

	
	$geoPlacesData = array();

	if ($geoPlaces['geonames']) {
		array_push($geoPlacesData, $geoPlaces);
	} else {
		array_push($geoPlacesData, );
	}
	

	//Borders
	
	$bordersGeo = file_get_contents("../vendors/countryBorders.geo.json");

	$borders = json_decode($bordersGeo,true);

	$iso =$openCageIsoCode3;

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
	$output['data']['revOpenCage'] = $revOpenCage['results'];
	$output['data']['restCountries'] = $restCountries;
	$output['data']['weatherData'] = $weatherData;
	$output['data']['exchange'] = $exchangeData;
	$output['data']['GeoBordersData'] = $GeoBorders;
	$output['data']['News'] = $newsData;
	$output['data']['geoPlaces'] = $geoPlaces;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
