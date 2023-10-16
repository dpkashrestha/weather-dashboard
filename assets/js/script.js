var cityNames = [];

function initializePage() {
  cityNames = JSON.parse(localStorage.getItem("cityNames"));
  if (!cityNames) {
    cityNames = [];
  }

  for (var i = 0; i < cityNames.length; i++) {
    createCityButton(cityNames[i]);
  }
}

function cityHistoryAction(event) {
  var liClicked = $(event.target);
  console.log(liClicked.text());
  populateWeatherDetails(liClicked.text());
}

function createCityButton(city) {
  var cityListItemEl = $(
    '<li class="history-item flex-row justify-space-between align-center p-2 bg-light text-dark">'
  );
  cityListItemEl.text(city);


  cityListEl.append(cityListItemEl);
}

function populateWeatherDetails(city) {
  callGeoCodingApi(city);

  if (!cityNames.includes(city)) {
    cityNames.push(city);
    localStorage.setItem("cityNames", JSON.stringify(cityNames));
  }
}

function callGeoCodingApi(city) {
  var requestUrl =
    "https://api.openweathermap.org/geo/1.0/direct?q=Saint%20Paul,MN,US&limit=5&appid=0f63a7591d270b5b58541ae9ebe1c960";

  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var lat = data[0].lat;
      var lon = data[0].lon;

      callCurrentWeatherApiAndFillData(lat, lon);
      callFiveDayForecastApiAndFillData(lat, lon);
    });
}

function callCurrentWeatherApiAndFillData(lat, lon) {
  var requestUrl =
    "https://api.openweathermap.org/data/2.5/weather?lat=" +
    lat +
    "&lon=" +
    lon +
    "&units=imperial&appid=0f63a7591d270b5b58541ae9ebe1c960";

  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      fillCurrentDetails(data);
    });
}

function fillCurrentDetails(data) {
  var currentDate = data.dt;
  var currentDateEl = $("#current-city-header");

  var unixFormat = dayjs.unix(currentDate).format("MM/D/YYYY");
  currentDateEl.text(data.name + " (" + unixFormat + ")");

  var currentTempEl = $("#temp-current");
  currentTempEl.text(data.main.temp + " °F");

  var currentWindEl = $("#wind-current");
  currentWindEl.text(data.wind.speed +" MPH");

  var currentHumidityEl = $("#humidity-current");
  currentHumidityEl.text(data.main.humidity + "%");

  var currentWeatherIconCode = data.weather[0].icon;

  // Create an image element to display the weather icon
    var weatherIconUrl = `https://openweathermap.org/img/w/${currentWeatherIconCode}.png`;
    var weatherIcon = $("<img>").attr("src", weatherIconUrl);
  $("#currentWeatherIconContainer").append(weatherIcon);
  }


function callFiveDayForecastApiAndFillData(lat, lon) {
  var requestUrl =
    "https://api.openweathermap.org/data/2.5/forecast?lat=44.9497487&lon=-93.0931028&units=imperial&appid=0f63a7591d270b5b58541ae9ebe1c960";
  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      fillForecastDetails(data);
    });
}

function fillForecastDetails(data) {
  var forecastList = data.list;
  for (var i = 1; i <= 5; i++) {
    var dateEl = $("#date-" + i);

    var unixFormat = dayjs.unix(forecastList[i * 8 - 1].dt).format("MM/D/YYYY");
    dateEl.text(unixFormat);

    var tempEl = $("#temp-" + i);
    tempEl.text(forecastList[i * 8 - 1].main.temp + " °F");

    var windEl = $("#wind-" + i);
    windEl.text(forecastList[i * 8 - 1].wind.speed +" MPH");

    var humidityEl = $("#humidity-" + i);
    humidityEl.text(forecastList[i * 8 - 1].main.humidity + "%");

    var weatherIconCode = forecastList[i * 8 - 1].weather[0].icon;

  // Construct the URL for the weather icon image
    var weatherIconUrl = `https://openweathermap.org/img/w/${weatherIconCode}.png`;

  // Create an image element to display the weather icon
    var weatherIcon = $("<img>").attr("src", weatherIconUrl);

  // Append the weather icon to a specific HTML element
  $("#weatherIconContainer-" + i).append(weatherIcon);
  }
  
}

// ---------------------

var cityFormEl = $("#city-form");
var cityListEl = $("#city-list");

function handleFormSubmit(event) {
  event.preventDefault();

  var cityItem = $('input[name="city-input"]').val();

  if (!cityItem) {
    console.log("No city item filled out in form!");
    return;
  }

  createCityButton(cityItem);
  // clear the form input element
  $('input[name="city-input"]').val("");

  populateWeatherDetails(cityItem);
}



// use event delegation on the `cityListEl` to listen for click on any element with a class of `history-item`
cityListEl.on("click", ".history-item", cityHistoryAction);
cityFormEl.on("submit", handleFormSubmit);

initializePage();
