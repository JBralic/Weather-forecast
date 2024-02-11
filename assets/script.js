const API_KEY = '0e584d18f4751753861bc60159e5582b';
const formElement = document.getElementById('submitForm');

formElement.addEventListener('submit', event => {
  event.preventDefault();
  const city = document.getElementById('query').value;
  fetchWeatherData(city);
});

async function fetchWeatherData(city) {
  try {
    const geoData = await fetchGeoData(city);
    const { lat, lon } = geoData[0];
    const [forecastData, currentWeatherData] = await Promise.all([
      fetchForecastData(lat, lon),
      fetchCurrentWeatherData(lat, lon)
    ]);
    updateForecast(forecastData);
    updateCurrentWeather(currentWeatherData);
    addToHistory(city);
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

async function fetchGeoData(city) {
  const queryUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=&appid=${API_KEY}`;
  const response = await fetch(queryUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch geo data');
  }
  return response.json();
}

async function fetchForecastData(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch forecast data');
  }
  return response.json();
}

async function fetchCurrentWeatherData(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch current weather data');
  }
  return response.json();
}

function addToHistory(city) {
  let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }
  displaySearchHistory();
}

function displaySearchHistory() {
  const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
  const historyContainer = document.getElementById('history');
  historyContainer.innerHTML = '';
  searchHistory.forEach(city => {
    const button = document.createElement('button');
    button.textContent = city;
    button.classList.add('col-12', 'history-button');
    button.addEventListener('click', () => fetchWeatherData(city));
    historyContainer.prepend(button);
  });
}

function updateCurrentWeather(currentWeather) {
  const { name, dt, weather, main, wind } = currentWeather;
  document.getElementById('currentCity').textContent = name;
  document.getElementById('currentDate').textContent = new Date(dt * 1000).toLocaleDateString();
  document.getElementById('currentIcon').src = `https://openweathermap.org/img/wn/${weather[0].icon}.png`;
  document.getElementById('currentTemp').textContent = main.temp;
  document.getElementById('currentWind').textContent = wind.speed;
  document.getElementById('currentHumidity').textContent = main.humidity;
}

function updateForecast(forecast) {
  const cardsContainer = document.getElementById('cards');
  cardsContainer.innerHTML = '';
  for (let i = 2; i < forecast.list.length; i += 8) {
    const outerDiv = document.createElement('div');
    outerDiv.classList.add('col-2', 'five-day');
    outerDiv.innerHTML = `
      <h5>${new Date(forecast.list[i].dt * 1000).toLocaleDateString()}</h5>
      <img src="${`https://openweathermap.org/img/wn/${forecast.list[i].weather[0].icon}@2x.png`}" alt="icon">
      <p>Temp: ${forecast.list[i].main.temp}</p>
      <p>Wind: ${forecast.list[i].wind.speed}</p>
      <p>Humidity: ${forecast.list[i].main.humidity}</p>
      `;
    cardsContainer.append(outerDiv);
  }
}

displaySearchHistory();