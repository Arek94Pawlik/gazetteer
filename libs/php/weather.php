<?php

	$executionStartTime = microtime(true) / 1000;
	
	$apiKey='58c7d3b28da61d3cffebdce2d94f9acb';
	
	$url='api.openweathermap.org/data/2.5/weather?q=' . $_REQUEST['CITY'] . '&appid=58c7d3b28da61d3cffebdce2d94f9acb';
	/*
	$url='api.openweathermap.org/data/2.5/weather?q=aberdeen&appid=58c7d3b28da61d3cffebdce2d94f9acb';
	*/
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	/*
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	*/
	$output['data'] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
