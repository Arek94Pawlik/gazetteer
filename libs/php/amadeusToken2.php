
<?php

	$executionStartTime = microtime(true) / 1000;

	$url = 'https://test.api.amadeus.com/v1/reference-data/locations/pois?latitude=' . $_REQUEST['latitude'] . '&longitude=' . $_REQUEST['longitude'] . '&radius=100&page%5Blimit%5D=100&page%5Boffset%5D=0S';
	//$url = 'https://test.api.amadeus.com/v1/reference-data/locations/pois?latitude=' . $latitude . '&longitude=' . $longitude . '&radius=20&page%5Blimit%5D=100&page%5Boffset%5D=0&categories=SIGHTS';
	//$url = 'https://test.api.amadeus.com/v1/reference-data/locations/pois?latitude=41.397158&longitude=2.160873&radius=20&page%5Blimit%5D=100&page%5Boffset%5D=0&categories=SIGHTS';

	$token_url = 'https://test.api.amadeus.com/v1/security/oauth2/token';
	$client_id = 'OXcyvGke9VYqmWSay3xMmbqBNLQ7I1FK';
	$client_secret = 'pGyVEraJA9e1hYdV';

	
	$access_token = getAccessToken();
	$resource = getResource($access_token);



//	step A, B - single call with client credentials as the basic auth header
//		will return access_token
function getAccessToken() {
	global $token_url, $client_id, $client_secret;

	$content = "grant_type=client_credentials";
	$authorization = base64_encode("$client_id:$client_secret");
	$header = array("Authorization: Basic {$authorization}","Content-Type: application/x-www-form-urlencoded");

	$curl = curl_init();
	curl_setopt_array($curl, array(
		CURLOPT_URL => $token_url,
		CURLOPT_HTTPHEADER => $header,
		CURLOPT_SSL_VERIFYPEER => false,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_POST => true,
		CURLOPT_POSTFIELDS => $content
	));
	$response = curl_exec($curl);
	curl_close($curl);

	//echo json_decode($response)->access_token;

	return json_decode($response)->access_token;
}

//	step B - with the returned access_token we can make as many calls as we want
function getResource($access_token) {
	global $url;

	$header = array("Authorization: Bearer {$access_token}");

	$curl = curl_init();
	curl_setopt_array($curl, array(
		CURLOPT_URL => $url,
		CURLOPT_HTTPHEADER => $header,
		CURLOPT_SSL_VERIFYPEER => false,
		CURLOPT_RETURNTRANSFER => true
	));
	$response = curl_exec($curl);
	curl_close($curl);

	//test print
	echo $response;

	return json_decode($response, true);
}

?>