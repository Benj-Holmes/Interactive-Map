<?php

$file = file_get_contents('../json/countrycode-latlong-array.json');
$json = json_decode($file, true);
$iso = $_REQUEST['iso'];

$coords = [];
foreach ($json as $key => $value) {
    if ($key == strtolower($iso)) {
        array_push($coords, $value[0], $value[1]);
        
    }
};

// response
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['coords'] = $coords;
	
header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 


?>