class WUWind extends Wind {
  constructor(stationId) {
    super();
    this.stationId = stationId;

    // Make request to get JSON weather data for stationId
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onDataLoad.bind(this);
    // API documented here: https://weather.com/swagger-docs/ui/sun/v2/sunV2PWSRecentHistory1DayRapidHistory.json
    this.xmlhttp.open('GET', 'https://api.weather.com/v2/pws/observations/all/1day?apiKey=' + WUWind.API_KEY + '&stationId=' + stationId+ '&numericPrecision=decimal&format=json&units=e', true);
    this.xmlhttp.send();
  }

  static get API_KEY() {
    // This is the value that the weather underground website was using.
    // Hopefully they don't change it frequently.
    return '6532d6454b8aa370768e63d6ba5a832e';
  }

  onDataLoad() {
    if (this.xmlhttp.readyState == 4) {
      if (this.xmlhttp.status == 200) {
        var response = JSON.parse(this.xmlhttp.responseText);
        var windDir = [];
        var windSpeed = [];
        var windGust = [];
        var minMoment = moment().subtract(3, 'hours');
        for (var i=0; i<response.observations.length; i++) {
          var observation = response.observations[i];
          var observationMoment = moment.utc(observation.obsTimeUtc);

          // Filter out data that is not within the last three hours
          if (!observationMoment.isAfter(minMoment)) continue;

          windDir.push({x: observationMoment, y: observation.winddirAvg});
          // Several fields for windspeed, but avg seems appropriate
          windSpeed.push({x: observationMoment, y: observation.imperial.windspeedAvg});
          // There are several fields(high, low, avg) for gust, but high seems appropriate
          windGust.push({x: observationMoment, y: observation.imperial.windgustHigh});
        }
        this.createChart(windSpeed, windGust, windDir);
      } else {
        // This can be any status code other than 200.  The most common case is HTTP 204, which happens
        // when no data is available, the status code is not documented in the API.
        console.error("Didn't get the expected status: " + this.xmlhttp.status);
        // Display empty charts
        this.createChart([], [], []);
      }
    }
  }
}
