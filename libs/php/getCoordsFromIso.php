<?php

$file = file_get_contents('../json/countryBorders.geo.json');
$json = json_decode($file, true);
$iso = $_REQUEST['iso'];

$geoJson = [];
foreach ($json['features'] as $value) {

    if ($value['properties']['iso_a2'] == $iso) {
        $geoJson = $value;
    }

};

	// response
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['geoJson'] = $geoJson;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 


?>




