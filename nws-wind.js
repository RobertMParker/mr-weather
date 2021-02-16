class NWSWind extends Wind {
  constructor(stationId) {
    super(stationId);
    this.loadData();
  }
  
  makeRequest() {
    // Make request to get JSON forecast data for stationId (actually a WFO+gridpoint)
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onResponseReceived.bind(this);
    // API documented here: https://www.weather.gov/documentation/services-web-api
    this.xmlhttp.open('GET', 'https://api.weather.gov/gridpoints/' + this.stationId + '/forecast/hourly', true);
    this.xmlhttp.setRequestHeader('Feature-Flags', 'forecast_wind_speed_qv');
    this.xmlhttp.send();
  }

  parseData() {
    var response = JSON.parse(this.xmlhttp.responseText);
    var windDir = [];
    var windSpeed = [];
    var windGust = [];

    var minMoment = moment().subtract(3, 'hours');
    var maxMoment = moment().add(72, 'hours');
  
    for (var i=0; i<response.properties.periods.length; i++) {
      var forecast = response.properties.periods[i];
      var forecastMoment = moment(forecast.startTime);
  
      // Filter out data that is too far in the past or too far in the future
      if (!forecastMoment.isAfter(minMoment) || forecastMoment.isAfter(maxMoment) ) continue;

      windDir.push({x: forecastMoment, y: this.getCardinal(forecast.windDirection)});
      windSpeed.push({x: forecastMoment, y: Math.round(forecast.windSpeed.value / 1.60934)});
      // NWS wind gust data is sparcely populated, and it is usually not set, but sometimes it is.
      windGust.push({x: forecastMoment, y: forecast.windGust ? Math.round(forecast.windGust.maxValue / 1.60934) : NaN});
    }
    this.createChart(windSpeed, windGust, windDir, true);
  }
}
