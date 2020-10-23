// Class for Ambient Weather stations referenced by MAC address

class AWWind extends Wind {
  constructor(stationId, directionOffset=0) {
    super(directionOffset);
    this.stationId = stationId;

    var now = Date.now();

    // Make request to get JSON weather data for stationId
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onDataLoad.bind(this);
    this.xmlhttp.open("GET", 'https://lightning.ambientweather.net/device-data?macAddress=' + stationId+ '&res=5&start=' + (now-86400000) + '&end=' + now + '&dataKey=graphDataRefined', true);
    this.xmlhttp.send();
  }

  onDataLoad() {
    if (this.xmlhttp.readyState == 4) {
      if (this.xmlhttp.status == 200) {
        var response = JSON.parse(this.xmlhttp.responseText);
        var windDir = [];
        var windSpeed = [];
        var windGust = [];
        var minMoment = moment().subtract(3, 'hours');
        for (var i=0; i<response.data.length; i++) {
          var observation = response.data[i];
          var observationMoment = moment(observation.dateutc);

          // Filter out data that is not within the last three hours
          if (!observationMoment.isAfter(minMoment)) continue;

          // Compensate for bad data!
          var winddirAvg = this.directionOffset + observation.winddir;
          if (winddirAvg > 360) {
            winddirAvg = winddirAvg - 360;
          }

          windDir.push({x: observationMoment, y: winddirAvg});
          windSpeed.push({x: observationMoment, y: observation.windspeedmph});
          windGust.push({x: observationMoment, y: observation.windgustmph});
        }
        this.createSpeedLineChart(windSpeed, windGust);
        this.createDirectionScatterChart(windDir);
      } else {
        // This can be any status code other than 200.  The most common case is HTTP 204, which happens
        // when no data is available, the status code is not documented in the API.
        console.error("Didn't get the expected status: " + this.xmlhttp.status);
        // Display empty charts
        this.createSpeedLineChart([], []);
        this.createDirectionScatterChart([]);
      }
    }
  }
}
