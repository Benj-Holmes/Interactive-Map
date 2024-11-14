let config = {
	minZoom: 3,
	maxZoom: 25,
	worldCopyJump: true
};

const zoom = 7;
let latitude = '';
let longitude = '';
let iso_a2 = '';
let geoJson = '';
let markers = new L.markerClusterGroup();
let locationMarker = '';
let geoStyle = {
	color: '#6a9ffb',
};

//Map Setup
var map = L.map('map', config).setView([54.1090, -3.2189], zoom);
L.tileLayer('https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=CJDxtYyUBLb2EKwtfHLH30vXTojSFX6oVIl5hG3nl09LIxOxSknML06oYbDK7eWJ', {}).addTo(map);
map.attributionControl.addAttribution("<a href=\"https://www.jawg.io\" target=\"_blank\">&copy; Jawg</a> - <a href=\"https://www.openstreetmap.org\" target=\"_blank\">&copy; OpenStreetMap</a>&nbsp;contributors")

// Displays Preloader Div
$(window).on('load', function() {
	if($('#preloader').length) {
		$('#preloader').delay(1000).fadeOut('slow', function() {
			$(this).remove();
		})
	}
})

// On Page Load, We populate the drop down menu with the list 
// of countries from json file.
$.ajax({
	url: "libs/php/getCountryName.php",
	type: 'GET',
	dataType: 'json',
	success: function(result) {
		if (result) {
			//console.log(JSON.stringify(result));
			const sortedCountries = result.countries.sort(function(a, b) {
				let nameA = a.name.toUpperCase();
				let nameB = b.name.toUpperCase();
				if (nameA < nameB) {
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0;
			})
			sortedCountries.forEach(element => {
				var option = document.createElement("option");
				option.text = element.name;
				option.value = element.iso_a2;
				$('#selectBox').append(option);
			});	
		}
	},
	error: function(jqXHR, textStatus, errorThrown) {
		// your error code
	}
}); 
		
// When a Country is chosen in the drop down, 
// we swap the maps location to the coords of that country
$('#selectBox').change(function() {
		iso_a2 = $(this).val();
		if (geoJson) {
			map.removeLayer(geoJson);
		}
		$.ajax({
			url: "libs/php/getCoordsFromIso.php",
			type: 'GET',
			dataType: 'json',
			data: {
				iso: $(this).val(),
				name: $(this).text()
			},
			success: function(result) {
				//console.log(JSON.stringify(result));
				if (result.status.name == "ok") {
					const data = result.geoJson;
					console.log(data);
					geoJson = L.geoJson(data, { style: geoStyle }).addTo(map);
					}
					console.log(`Iso : ${iso_a2}`);
					getLatLonFromIso(iso_a2);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		}); 
	}
);

const getLatLonFromIso = (iso) => {
	console.log('latlon hit');
	$.ajax({
		url: "libs/php/getLatLonFromIso.php",
		type: 'GET',
		dataType: 'json',
		data: {
			iso: iso
		},
		success: function(result) {
			//console.log(JSON.stringify(result));
			if (result.status.name == "ok") {
				console.log(result.coords[0]);
				const countryLat = result.coords[0];
				const countryLon = result.coords[1];
				map.setView([countryLat, countryLon], 5)
				}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
		}
	}); 
}

const getCoordsFromIso = (iso) => {
	if (geoJson) {
		map.removeLayer(geoJson);
	}
	$.ajax({
		url: "libs/php/getCoordsFromIso.php",
		type: 'GET',
		dataType: 'json',
		data: {
			iso: iso
		},
		success: function(result) {
			//console.log(JSON.stringify(result));
			if (result.status.name == "ok") {
				const data = result.geoJson;
				// console.log(data);
				geoJson = L.geoJson(data, { style: geoStyle }).addTo(map);
				getNearbyWiki();
				//getNearestCity();
				}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
		}
	}); 
}
		
// Gets information for the info Modal
const getBasicInfo = (iso) => {
		$.ajax({
			url: "libs/php/getCountryInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				country: iso,
			},
			success: function(result) {

				function addCommas(population) {
					const formattedPopulation = population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
					return formattedPopulation;
				}

				//console.log(JSON.stringify(result));
				if (result.status.name == "ok") {
					$('#countryName').html(result['data'][0]['countryName']);
					$('#capital').html('Capital: ' + result['data'][0]['capital']);
					$('#continentName').html(result['data'][0]['continentName']);
					$('#population').html('Total Population: ' + addCommas(result['data'][0]['population']));
					getExchangeRate(result['data'][0]['currencyCode']);	
					}
				}
			});
		};
		
		
// From lat/lng, returns Name of location
const reverseGeocode = () => {
	// console.log('revGeo hit');
	$.ajax({
		url: 'libs/php/reverseGeocode.php',
		type: 'GET',
		dataType: 'json',
		data: {
			lat: latitude,
			lon: longitude
		},
		success: function(result) {
			// console.log(JSON.stringify(result));
			if (result.status.name == "ok") {
				if (result.data.length > 0) {
					map.setView([latitude, longitude],11);
					$('#placename').html(result['data'][0]['name']);
					$('#latlon').html('Lat: ' + result['data'][0]['lat'] + ' <br /> Lon: ' + result['data'][0]['lon']);
					$('#placename2').html(result['data'][0]['name']);
					$('#latlon2').html('Lat: ' + result['data'][0]['lat'] + ' <br /> Lon: ' + result['data'][0]['lon']);
					$('#infoModal').modal('show');

					// Calls Basic Info and Flag APIs with ISO code returned from this call
					getBasicInfo(result['data'][0]['country']);
					getFlag(result['data'][0]['country']);
					// Using ISO, get GeoJSON coordinates to populate layer
					getCoordsFromIso(result['data'][0]['country']);
				} 
			}
		}, 
		error: function(jgXHR, textStatus, errorThrown) {
			debugger;
			// error code
		}
	});
};

const get5DayWeather = () => {
	$.ajax({
		url: 'libs/php/get5DayWeather.php',
		type: 'GET',
		dataType: 'json',
		data: {
			lat: latitude,
			lon: longitude
		},
		success: function(result) {
			//console.log(JSON.stringify(result));
			if (result.status.name == "ok") {
				
				// Capitalizes each word returned in Weather Description
				const capitalize = (description) => {
					const finalDesc = description.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
					return finalDesc;
				}
				
				// Turns returned Weather Type into FontAwesome class to render Icon
				const getIconClass = (weatherType, id) => {
					item = document.getElementById(id);
					item.classList.remove('fa-cloud', 'fa-cloud-rain', 'fa-sun', 'fa-snowflake');
					switch(weatherType) {
						case 'Clouds':
							return 'fa-solid fa-cloud fa-4x fa-border';
						case 'Rain':
							return 'fa-solid fa-cloud-rain fa-4x fa-border';
						case 'Clear':
							return 'fa-solid fa-sun fa-4x fa-border';
						case 'Snow':
							return 'fa-solid fa-snowflake fa-4x fa-border';
						default:
							return '';
							}
						}
						
						//Day 1 Weather
						$('#weather1-Date').html('Date: ' + result['data'][0]['date']);
						$('#weather1-Temp').html('Temp: ' + result['data'][0]['temp'] + '&deg;C');
						$('#weather1-Humidity').html('Humidity: ' + result['data'][0]['humidity']);
						$('#weather1-Img').addClass(getIconClass(result['data'][0]['weather'], 'weather1-Img'));
						$('#weather1-Desc').html(capitalize(result['data'][0]['weatherDesc']));
						//Day 2 Weather
						$('#weather2-Date').html('Date: ' + result['data'][1]['date']);
						$('#weather2-Temp').html('Temp: ' + result['data'][1]['temp'] + '&deg;C');
						$('#weather2-Humidity').html('Humidity: ' + result['data'][1]['humidity']);
						$('#weather2-Img').addClass(getIconClass(result['data'][1]['weather'], 'weather2-Img'));
						$('#weather2-Desc').html(capitalize(result['data'][1]['weatherDesc']));
						//Day 3 Weather
						$('#weather3-Date').html('Date: ' + result['data'][2]['date']);
						$('#weather3-Temp').html('Temp: ' + result['data'][2]['temp'] + '&deg;C');
						$('#weather3-Humidity').html('Humidity: ' + result['data'][2]['humidity']);
						$('#weather3-Img').addClass(getIconClass(result['data'][2]['weather'], 'weather3-Img'));
						$('#weather3-Desc').html(capitalize(result['data'][2]['weatherDesc']));
						//Day 4 Weather
						$('#weather4-Date').html('Date: ' + result['data'][3]['date']);
						$('#weather4-Temp').html('Temp: ' + result['data'][3]['temp'] + '&deg;C');
						$('#weather4-Humidity').html('Humidity: ' + result['data'][3]['humidity']);
						$('#weather4-Img').addClass(getIconClass(result['data'][3]['weather'], 'weather4-Img'));
						$('#weather4-Desc').html(capitalize(result['data'][3]['weatherDesc']));
						//Day 5 Weather
						$('#weather5-Date').html('Date: ' + result['data'][4]['date']);
						$('#weather5-Temp').html('Temp: ' + result['data'][4]['temp'] + '&deg;C');
						$('#weather5-Humidity').html('Humidity: ' + result['data'][4]['humidity']);
						$('#weather5-Img').addClass(getIconClass(result['data'][4]['weather'], 'weather5-Img'));
						$('#weather5-Desc').html(capitalize(result['data'][4]['weatherDesc']));
					}
				}, 
				error: function(jgXHR, textStatus, errorThrown) {
					debugger;
					// error code
				}
			});
		}
		
const getFlag = (iso) => {
	$('#flag').attr('crossorigin', "anonymous")
	$('#flag').attr('src', 'https://countryflagsapi.com/png/' + iso);
}

const getExchangeRate = (currencyCode) => {
	$.ajax({
		url: 'libs/php/getExchangeRate.php',
		type: 'GET',
		dataType: 'json',
		data: {
			currencyCode: currencyCode,
		},
		success: function(result) {
			//console.log(JSON.stringify(result));
			if (result.status.name == "ok") {
				$('#currencyCode').html(result['data']['base']);
				$('#exchange1').html('1 ' + result['data']['base'] + ' = ' + result['data']['toGBP'] + ' GBP');
				$('#exchange2').html('1 ' + result['data']['base'] + ' = ' + result['data']['toUSD'] + ' USD');
				$('#exchange3').html('1 ' + result['data']['base'] + ' = ' + result['data']['toEUR'] + ' EUR');
				$('#exchange4').html('1 ' + result['data']['base'] + ' = ' + result['data']['toJPY'] + ' JPY');
				$('#exchange5').html('1 ' + result['data']['base'] + ' = ' + result['data']['toKRW'] + ' KRW');
			}
		},
		error: function(jgXHR, textStatus, errorThrown) {
			debugger;
		}
	});
};

const getNearbyWiki = () => {
	$.ajax({
		url: "libs/php/getNearbyWiki.php",
		type: 'POST',
		dataType: 'json',
		data: {
			lat: latitude,
			lng: longitude
		},
		success: function(result) {
			//console.log(JSON.stringify(result));
			//debugger;
			if (result.status.name == "ok") {

				const determineIcon = (featureType) => {
					switch(featureType) {
						case 'edu':
							var newMarker = L.ExtraMarkers.icon({
								icon: 'fa-school',
								markerColor: 'white',
								shape: 'square',
								iconColor: 'black',
								prefix: 'fa-solid'
							})
							return newMarker;
						case 'landmark':
							var newMarker = L.ExtraMarkers.icon({
								icon: 'fa-landmark-flag',
								markerColor: 'white',
								shape: 'circle',
								iconColor: 'black',
								prefix: 'fa-solid'
							})
							return newMarker;
						case 'city':
							var newMarker = L.ExtraMarkers.icon({
								icon: 'fa-city',
								markerColor: 'white',
								shape: 'star',
								iconColor: 'black',
								prefix: 'fa-solid'
							})
							return newMarker;
						case 'river':
							var newMarker = L.ExtraMarkers.icon({
								icon: 'fa-water',
								markerColor: 'black',
								shape: 'pentagon',
								prefix: 'fa-solid'
							})
							return newMarker;
						case 'railwaystation':
							var newMarker = L.ExtraMarkers.icon({
								icon: 'fa-train',
								markerColor: 'white',
								shape: 'star',
								iconColor: 'black',
								prefix: 'fa-solid'
							})
							return newMarker;
						case 'mountain':
							var newMarker = L.ExtraMarkers.icon({
								icon: 'fa-mountain',
								markerColor: 'black',
								shape: 'square',
								prefix: 'fa-solid'
							})
							return newMarker;
						case 'airport':
							var newMarker = L.ExtraMarkers.icon({
								icon: 'fa-plane-departure',
								markerColor: 'white',
								shape: 'penta',
								iconColor: 'black',
								prefix: 'fa-solid'
							})
							return newMarker;
						default:
							var newMarker = L.ExtraMarkers.icon({
								icon: 'fa-location-dot',
								markerColor: 'black',
								shape: 'circle',
								prefix: 'fa-solid'
							})
							return newMarker;
					}
				};
					
				let points = []
				result.data.geonames.forEach((item) => {
					let point = [item.lat, item.lng, item.title, item.feature, item.summary, item.wikipediaUrl];
					points.push(point);
				})
				for (var i = 0; i < points.length; i++) {
					var a = points[i];
					var title = a[2];
					var summary = a[4];
					var url = a[5]
					var marker = L.marker(new L.LatLng(a[0], a[1]), {
					  title: title,
					  icon: determineIcon(a[3])
					});
					marker.bindPopup(title + '<br />' + summary + `<a href=https://${url} target='_blank'>` + '<p>Read More &#x2192;</p>' + '</a>');
					markers.addLayer(marker);
				  }
				
				  map.addLayer(markers);
			
			}
		},
		error: function(jgXHR, textStatus, errorThrown) {
			debugger;
		}
	})
};

const getNearbyCities = (type) => {
	
	$.ajax({
		url: 'libs/php/getNearbyCities.php',
		type: 'GET',
		dataType: 'json',
		data: {
			lat: latitude,
			lon: longitude
		},
		success: function(result) {
				let personMarker = L.ExtraMarkers.icon({
					icon: 'fa-person',
					markerColor: 'blue-dark',
					shape: 'circle',
					iconColor: 'white',
					prefix: 'fa-solid'
				});
				locationMarker = L.marker([latitude, longitude], {icon: personMarker}).addTo(map);
				if(result.data) {
				place1 = `${result.data[0].name} <br /> Distance: ${result.data[0].distance} miles <hr />`;
				place2 = `${result.data[1].name} <br /> Distance: ${result.data[1].distance} miles <hr />`;
				place3 = `${result.data[2].name} <br /> Distance: ${result.data[2].distance} miles <hr />`;
					locationMarker.bindPopup(`<b> You ${type} Here! </b> <br /> The Nearest Towns are: <hr />` + place1 + place2 + place3);
				} else {
					locationMarker.bindPopup(`<b> You ${type} Here! </b> <br /> No Towns were found Nearby`);
				}
			},
		error: function(jgXHR, textStatus, errorThrown) {
			debugger;
		}
	});
}


// Closes Modals on click
$('.exitButton').click(function() {
	$('#weatherModal').modal('hide');
	$('#infoModal').modal('hide');
});
// Swap between Modals
$('.infoPage').click(function() {
	$('#weatherModal').modal('hide');
	$('#infoModal').modal('show');
});
$('.weatherPage').click(function() {
	$('#infoModal').modal('hide');
	$('#weatherModal').modal('show');
});

//Sets User back to World View if they click on the btn
$('#mapBtn').click(function() {
	map.setView([35.1688559, 7.1054786], 3);
})
//Removes Markers and GeoJson Outline from map if user clicks btn
$('#eraseBtn').click(function() {
	map.removeLayer(geoJson);
	markers.removeLayer(markers);
	// map.removeLayer(locationMarker);
})

//Same Functions but as EasyBtns
L.easyButton('fa-solid fa-earth-americas', function(btn, map) {
	map.setView([35.1688559, 7.1054786], 3);
}).addTo(map);
L.easyButton('fa-solid fa-eraser', function(btn, map) {
	map.removeLayer(geoJson);
	markers.removeLayer(markers);
	// map.removeLayer(locationMarker);
}).addTo(map);

//When user clicks an area on the Map, we get info for that location
map.on("click", function (e) {
	latitude = e.latlng.lat;
	longitude = e.latlng.lng;
	//get Country Name from lat/lng
	reverseGeocode();
	//get5DayWeather (lat/lng/apikey)
	get5DayWeather();
	//getNearestCity (lat/lng/apikey)
	if (locationMarker) {
		map.removeLayer(locationMarker);
	}
	getNearbyCities('Clicked');
});

// When user loads page, we get info for the location
$(document).ready(function() {
	navigator.geolocation.getCurrentPosition((position) => {
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
		reverseGeocode();
		get5DayWeather();
		if (locationMarker) {
			map.removeLayer(locationMarker);
		}
		getNearbyCities('Are');
	  });
});