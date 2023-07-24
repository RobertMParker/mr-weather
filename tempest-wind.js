class TempestWind extends Wind {
  constructor(stationId) {
    super(stationId);
    this.loadData();
  }
  
  // Make request to get JSON weather data for stationId
  makeRequest() {
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onResponseReceived.bind(this);
    // TODO: make these epoch timestamps auto-generated
    var currentTimestamp = Math.floor(Date.now() / 1000);
    var fourHoursAgoTimestamp = currentTimestamp - (60 * 60 * 4);
    this.xmlhttp.open('GET', 'https://swd.weatherflow.com/swd/rest/observations?api_key=' + TempestWind.API_KEY + '&device_id=' + this.stationId + '&bucket=b&time_start=' + fourHoursAgoTimestamp + '&time_end=' + currentTimestamp, true);
    this.xmlhttp.send();
  }

  static get API_KEY() {
    // This is the value that this website was using: https://tempestwx.com/station/111254/graph/280616/wind/2
    // It might change
    return 'a8f5dbda-af0a-4b57-99b9-f10baa88f27b';
  }

  parseData() {
    /* Example Response: 
{
  "status": {
    "status_code": 0,
    "status_message": "SUCCESS"
  },
  "device_id": 280616,
  "type": "obs_st",
  "bucket_step_minutes": 5,
  "source": "db",
  "obs": [
    [
      1690227600,
      2.35,
      3.86,
      4.95,
      235,
      3,
      992.5,
      12.2,
      99,
      61440,
      5.56,
      512,
      0,
      0,
      0,
      0,
      2.8,
      5,
      0,
      0,
      0,
      0
    ],
    [
      1690227900,
      1.63,
      3.4,
      4.9,
      232,
      3,
      992.5,
      12.3,
      99,
      62326,
      5.63,
      520,
      0,
      0,
      0,
      0,
      2.79,
      5,
      0,
      0,
      0,
      0
    ],
    [
      1690228200,
      2.37,
      3.7,
      5.52,
      231,
      3,
      992.6,
      12.4,
      99,
      68041,
      6.15,
      567,
      0,
      0,
      0,
      0,
      2.78,
      5,
      0,
      0,
      0,
      0
    ],
    [
      1690228500,
      3.04,
      5.31,
      7.05,
      234,
      3,
      992.6,
      12.4,
      99,
      49383,
      4.47,
      412,
      0,
      0,
      0,
      0,
      2.78,
      5,
      0,
      0,
      0,
      0
    ]
  ]
}
*/
  
    var response = JSON.parse(this.xmlhttp.responseText);
    var windDir = [];
    var windSpeed = [];
    var windGust = [];
    var minMoment = moment().subtract(3, 'hours');
    
    var METERS_PER_SECOND_TO_MILES_PER_HOUR_MULTIPLIER = 2.23694
    for (var i=0; i<response.obs.length; i++) {
      // Observation record format documented here: https://apidocs.tempestwx.com/reference/observation-record-format
      var observation = response.obs[i];
      var observationMoment = moment.unix(observation[0]);

      // Filter out data that is not within the last three hours
      if (!observationMoment.isAfter(minMoment)) continue;

      windDir.push({x: observationMoment, y: observation[4]});
      windSpeed.push({x: observationMoment, y: Math.round(observation[2] * METERS_PER_SECOND_TO_MILES_PER_HOUR_MULTIPLIER)});
      windGust.push({x: observationMoment, y: Math.round(observation[3] * METERS_PER_SECOND_TO_MILES_PER_HOUR_MULTIPLIER)});
    }
    this.createChart(windSpeed, windGust, windDir);
  }
}
