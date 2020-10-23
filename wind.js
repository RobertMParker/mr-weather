// In case you are reading this, I'm not a frontend developer.  So this may look a bit odd.

const FONT_SIZE = 20;
const RED = 'rgb(235, 64, 52)';
const TRANSLUCENT_RED = 'rgba(235, 64, 52, 0.7)';
const MUSTARD = 'rgb(222, 163, 35)';

// Vertical line on hover -- from https://stackoverflow.com/a/45172506
Chart.defaults.LineWithLine = Chart.defaults.line;
Chart.controllers.LineWithLine = Chart.controllers.line.extend({
  draw: function(ease) {
    Chart.controllers.line.prototype.draw.call(this, ease);

    if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
      var activePoint = this.chart.tooltip._active[0],
        ctx = this.chart.ctx,
        x = activePoint.tooltipPosition().x,
        topY = this.chart.legend.bottom,
        bottomY = this.chart.chartArea.bottom;

      // draw line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#07C';
      ctx.stroke();
      ctx.restore();
    }
  }
});

// A class for speed(avg + gust) and direction wind charts
class Wind {
  constructor(directionOffset=0) {
    this.directionOffset = directionOffset;
  }

  createSpeedLineChart(windSpeed, windGust) {
    var maxSpeed = this.getMaxSpeed(windSpeed, windGust);
    var speedCtx = document.getElementById(this.stationId + '-speed');
    this.speedLine = new Chart(speedCtx, {
      type: 'LineWithLine',
      data: {
        datasets: [{
          label: 'Wind Speed',
          borderColor: TRANSLUCENT_RED,
          borderWidth: 0,
          backgroundColor: TRANSLUCENT_RED,
          pointRadius: 0,
          data: windSpeed,
        },
        {
          label: 'Wind Gust',
          borderColor: MUSTARD,
          backgroundColor: MUSTARD,
          pointRadius: 0,
          data: windGust,
          fill: false,
        }]
      },
      options: {
        animation: false,
        tooltips: {
          mode: 'index',
          intersect: false,
        },
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
    this.directionScatter = new Chart(directionCtx, {
      type: 'LineWithLine',
      data: { 
        datasets: [{
          label: 'Wind Direction',
          borderColor: RED,
          backgroundColor: RED,
          pointRadius: 5,
          pointHoverRadius: 5,
          data: windDir,
          fill: false,
          showLine: false,
        }]
      },
      options: {
        animation: false,
        tooltips: {
          mode: 'index',
          intersect: false,
        },
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
