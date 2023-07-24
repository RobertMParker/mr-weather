// Class for getting measurements from https://www.ndbc.noaa.gov/data/5day2/<station_id>_5day.txt

class NOAAWind extends Wind {
  constructor(stationId, timezone) {
    super(stationId);
    this.tzOffset = -parseInt(moment().tz(timezone).format('ZZ'))/100;
    this.loadData();
  }
  
  makeRequest() {
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onResponseReceived.bind(this);
    // Found this cors proxy randomly on Google, not sure if it's trustworthy
    const url = 'https://corsproxy.io/?' + encodeURIComponent('https://www.ndbc.noaa.gov/data/5day2/' + this.stationId + '_5day.txt');
    this.xmlhttp.open('GET', url, true);
    this.xmlhttp.send();
  }

  parseData() {
  /* Example response:
#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP  VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s     m   sec   sec degT   hPa  degC  degC  degC  nmi  hPa    ft
2023 07 24 20 10 300  6.0  7.0    MM    MM    MM  MM 1020.2    MM  12.9    MM   MM   MM    MM
2023 07 24 20 00 300  5.0  7.0    MM    MM    MM  MM 1020.3    MM  12.9    MM   MM +1.0    MM
2023 07 24 19 50 300  5.0  7.0   1.4     7   5.2 304 1020.2    MM  12.9    MM   MM   MM    MM
2023 07 24 19 40 310  6.0  8.0    MM    MM    MM  MM 1020.1    MM  12.8    MM   MM   MM    MM
2023 07 24 19 30 310  6.0  8.0    MM    MM    MM  MM 1020.1    MM  12.7    MM   MM   MM    MM
2023 07 24 19 20 310  7.0  9.0   1.5    MM   5.1 302 1019.9    MM  12.7    MM   MM   MM    MM
  */
  
    // Since thie uses a 3rd party CORS proxy, do not execute/parse JSON.  The data isn't even JSON, but still worth a warning.
    var lines = this.xmlhttp.responseText.split('\n');
    var windDir = [];
    var windSpeed = [];
    var windGust = [];
    var minMoment = moment().subtract(3, 'hours');
    for (var i=0; i<lines.length; i++) {
      var cols = lines[i].split(' ')
      if (cols[0].startsWith('#')) continue;

      var year = parseInt(cols[0]);
      var month = parseInt(cols[1]);
      var day = parseInt(cols[2]);
      var hour = parseInt(cols[3]);
      var minute = parseInt(cols[4]);
      var wind_direction = parseInt(cols[5]);
      var wind_speed_meters_per_second = parseInt(cols[6]);
      var wind_gust_meters_per_second = parseInt(cols[7]);

      // Month is 0-indexed
      var observationMoment = moment.utc([year, month-1, day, hour, minute]);

      // Filter out data that is not within the last three hours
      if (!observationMoment.isAfter(minMoment)) continue;

      windDir.push({x: observationMoment, y: wind_direction});
      windSpeed.push({x: observationMoment, y: Math.round(wind_speed_meters_per_second * 2.23694)});
      windGust.push({x: observationMoment, y: Math.round(wind_gust_meters_per_second * 2.23694)});
    }
    this.createChart(windSpeed, windGust, windDir);
  }
}
