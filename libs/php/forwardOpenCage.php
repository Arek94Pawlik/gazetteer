<?php

	$executionStartTime = microtime(true) / 1000;
	$APIkey = '27ad0097cbd641ac9916eb4cf9556982';
	
	$url='https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST{'PLACENAME'} . '&key=' . $APIkey;
	/*
	$url='https://api.opencagedata.com/geocode/v1/json?q=London&key=27ad0097cbd641ac9916eb4cf9556982';
	*/

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL,$url);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
