// In case you are reading this, I'm not a frontend developer.  So this may look a bit odd.

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

  static get FONT_SIZE() {
    return 20;
  }

  static get RED() {
    return 'rgb(235, 64, 52)';
  }

  static get TRANSLUCENT_RED() {
    return 'rgba(235, 64, 52, 0.7)';
  }

  static get MUSTARD() {
    return 'rgb(222, 163, 35)';
  }

  static get BLUE() {
    return 'rgb(59, 73, 227)';
  }

  createChart(windSpeed, windGust, windDir) {
    var maxSpeed = this.getMaxSpeed(windSpeed, windGust);
    var speedCtx = document.getElementById(this.stationId);
    this.speedLine = new Chart(speedCtx, {
      type: 'LineWithLine',
      data: {
        datasets: [{
          yAxisID: 'speed',
          label: 'Wind Speed',
          borderColor: Wind.TRANSLUCENT_RED,
          borderWidth: 0,
          backgroundColor: Wind.TRANSLUCENT_RED,
          pointRadius: 0,
          data: windSpeed,
        },
        {
          yAxisID: 'speed',
          label: 'Wind Gust',
          borderColor: Wind.MUSTARD,
          backgroundColor: Wind.MUSTARD,
          pointRadius: 0,
          data: windGust,
          fill: false,
        },
        {
          yAxisID: 'direction',
          label: 'Wind Direction',
          borderColor: Wind.BLUE,
          backgroundColor: Wind.BLUE,
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
            fontSize: Wind.FONT_SIZE
          },
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'minute'
            },
            ticks: {
              fontSize: Wind.FONT_SIZE,
              // Set max to current date, it helps ensure stale data stands out better
              max: moment(),
            }
          }],
          yAxes: [
            {
              id: 'speed',
              position: 'right',
              gridLines: {
                display: false
              },
              ticks: {
                // Normally the max value isn't necessary, since the graph autoscales.
                // But since I want to have mirrored Y axes on the left and right sides,
                // I need to set the max explicitly.
                min: 0,
                // Round up the nearest even number since the stepSize is 2.
                max: 2 * Math.round(Math.max(12, maxSpeed)/2),
                stepSize: 2,
                fontSize: 20,
              },
            },
            {
              position: 'left',
              gridLines: {
                display: false
              },
              ticks: {
                min: 0,
                max: 2 * Math.round(Math.max(12, maxSpeed)/2),
                stepSize: 2,
                fontSize: 20,
              },
            },
            {
              id: 'direction',
              type: 'linear',
              position: 'right',
              gridLines: {
                borderDash: [5, 5],
                color: Wind.BLUE,
                lineWidth: 0.5,
                drawBorder: false,
              },
              ticks: {
                max: 360,
                min: 0,
                stepSize: 90,
                fontSize: Wind.FONT_SIZE,
                callback: this.convertDegreesToCompassDirection.bind(this),
              }
            },
            {
              type: 'linear',
              position: 'left',
              gridLines: {
                display: false
              },
              ticks: {
                max: 360,
                min: 0,
                stepSize: 90,
                fontSize: Wind.FONT_SIZE,
                callback: this.convertDegreesToCompassDirection.bind(this),
              }
            },
          ],
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
