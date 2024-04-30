const G_KEY = 'AIzaSyAuUWPAVmaPABhNTcGGKtrPT-4gLdvL-f4';
const ICON_PATH = 'icons/';
const PINF = Number.POSITIVE_INFINITY;
const DAY_ICON = 'sun.png';
const NIGHT_ICON = 'moon.png';
const APP_STATE = appState();
const WEATHER_THRESHOLDS = {
    ICON_TEMP :  [
        [10,   'freezing.png'],
        [15,   'cold.png'],
        [27,   'cool.png'],
        [31,   'sweat.png'],
        [PINF, 'melting.png']
    ],
    WIND : [
        [10,   'Calm'],
        [30,   'Light Breeze'],
        [50,   'Moderate Breeze'],
        [75,   'Strong Breeze'],
        [100,  'High Winds'],
        [125,  'Gale'],
        [150,  'Storms'],
        [PINF, 'Holy Shit, Hide!']
    ],
    DRY_CLOUD : [
        [20, { title : 'Clear', icon : 'clear.png' }],
        [40, { title : 'Scattered', icon : 'scattered.png' }],
        [70, { title : 'Partly Cloudy', icon : 'pcloudy.png' }],
        [90, { title : 'Mostly Cloudy', icon : 'mcloudy.png' }],
        [PINF, { title : 'Overcast', icon : 'overcast.png' }],
    ],
    RAIN_CLOUD : [
        [2, { title : 'Light Rain', icon : 'lrain.png' }],
        [6, { title : 'Rainy', icon : 'mrain.png' }],
        [9, { title : 'Moderate Rain', icon : 'mrain.png' }],
        [12, { title : 'Heavy Rain', icon : 'storm.png' }],
        [PINF, { title : 'Very Heavy Rain', icon : 'storm.png' }],
    ]
};

function appState() {
    let latitude;
    let longitude;
    let geolocation = true;
    let mapObj = { map : undefined, marker : undefined, };

    function updateMap(map, marker) {
        mapObj.map = map;
        mapObj.marker = marker;
    }

    function getMap() {
        return mapObj;
    }

    function updateCoords(newLat, newLon) {
        latitude = newLat;
        longitude = newLon;
    }

    function toggleGeoLocation(value) {
        geolocation = value;
    }

    function getCoords() {
        return {
            latitude,
            longitude
        };
    }

    function getLatitude() {
        return latitude;
    }

    function getLongitude() {
        return longitude;
    }

    function isGeolocationActive() {
        return geolocation;
    }

    return { updateCoords, toggleGeoLocation, getCoords, isGeolocationActive, 
            getLatitude, getLongitude, updateMap, getMap };
}

function geoLocSuccess(lat, lng) {
    console.log('GeoLocation Success!');
    console.log(`Latitude: ${lat}`);
    console.log(`Longitude: ${lng}`);
    APP_STATE.updateCoords(lat, lng);
    APP_STATE.toggleGeoLocation(true);
    initMap(lat, lng);
    updateCoordsText(lat, lng);
    callAPIs(lat, lng);
}

function callAPIs(lat, lng) {
    getOpenMeteo(lat, lng, displayCurrentWeather);
    getCity(lat, lng, (city) => updateCityText(city));
}

function geoLocError(error) {
    console.warn(error.message);
}

function getOpenMeteo(lat, lng, callBack) {
    const baseUrl = 'https://api.open-meteo.com/v1/forecast?';
    const urlParams = 'latitude=' + lat + 
                      '&longitude=' + lng + 
                      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto';
    const url = baseUrl + urlParams;
    
    fetch(url)
        .then((response) => response.json())
        .then((json) => callBack(json))
        .catch((error) => console.warn(error));
}

