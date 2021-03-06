// Class for getting measurements from sdf.ndbc.noaa.gov

class NOAAWind extends Wind {
  constructor(stationId, timezone) {
    super(stationId);
    this.tzOffset = -parseInt(moment().tz(timezone).format('ZZ'))/100;
    this.loadData();
  }
  
  makeRequest() {
    var startTime = moment().subtract(24, 'hours').format('YYYY-MM-DDTHH:mm[Z]');
    var endTime = moment().format('YYYY-MM-DDTHH:mm[Z]');

    // Make request to get JSON weather data for stationId
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onResponseReceived.bind(this);
    this.xmlhttp.open('GET', 'https://sdf.ndbc.noaa.gov/sos/server.php?request=GetObservation&service=SOS&version=1.0.0&offering=' + this.stationId + '&observedproperty=Winds&responseformat=text/csv&eventtime=' + startTime + '/' + endTime, true);
    this.xmlhttp.send();

    // fields:
    // - 0 station_id
    // - 1 sensor_id
    // - 2 latitude (degree)
    // - 3 longitude (degree)
    // - 4 date_time
    // - 5 depth (m)
    // - 6 wind_from_direction (degree)
    // - 7 wind_speed (m/s)
    // - 8 wind_speed_of_gust (m/s)
    // - 9 upward_air_velocity (m/s)
  }

  parseData() {
    var response = Papa.parse(this.xmlhttp.responseText, { header: true });
    var windDir = [];
    var windSpeed = [];
    var windGust = [];
    var minMoment = moment().subtract(3, 'hours');
    for (var i=0; i<response.data.length; i++) {
      var observation = response.data[i];
      var observationMoment = moment.parseZone(observation.date_time).add(this.tzOffset, 'hours');

      // Filter out data that is not within the last three hours
      if (!observationMoment.isAfter(minMoment)) continue;

      windDir.push({x: observationMoment, y: observation['wind_from_direction (degree)']});
      windSpeed.push({x: observationMoment, y: Math.round(observation['wind_speed (m/s)'] * 2.23694)});
      windGust.push({x: observationMoment, y: Math.round(observation['wind_speed_of_gust (m/s)'] * 2.23694)});
    }
    this.createChart(windSpeed, windGust, windDir);
  }
}
