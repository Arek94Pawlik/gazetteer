<?php

	$executionStartTime = microtime(true) / 1000;
	$APIkey = '27ad0097cbd641ac9916eb4cf9556982';
	/*
	$url='https://api.opencagedata.com/geocode/v1/json?q=51.5074+0.1278&key=27ad0097cbd641ac9916eb4cf9556982';
	*/
	$url='https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST{'LAT'} . '+' . $_REQUEST{'LNG'} . '&key=' . $APIkey;



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
	$output['data'] = $decode['results'];
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
