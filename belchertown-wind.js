class BelchertownWind extends Wind {
  constructor(stationId) {
    super(stationId);
    this.loadData();
  }
    
  makeRequest() {
    // Make request to get JSON weather data for stationId
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onResponseReceived.bind(this);
    this.xmlhttp.open('GET', this.stationId, true);
    this.xmlhttp.send();

    // mixdivr.org's homepage.json has:
    // - chart1: outTemp + windchill + heatindex + dewpoint
    // - chart2: radiation + maxSolarRad + UV
    // - chart3: windDir + windGust + windSpeed
    // - chart4: windRose
    // - chart5: rainRate + rainTotal
    // - chart6: barometer

    // standard belchertown day.json has:
    // - chart1: outTemp + windchill + heatindex + dewpoint
    // - chart2: radiation + maxSolarRad + UV
    // - chart3: windDir + windGust + windSpeed
    // - chart4: windRose
    // - chart5: haysChart (windspeed)
    // - chart6: rainRate
    // - chart7: barometer
    // - chart8: weatherRange
  }

  parseData() {
    var response = JSON.parse(this.xmlhttp.responseText);
    var windDir = [];
    var windSpeed = [];
    var windGust = [];
    // Filter out data that is not within the last three hours
    var minMoment = moment().subtract(3, 'hours');

    for (var i=0; i<response.chart3.series.windDir.data.length; i++) {
      var observation = response.chart3.series.windDir.data[i];
      var observationMoment = moment(observation[0]);
      if (!observationMoment.isAfter(minMoment)) continue;

      windDir.push({x: observationMoment, y: Math.round(observation[1])});
    }

    for (var i=0; i<response.chart3.series.windSpeed.data.length; i++) {
      var observation = response.chart3.series.windSpeed.data[i];
      var observationMoment = moment(observation[0]);
      if (!observationMoment.isAfter(minMoment)) continue;
      windSpeed.push({x: observationMoment, y: Math.round(observation[1] * 10) / 10});
    }

    for (var i=0; i<response.chart3.series.windGust.data.length; i++) {
      var observation = response.chart3.series.windGust.data[i];
      var observationMoment = moment(observation[0]);
      if (!observationMoment.isAfter(minMoment)) continue;
      windGust.push({x: observationMoment, y: Math.round(observation[1] * 10) / 10});
    }

    this.createChart(windSpeed, windGust, windDir);   
  }
}
