<?php

	// remove for production

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$url='https://v6.exchangerate-api.com/v6/e9e4e384ad98e9d890805d33/latest/' . $_REQUEST['currencyCode'];

	// 'https://v6.exchangerate-api.com/v6/e9e4e384ad98e9d890805d33/latest/' . $_REQUEST['currencyCode']'
    
    $ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);

    
    $exchangeRate = [
        'base' => $decode['base_code'],
        'toGBP' => $decode['conversion_rates']['GBP'],
        'toUSD' => $decode['conversion_rates']['USD'],
        'toEUR' => $decode['conversion_rates']['EUR'],
        'toJPY' => $decode['conversion_rates']['JPY'],
        'toKRW' => $decode['conversion_rates']['KRW']
    ];
    

	// response
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $exchangeRate;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>