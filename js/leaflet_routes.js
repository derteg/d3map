(function(){
	'use strict'
	var loader = document.getElementById('loader');
	// переопределяем проекцию по умолчанию на коническую 'Asia North Albers Equal Area Conic'
	var crs = new L.Proj.CRS('EPSG:102025',
		'+proj=aea +lat_1=15 +lat_2=65 +lat_0=30 +lon_0=95 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs',
		{
			resolutions: [10240, 6144, 4096, 2048, 1024, 512], // задаем допустимые уровни зума
			origin: [0, 0]
		}
	);

	var startView = [64.63,97.08],
		startZoom = 0,
		regionsData,
		groups = [],
		pointsGeoJson,
		routesGeoJson;

	var map = L.map('electromap', {
		crs: crs, 
		maxZoom: crs.options.resolutions.length - 1, 
		minZoom: 0,
	}).setView(startView, startZoom);

	map.dragging.disable();
	map.on('zoomend', function(event) {
		if(event.target['_animateToZoom'] === 0) {
			map.dragging.disable();
			map.setView(startView, startZoom);
		} else {
			map.dragging.enable();
		}
	});

	startPreloader();
	regionsData = new L.GeoJSON.AJAX("ajax/leaflet/adm4_region_compress.geojson", {
		style: regionGetStyle,
		onEachFeature: onEachRegion
	}).addTo(map).on('data:loaded', finishPreloader);

	function startPreloader() {
		loader.style.display = 'block';
		loader.style.opacity = '1';
	}
	function finishPreloader() {
		loader.style.opacity = '0';
		setTimeout(function() {
			loader.style.display = 'none';
		}, 500);
	}

	function onEachRegion() {

	}

	// задаем общие стили для всех регионов
	function regionGetStyle(feature) {
		return {
			color: regionGetColor(feature.properties['adm3_name'], feature.properties.name),
			weight: 1,
			fillColor: regionGetColor(feature.properties['adm3_name'], feature.properties.name),
			fillOpacity: 0.7
		}
	}

	// раскращиваем по общим признакам
	function regionGetColor(d, name) {
		return d === 'Дальневосточный федеральный округ' && (name === 'Республика Саха (Якутия)' || name === 'Чукотский автономный округ' || name === 'Камчатский край' || name === 'Магаданская область') ? '#aee4ff' :
		d === 'Дальневосточный федеральный округ' ? '#68cafd' :
		d === 'Приволжский федеральный округ' ? '#087cdf':
		d === 'Центральный федеральный округ' ? '#68cafd':
		d === 'Северо-Западный федеральный округ' && (name === 'Новгородская область' || name === 'Вологодская область') ? '#68cafd':
		d === 'Северо-Западный федеральный округ' ? '#3fb8ff':
		d === 'Северо-Кавказский федеральный округ' ? '#3fb8ff':
		d === 'Сибирский федеральный округ' ? '#3fb8ff':
		d === 'Уральский федеральный округ' ? '#0099ff':
		d === 'Южный федеральный округ' ? '#3fb8ff':
		'#aee4ff';
	}

	// асинхронно подгружаем точки
	pointsGeoJson = new L.GeoJSON.AJAX('ajax/leaflet_routes/points.geojson', {
		onEachFeature: eachFeaturePoint
	}).addTo(map);

	// задаем стилизацию маркеров
	function eachFeaturePoint(feature, layer) {
		layer.setIcon(L.icon({
			"iconUrl": 'pics/ico_' + feature.properties.power + '.png',
			"iconSize": [29, 32],
			"iconAnchor": [14, 16],
			"className": "map-energy__mark"
		}));
	}

	// асинхронно подгружаем маршруты
	routesGeoJson = new L.GeoJSON.AJAX('ajax/leaflet_routes/routes.geojson', {
		style: setRoutesStyle,
		onEachFeature: eachFeatureRoutes
	}).addTo(map);

	// устанавливаем стилизацию для маршрутов
	function setRoutesStyle (feature) {
		return {
			weight: routeGetWeigh(feature.properties.power),
			color: routeGetColor(feature.properties.power),
			opacity: 1,
			fillOpacity: 1,
			dashArray: 10
		}
	}

	// определяем цвет линии для маршрутов
	function routeGetColor(power) {
		return power === 1000 ? '#f50d6a' : 
		power === 300 ? '#66ff00' : 
		'#fdc01c';
	}

	// определяем толщину линии для маршрутов
	function routeGetWeigh(power) {
		return power === 1000 ? '3' : 
		power === 300 ? '5' : 
		'1';
	}

	function eachFeatureRoutes() {

	}
}());