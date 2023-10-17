var cityNames = [];
var apiKey = "0f63a7591d270b5b58541ae9ebe1c960";

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
  populateWeatherDetails(liClicked.text());
}

function createCityButton(city) {
  var cityListItemEl = $(
    '<li class="history-item justify-space-between align-center p-2 text-dark">'
  );
  cityListItemEl.text(city);

  cityListEl.append(cityListItemEl);
}

function populateWeatherDetails(city) {
  callCurrentWeatherApiAndFillData(city);
  callFiveDayForecastApiAndFillData(city);
  
}

function callCurrentWeatherApiAndFillData(city) {
  var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.cod == 404) {
        alert("Error: " + data.message);
        return;
      }

      fillCurrentDetails(data);

      if (!cityNames.includes(city)) {
        createCityButton(city);
        cityNames.push(city);
        localStorage.setItem("cityNames", JSON.stringify(cityNames));
      }
    });
}

function fillCurrentDetails(data) {
  console.log("fillCurrent:" + data);
  var currentDate = data.dt;
  var currentDateEl = $("#current-city-header");

  var unixFormat = dayjs.unix(currentDate).format("MM/D/YYYY");
  currentDateEl.text(data.name + " (" + unixFormat + ")");

  var currentTempEl = $("#temp-current");
  currentTempEl.text(data.main.temp + "°F");

  var currentWindEl = $("#wind-current");
  currentWindEl.text(data.wind.speed + " MPH");

  var currentHumidityEl = $("#humidity-current");
  currentHumidityEl.text(data.main.humidity + "%");

  var currentWeatherIconCode = data.weather[0].icon;

  // Create an image element to display the weather icon
  $('#currentWeatherIconContainer img:first').remove();

  var weatherIconUrl = `https://openweathermap.org/img/w/${currentWeatherIconCode}.png`;
  var weatherIcon = $("<img>").attr("src", weatherIconUrl);
  $("#currentWeatherIconContainer").append(weatherIcon);
}

function callFiveDayForecastApiAndFillData(city) {
  var requestUrl =
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;
  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.cod == 404) {
        return;
      }
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
    tempEl.text(forecastList[i * 8 - 1].main.temp + "°F");

    var windEl = $("#wind-" + i);
    windEl.text(forecastList[i * 8 - 1].wind.speed + " MPH");

    var humidityEl = $("#humidity-" + i);
    humidityEl.text(forecastList[i * 8 - 1].main.humidity + "%");

    var weatherIconCode = forecastList[i * 8 - 1].weather[0].icon;

    
    $(`#weatherIconContainer-${i} img:first`).remove();

    // Construct the URL for the weather icon image
    var weatherIconUrl = `https://openweathermap.org/img/w/${weatherIconCode}.png`;

    // Create an image element to display the weather icon
    var weatherIcon = $("<img>").attr("src", weatherIconUrl);

    // Append the weather icon to a specific HTML element
    $(`#weatherIconContainer-${i}`).append(weatherIcon);
  }
}

var cityFormEl = $("#city-form");
var cityListEl = $("#city-list");

function handleFormSubmit(event) {
  event.preventDefault();

  var cityItem = $('input[name="city-input"]').val();

  if (!cityItem) {
    alert("No city item filled out in form!");
    return;
  }

  
  // clear the form input element
  $('input[name="city-input"]').val("");

  populateWeatherDetails(cityItem);
}

// use event delegation on the `cityListEl` to listen for click on any element with a class of `history-item`
cityListEl.on("click", ".history-item", cityHistoryAction);
cityFormEl.on("submit", handleFormSubmit);

initializePage();
