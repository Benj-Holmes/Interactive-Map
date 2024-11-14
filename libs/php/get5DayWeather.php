<?php

	// remove for production
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

    $apiKey = "e9648345059080f993c7840452ab1604";
	$url='api.openweathermap.org/data/2.5/forecast?lat=' . $_REQUEST['lat'] . '&lon=' . $_REQUEST['lon'] . '&appid=' . $apiKey . '&units=metric';
	// echo $url;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

    
    $weather = [];
    foreach ($decode['list'] as $value) {
        $day = [
            'date' => date("d-m-Y" , $value['dt']),
            'temp' => $value['main']['temp'],
            'humidity' => $value['main']['humidity'],
            'weather' => $value['weather'][0]['main'],
            'weatherDesc' => $value['weather'][0]['description']
        ];
        $weather[] = $day;
    }
    $dayWeather = [];
    array_push($dayWeather, $weather[0], $weather[8], $weather[16], $weather[24], $weather[32]);
   
	// response
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $dayWeather;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>