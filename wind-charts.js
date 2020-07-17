// In case you are reading this, I'm not a frontend developer.  So this may look a bit odd.

// This is the value that the weather underground website was using.  Hopefully they don't change it frequently.
const API_KEY = '6532d6454b8aa370768e63d6ba5a832e'
const FONT_SIZE = 20;
const RED = 'rgb(235, 64, 52)';
const MUSTARD = 'rgb(222, 163, 35)';

// A class for speed(avg + gust) and direction wind charts
class WindCharts {
  constructor(stationId, directionOffset=0) {
    this.directionOffset = directionOffset;
    this.stationId = stationId;
    
    // Make request to get JSON weather data for stationId
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onDataLoad.bind(this);
    // API documented here: https://weather.com/swagger-docs/ui/sun/v2/sunV2PWSRecentHistory1DayRapidHistory.json
    this.xmlhttp.open("GET", 'https://api.weather.com/v2/pws/observations/all/1day?apiKey=' + API_KEY + '&stationId=' + stationId+ '&numericPrecision=decimal&format=json&units=e', true);
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
        for (var i=0; i<response.observations.length; i++) {
          var observation = response.observations[i];
          var observationMoment = moment(observation.obsTimeLocal);
          // Filter out data that is not within the last three hours
          if (observationMoment.isAfter(minMoment)) {
            // Compensate for bad data!
            var winddirAvg = this.directionOffset + observation.winddirAvg;
            if (winddirAvg > 360) {
              winddirAvg = winddirAvg - 360;
            }

            windDir.push({x: observationMoment, y: winddirAvg});
            // Several fields for windspeed, but avg seems appropriate
            windSpeed.push({x: observationMoment, y: observation.imperial.windspeedAvg});
            // There are several fields(high, low, avg) for gust, but high seems appropriate
            windGust.push({x: observationMoment, y: observation.imperial.windgustHigh});
          }
        }
        this.createSpeedScatterChart(windSpeed, windGust);
        this.createDirectionScatterChart(windDir);
      } else {
        // This can be any status code other than 200.  The most common case is HTTP 204, which happens
        // when no data is available, the status code is not documented in the API.
        console.error("Didn't get the expected status: " + this.xmlhttp.status);
        // Display empty charts
        this.createSpeedScatterChart([], []);
        this.createDirectionScatterChart([]);   
      }
    }
  }
  
  createSpeedScatterChart(windSpeed, windGust) {
    var maxSpeed = this.getMaxSpeed(windSpeed, windGust);
    var speedCtx = document.getElementById(this.stationId + '-speed');
    Chart.Scatter(speedCtx, {
      data: {
        datasets: [{
          label: 'Wind Speed',
          borderColor: RED,
          backgroundColor: RED,
          pointRadius: 5,
          pointHoverRadius: 10,
          data: windSpeed,
        },
        {
          label: 'Wind Gust',
          borderColor: MUSTARD,
          backgroundColor: MUSTARD,
          pointRadius: 5,
          pointHoverRadius: 10,
          data: windGust,
        }]
      },
      options: {
        title: {
          display: false,
        },
        legend: {
          labels: {
            fontSize: FONT_SIZE
          },
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'minute'
            },
            ticks: {
              maxTicksLimit: 20,
              fontSize: FONT_SIZE,
              // Set max to current date, it helps ensure stale data stands out better
              max: moment(),
            }
          }],
          // Create left and right axes, since it helps make it easier to read latest data
          yAxes: [this.createSpeedYAxes('left', maxSpeed), this.createSpeedYAxes('right', maxSpeed)],
        },
      }
    });
  }
  
  createDirectionScatterChart(windDir) {
    var directionCtx = document.getElementById(this.stationId + '-direction');
    this.directionScatter = Chart.Scatter(directionCtx, {
      data: { 
        datasets: [{
          label: 'Wind Direction',
          borderColor: RED,
          backgroundColor: RED,
          pointRadius: 5,
          pointHoverRadius: 10,
          data: windDir,
        }]
      },
      options: {
        title: {
          display: false,
        },
        legend: {
          labels: {
            fontSize: FONT_SIZE
          },
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'minute'
            },
            ticks: {
              maxTicksLimit: 20,
              fontSize: FONT_SIZE,
              max: moment(),
            }
          }],
          // Create left and right axes, since it helps make it easier to read latest data
          yAxes: [this.createDirectionYAxes('left'), this.createDirectionYAxes('right')],
        },
      }
    });			
  }
  
  convertDegreesToCompassDirection(value, index, values) {
    switch(value) {
      case 0:
        return 'N';
      case 90:
        return 'E';
      case 180:
        return 'S';
      case 270:
        return 'W';
      case 360:
        return 'N';
    }
    // This should not happen, but falling back to the value in degrees doesn't sound too bad.
    return value;
  }
  
  createSpeedYAxes(position, maxSpeedFromSensor) {
    // Normally the max value isn't necessary, since the graph autoscales.  But since I want to have
    // mirrored Y axes on the left and right sides, I need to set the max explicitly.
    return {
      display: true,
      position: position,
      ticks: {  
        min: 0,
        // Round up the nearest even number since the stepSize is 2.
        max: 2 * Math.round(Math.max(12, maxSpeedFromSensor)/2),
        stepSize: 2,
        fontSize: 20,
      },
    };
  }
  
  createDirectionYAxes(position) {
    return {
      display: true,
      position: position,
      ticks: {
        max: 360,
        min: 0,
        stepSize: 90,
        fontSize: FONT_SIZE,
        callback: this.convertDegreesToCompassDirection.bind(this),
      }
    };
  }
  
  getMaxSpeed(windSpeed, windGust) {
    var max = 0;
    for (var i=0; i<windSpeed.length; i++) {
      if (windSpeed[i].y > max) {
        max = windSpeed[i].y;
      }
    }
    for (var i=0; i<windGust.length; i++) {
      if (windGust[i].y > max) {
        max = windGust[i].y;
      }
    }
    return max;
  }
}