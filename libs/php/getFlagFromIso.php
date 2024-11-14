<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$url = 'https://countryflagsapi.com/png/' . $_REQUEST['iso'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

$path = 'C:\xampp\htdocs\project1\libs\css\images\flag.png';

file_put_contents($path, $result);

curl_close($ch);

// response
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['url'] = $path;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>