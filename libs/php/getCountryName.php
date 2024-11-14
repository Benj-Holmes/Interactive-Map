<?php

$file = file_get_contents('../json/countryBorders.geo.json');
$json = json_decode($file, true);

$countries = [];
foreach ($json['features'] as $value) {

   $country = [
       'name' => $value['properties']['name'],
       'iso_a2' => $value['properties']['iso_a2']
   ];
   $countries[] = $country;
}

	// response
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	// $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['countries'] = $countries;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>