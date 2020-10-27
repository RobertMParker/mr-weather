class BelchertownWind extends Wind {
  constructor(stationId, directionOffset=0) {
    super(directionOffset);
    this.stationId = stationId;

    // Make request to get JSON weather data for stationId
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onDataLoad.bind(this);
    this.xmlhttp.open('GET', stationId, true);
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

  onDataLoad() {
    if (this.xmlhttp.readyState == 4) {
      if (this.xmlhttp.status == 200) {
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

          // Compensate for bad data!
          var winddirAvg = this.directionOffset + observation[1];
          if (winddirAvg > 360) {
            winddirAvg = winddirAvg - 360;
          }

          windDir.push({x: observationMoment, y: Math.round(winddirAvg)});
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
      } else {
        console.error("Didn't get the expected status: " + this.xmlhttp.status);
        // Display empty charts
        this.createChart([], [], []);
      }
    }
  }
}
