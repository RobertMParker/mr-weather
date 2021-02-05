// Class for getting measurements from sdf.ndbc.noaa.gov

class NOAAWind extends Wind {
  constructor(stationId, timezone, directionOffset=0) {
    super(directionOffset);
    this.stationId = stationId;
    this.tzOffset = -parseInt(moment().tz(timezone).format('ZZ'))/100;

    var startTime = moment().subtract(24, 'hours').format('YYYY-MM-DDTHH:mm[Z]');
    var endTime = moment().format('YYYY-MM-DDTHH:mm[Z]');

    // Make request to get JSON weather data for stationId
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onDataLoad.bind(this);
    this.xmlhttp.open('GET', 'https://sdf.ndbc.noaa.gov/sos/server.php?request=GetObservation&service=SOS&version=1.0.0&offering=' + stationId + '&observedproperty=Winds&responseformat=text/csv&eventtime=' + startTime + '/' + endTime, true);
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

  onDataLoad() {
    if (this.xmlhttp.readyState == 4) {
      if (this.xmlhttp.status == 200) {
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

          // Compensate for bad data!
          var winddirAvg = this.directionOffset + observation['wind_from_direction (degree)'];
          if (winddirAvg > 360) {
            winddirAvg = winddirAvg - 360;
          }

          windDir.push({x: observationMoment, y: winddirAvg});
          windSpeed.push({x: observationMoment, y: Math.round(observation['wind_speed (m/s)'] * 2.23694)});
          windGust.push({x: observationMoment, y: Math.round(observation['wind_speed_of_gust (m/s)'] * 2.23694)});
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
