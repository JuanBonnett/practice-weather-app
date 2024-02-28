const G_KEY = 'AIzaSyAuUWPAVmaPABhNTcGGKtrPT-4gLdvL-f4';
const ICON_PATH = 'icons/';
const PINF = Number.POSITIVE_INFINITY;
const DAY_ICON = 'sun.png';
const NIGHT_ICON = 'moon.png';

const ICON_TEMP_THRESHOLDS = [
    [10,   'freezing.png'],
    [15,   'cold.png'],
    [27,   'cool.png'],
    [31,   'sweat.png'],
    [PINF, 'melting.png']
];

const WIND_THRESHOLDS = [
    [10,   'Calm'],
    [30,   'Light Breeze'],
    [50,   'Moderate Breeze'],
    [75,   'Strong Breeze'],
    [100,  'High Winds'],
    [125,  'Gale'],
    [150,  'Storms'],
    [PINF, 'Holy Shit, Hide!']
];

const DRY_CLOUD_THRESHOLDS = [
    [20, { title : 'Clear', icon : 'clear.png' }],
    [40, { title : 'Scattered', icon : 'scattered.png' }],
    [70, { title : 'Partly Cloudy', icon : 'pcloudy.png' }],
    [90, { title : 'Mostly Cloudy', icon : 'mcloudy.png' }],
    [PINF, { title : 'Overcast', icon : 'overcast.png' }],
];

const RAIN_CLOUD_THRESHOLDS = [
    [2, { title : 'Light Rain', icon : 'lrain.png' }],
    [6, { title : 'Rainy', icon : 'mrain.png' }],
    [9, { title : 'Moderate Rain', icon : 'mrain.png' }],
    [12, { title : 'Heavy Rain', icon : 'storm.png' }],
    [PINF, { title : 'Very Heavy Rain', icon : 'storm.png' }],
];

const appState = {
    pos : {},
    geolocation : false,
};

const btnFromCoords = document.getElementById('from-coords');
const btnFromGeo = document.getElementById('from-geo');
const btnRefresh = document.getElementById('refresh');

function geoLocSuccess(pos) {
    console.log('GeoLocation Success!');
    console.log(`Latitude: ${pos.coords.latitude}`);
    console.log(`Longitude: ${pos.coords.longitude}`);
    document.getElementById('lat-input').value = pos.coords.latitude;
    document.getElementById('lon-input').value = pos.coords.longitude;

    callAPIs(pos);
    appState.geolocation = true;
}

function callAPIs(pos) {
    getOpenMeteo(pos.coords, displayCurrentWeather);
    getCity(pos.coords, (city) => {
        document.getElementById('city').innerHTML = city;
    });

    appState.pos = pos;
}

function geoLocError(error) {
    console.warn(error.message);
}

function getOpenMeteo(coords, callBack) {
    const baseUrl = 'https://api.open-meteo.com/v1/forecast?';
    const urlParams = 'latitude=' + coords.latitude + 
                      '&longitude=' + coords.longitude + 
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
    iconTemp.src = ICON_PATH + ICON_TEMP_THRESHOLDS.find(i => i[0] >= current.temperature_2m)[1];

    //Clouds & Precipitation
    lblCloudCover.innerHTML = current.cloud_cover + units.cloud_cover;
    lblPrecipitation.innerHTML = current.precipitation + units.precipitation;
    lblRain.innerHTML = current.rain + units.rain;
    lblShowers.innerHTML = current.showers + units.showers;
    //Pick icon for the cloud and rain conditions
    if(current.precipitation > 0) {
        const rain = RAIN_CLOUD_THRESHOLDS.find(i => i[0] >= current.precipitation)[1];
        iconCloudCover.src = ICON_PATH + rain.icon;
        lblCloudDescription.innerHTML = rain.title; 
    } else { 
        const clouds = DRY_CLOUD_THRESHOLDS.find(i => i[0] >= current.cloud_cover)[1];
        iconCloudCover.src = ICON_PATH + clouds.icon;
        lblCloudDescription.innerHTML = clouds.title;
    }

    //Winds
    lblWindSpeed.innerHTML = current.wind_speed_10m + units.wind_speed_10m;
    lblWindDirection.innerHTML = current.wind_direction_10m + units.wind_direction_10m;
    lblWindGusts.innerHTML = current.wind_gusts_10m + units.wind_gusts_10m;
    lblWindDescription.innerHTML = WIND_THRESHOLDS.find(i => i[0] >= current.wind_speed_10m)[1];
    //Rotates the wind direction icon accordingly
    iconWindDir.style.transform = `rotate(${current.wind_direction_10m}deg)`;

    //Time of Day
    iconTimeOfDay.src = current.is_day == 1 ? ICON_PATH + DAY_ICON : ICON_PATH + NIGHT_ICON;
}

function getCity(coords, callBack) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}` +
                `&result_type=administrative_area_level_2|country&key=${G_KEY}`;
    
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log('Data from Google Map API');
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
    }
    navigator.geolocation.getCurrentPosition(geoLocSuccess, geoLocError, geoLocOptions);
}

function formatDate(dateString) {
    console.log(dateString);
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


//Event Listeners
btnFromCoords.addEventListener('click', () => {
    const lat = document.getElementById('lat-input').value;
    const lon = document.getElementById('lon-input').value;

    appState.geolocation = false;

    callAPIs({
        coords : {
            latitude : lat,
            longitude : lon,
        }
    });
});

btnFromGeo.addEventListener('click', getGeoLoc);

btnRefresh.addEventListener('click', () => {
    if(appState.geolocation) {
        getGeoLoc();
        return;
    }
    callAPIs(appState.pos);
});

//Program starts with Geo Location by default
getGeoLoc();
