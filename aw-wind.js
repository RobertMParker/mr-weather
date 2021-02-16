// Class for Ambient Weather stations referenced by MAC address

class AWWind extends Wind {
  constructor(stationId, windDirectionOffset) {
    super(stationId);
    this.windDirectionOffset = windDirectionOffset;
    this.loadData();
  }
  
  // Make request to get JSON weather data for stationId
  makeRequest() {
    var now = Date.now();
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onResponseReceived.bind(this);
    this.xmlhttp.open('GET', 'https://lightning.ambientweather.net/device-data?macAddress=' + this.stationId+ '&res=5&start=' + (now-86400000) + '&end=' + now + '&dataKey=graphDataRefined', true);
    this.xmlhttp.send();
  }

  parseData() {
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
  
      var windDirCorrected = (observation.winddir + this.windDirectionOffset) % 360;

      windDir.push({x: observationMoment, y: windDirCorrected});
      windSpeed.push({x: observationMoment, y: observation.windspeedmph});
      windGust.push({x: observationMoment, y: observation.windgustmph});
    }
    this.createChart(windSpeed, windGust, windDir);
  }
}
