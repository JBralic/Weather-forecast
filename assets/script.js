var apiKey = '0e584d18f4751753861bc60159e5582b';

var formEl = document.getElementById('submitForm');

formEl.addEventListener('submit', function (event) {
  var city = document.getElementById('query').value;
  event.preventDefault();
  getLatLon(city);
});

function getLatLon(city) {
  var QueryUrl =
    'https://api.openweathermap.org/geo/1.0/direct?q=' +
    city +
    '&limit=&appid=' +
    apiKey;

  fetch(QueryUrl)
    .then(function (response) {
      if (!response.ok) {
        throw response.json();
      }
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      getForecast(data[0].lat, data[0].lon);
      getCurrent(data[0].lat, data[0].lon);
    });
}

function getForecast(lat, lon) {
  var url =
    'https://api.openweathermap.org/data/2.5/forecast?lat=' +
    lat +
    '&lon=' +
    lon +
    '&appid=' +
    apiKey +
    '&units=metric';

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw response.json();
      }
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      updateForecast(data);
    });
}

function getCurrent(lat, lon) {
  var url =
    'https://api.openweathermap.org/data/2.5/weather?lat=' +
    lat +
    '&lon=' +
    lon +
    '&appid=' +
    apiKey +
    '&units=metric';

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw response.json();
      }
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      updateCurrentWeather(data);
      addToHistory(data.name);
    });
}

function addToHistory(name) {
  const storageData = JSON.parse(localStorage.getItem('searchHistory'));
  if (!storageData || storageData.length === 0) {
    localStorage.setItem('searchHistory', JSON.stringify([name]));
  } else if (storageData.length > 0 && !storageData.includes(name)) {
    storageData.push(name);
    localStorage.setItem('searchHistory', JSON.stringify(storageData));
  } else {
    var filteredData = storageData.filter(function (entry) {
      return entry !== name;
    });
    console.log(filteredData);
    filteredData.push(name);
    localStorage.setItem('searchHistory', JSON.stringify(filteredData));
  }
  displaySearchHistory();
}
displaySearchHistory();

function displaySearchHistory() {
  const storageData = JSON.parse(localStorage.getItem('searchHistory'));
  var searchHistory = document.getElementById('history');
  searchHistory.innerHTML = '';
  for (var i = 0; i < storageData.length; i++) {
    var button = document.createElement('button');
    button.textContent = storageData[i];
    button.setAttribute('class', 'col-12 historyButton');
    searchHistory.prepend(button);
    button.addEventListener('click', function (e) {
      console.log('clicked on', e.target.textContent);
      getLatLon(e.target.textContent);
    });
  }
}

function updateCurrentWeather(currentWeather) {
  var city = document.getElementById('currentCity');
  city.textContent = currentWeather.name;
  var date = document.getElementById('currentDate');
  date.textContent = new Date(currentWeather.dt * 1000).toLocaleDateString();
  var icon = document.getElementById('currentIcon');
  icon.src = `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png;`;
  var temp = document.getElementById('currentTemp');
  temp.textContent = currentWeather.main.temp;
  var wind = document.getElementById('currentWind');
  wind.textContent = currentWeather.wind.speed;
  var humidity = document.getElementById('currentHumidity');
  humidity.textContent = currentWeather.main.humidity;
}

function updateForecast(forecast) {
  var cards = document.getElementById('cards');
  cards.innerHTML = '';
  for (var i = 2; i < forecast.list.length; i += 8) {
    console.log(forecast.list[i]);
    var outerDiv = document.createElement('div');
    outerDiv.classList.add('col-2', 'five-day');
    outerDiv.innerHTML = ` 
      <h5>${new Date(forecast.list[i].dt * 1000).toLocaleDateString()}</h5>
      <img src="${`https://openweathermap.org/img/wn/${forecast.list[i].weather[0].icon}@2x.png`}" alt="icon">
      <p>Temp: ${forecast.list[i].main.temp}</p>
      <p>Wind: ${forecast.list[i].wind.speed}</p>
      <p>Humidity: ${forecast.list[i].main.humidity}</p>
      `;
    cards.append(outerDiv);
  }
}
