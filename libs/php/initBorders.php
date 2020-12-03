<?php

$borders = file_get_contents("../vendors/countryBorders.geo.json");

$decode = json_decode($borders,true);

//var_dump($decode['features']);
asort($decode['features']);

$options = "";

foreach($decode['features'] as $country) {
	$options .= "<option value=\"".$country['properties']['iso_a3']."\">".$country['properties']['name']."</option>";
}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['data'] = $options;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