function displayCurrentWeather(data) {
    console.log('Data from Open-Meteo')
    console.log(data);

    const current = data.current;
    const units = data.current_units;

    //Data labels and Icon containers
    const lblElevation = document.getElementById('elevation');
    const lblDate = document.getElementById('current_date');
    const lblTemp = document.getElementById('temp');
    const lblApparentTemp = document.getElementById('apparent_temp');
    const lblHumidity = document.getElementById('humidity');
    const lblPressure = document.getElementById('pressure');
    const lblCloudCover = document.getElementById('cloud_cover');
    const lblCloudDescription = document.getElementById('cloud_description');
    const lblPrecipitation = document.getElementById('precipitation');
    const lblRain = document.getElementById('rain');
    const lblShowers = document.getElementById('showers');
    const lblWindSpeed = document.getElementById('wind_speed');
    const lblWindDirection = document.getElementById('wind_direction');
    const lblWindGusts = document.getElementById('wind_gusts');
    const lblWindDescription = document.getElementById('wind_description');
    const iconTemp = document.getElementById('temp-icon');
    const iconTimeOfDay = document.getElementById('time_of_day');
    const iconCloudCover = document.getElementById('coverage');
    const iconWindDir = document.getElementById('arrow_head');
    
    //Title
    lblElevation.innerHTML = data.elevation + 'm';
    lblDate.innerHTML = formatDate(current.time);

    //Temperatures
    lblTemp.innerHTML = current.temperature_2m + units.temperature_2m;
    lblApparentTemp.innerHTML = current.apparent_temperature + units.temperature_2m;
    lblHumidity.innerHTML = current.relative_humidity_2m + units.relative_humidity_2m;
    lblPressure.innerHTML = current.surface_pressure + units.surface_pressure;
    iconTemp.src = ICON_PATH + WEATHER_THRESHOLDS.ICON_TEMP.find(i => i[0] >= current.temperature_2m)[1];

    //Clouds & Precipitation
    lblCloudCover.innerHTML = current.cloud_cover + units.cloud_cover;
    lblPrecipitation.innerHTML = current.precipitation + units.precipitation;
    lblRain.innerHTML = current.rain + units.rain;
    lblShowers.innerHTML = current.showers + units.showers;
    //Pick icon for the cloud and rain conditions
    if(current.precipitation > 0) {
        const rain = WEATHER_THRESHOLDS.RAIN_CLOUD.find(i => i[0] >= current.precipitation)[1];
        iconCloudCover.src = ICON_PATH + rain.icon;
        lblCloudDescription.innerHTML = rain.title; 
    } else { 
        const clouds = WEATHER_THRESHOLDS.DRY_CLOUD.find(i => i[0] >= current.cloud_cover)[1];
        iconCloudCover.src = ICON_PATH + clouds.icon;
        lblCloudDescription.innerHTML = clouds.title;
    }

    //Winds
    lblWindSpeed.innerHTML = current.wind_speed_10m + units.wind_speed_10m;
    lblWindDirection.innerHTML = current.wind_direction_10m + units.wind_direction_10m;
    lblWindGusts.innerHTML = current.wind_gusts_10m + units.wind_gusts_10m;
    lblWindDescription.innerHTML = WEATHER_THRESHOLDS.WIND.find(i => i[0] >= current.wind_speed_10m)[1];
    //Rotates the wind direction icon accordingly
    iconWindDir.style.transform = `rotate(${current.wind_direction_10m}deg)`;

    //Time of Day
    iconTimeOfDay.src = current.is_day == 1 ? ICON_PATH + DAY_ICON : ICON_PATH + NIGHT_ICON;
}

function updateCoordsText(lat, lng) {
    document.getElementById('lat-input').value = lat;
    document.getElementById('lng-input').value = lng;
}

function updateCityText(city) {
    document.getElementById('city').innerHTML = city;
}

function getCity(lat, lng, callBack) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}` +
                `&result_type=administrative_area_level_2|country&key=${G_KEY}`;
    
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log('Data from Google Geocode API');
            console.log(data);
            const city = data.results[0].formatted_address;
            callBack(city);
        })
        .catch((error) => console.log(error));
}

function getGeoLoc() {
    const geoLocOptions = {
        enableHighAccuracy : true,
        timeout : 5000,
        maximumAge : 0,
    };

    navigator.geolocation.getCurrentPosition((pos) => {
        geoLocSuccess(pos.coords.latitude, pos.coords.longitude);
    }, 
    geoLocError, geoLocOptions);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric', 
        timeZoneName: 'short' 
    };

    return date.toLocaleString('en-US', options);
}

function initAutocomplete(callback) {
    const script = document.createElement("script");
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + G_KEY + '&libraries=places&callback=' + callback.name;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
}

function locationFieldAutoComplete() {
    let element = document.getElementById('location');
    let ac = new google.maps.places.Autocomplete(element, { 
        fields : ['place_id', 'geometry', 'name'], 
    });
    ac.addListener('place_changed', () => {
        let place = ac.getPlace();
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        getWeatherFromCoords(lat, lng);
    });
}

async function initMap(lat, lng) {
    //Weird code from Google Documentation to grab the MAP API
    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})
        ({key: G_KEY, v: "weekly"});

    const position = { lat : lat, lng : lng };
    const { Map } = await google.maps.importLibrary('maps');
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
    
    const map = new Map(document.getElementById('map'), {
        zoom: 11,
        center: position,
        mapId: 'WEATHER-APP',
    });
    const marker = new AdvancedMarkerElement({
        map: map,
        position: position,
        gmpDraggable: true,
        title: 'DRAG',
    });

    marker.addListener('dragend', () => {
        const position = marker.position;
        updateCoordsText(position.lat, position.lng);
    });

    APP_STATE.updateMap(map, marker);
}

function getWeatherFromCoords(lat, lng) {
    let gMap = APP_STATE.getMap();

    gMap.map.setCenter({ lat : parseFloat(lat), lng : parseFloat(lng) });
    gMap.marker.position = { lat : parseFloat(lat), lng : parseFloat(lng) };
    APP_STATE.updateCoords(lat, lng);
    APP_STATE.toggleGeoLocation(false);
    updateCoordsText(lat, lng);
    callAPIs(lat, lng);
}

function initEventListeners() {
    const btnFromCoords = document.getElementById('from-coords');
    const btnFromGeo = document.getElementById('from-geo');
    const btnRefresh = document.getElementById('refresh');

    btnFromCoords.addEventListener('click', () => {
        getWeatherFromCoords(document.getElementById('lat-input').value, 
                             document.getElementById('lng-input').value)
    });

    btnFromGeo.addEventListener('click', getGeoLoc);

    btnRefresh.addEventListener('click', () => {
        if(APP_STATE.isGeolocationActive()) getGeoLoc();
        else {
            const coords = APP_STATE.getCoords();
            callAPIs(coords.latitude, coords.longitude);
        }
    });
}

function init() {
    initEventListeners();
    getGeoLoc();
    initAutocomplete(locationFieldAutoComplete);
}

init();
