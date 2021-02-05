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
  constructor() {}

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

  createChart(windSpeed, windGust, windDir, forecast=false) {
    function makeXAxis() {
      if (forecast) {
        return {
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'ddd h:mm a'
            }
          },
          ticks: {
            fontSize: Wind.FONT_SIZE
          }
        };
      } else {
        return {
          type: 'time',
          time: {
            unit: 'minute'
          },
          ticks: {
            fontSize: Wind.FONT_SIZE,
            // Set max to current date, it helps ensure stale data stands out better
            max: moment()
          }
        };
      }
    }
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
          callbacks: {
            label: function(item, data) {
              var set = data.datasets[item.datasetIndex];
              if (set.yAxisID == 'direction') {
                return set.label + ': ' + new Wind().getOrdinal(item.value) + ' (' + item.yLabel + "\xBA)";
              } else {
                return set.label + ': ' + item.yLabel;
              }
            }
          }
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
          xAxes: [
            makeXAxis()
          ],
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

  getOrdinal(cardinal) {
    if (cardinal >= 0 && cardinal <= 11.25) {
      return 'N';
    } else if (cardinal >= 11.26 && cardinal <= 33.75) {
      return 'NNE';
    } else if (cardinal >= 33.76 && cardinal <= 56.25) {
      return 'NE';
    } else if (cardinal >= 56.26 && cardinal <= 78.75) {
      return 'ENE';
    } else if (cardinal >= 78.76 && cardinal <= 101.25) {
      return 'E';
    } else if (cardinal >= 101.26 && cardinal <= 123.75) {
      return 'ESE';
    } else if (cardinal >= 123.76 && cardinal <= 146.25) {
      return 'SE';
    } else if (cardinal >= 146.26 && cardinal <= 168.75) {
      return 'SSE';
    } else if (cardinal >= 168.76 && cardinal <= 191.25) {
      return 'S';
    } else if (cardinal >= 191.26 && cardinal <= 213.75) {
      return 'SSW';
    } else if (cardinal >= 213.76 && cardinal <= 236.25) {
      return 'SW';
    } else if (cardinal >= 236.26 && cardinal <= 258.75) {
      return 'WSW';
    } else if (cardinal >= 258.76 && cardinal <= 281.25) {
      return 'W';
    } else if (cardinal >= 281.26 && cardinal <= 303.75) {
      return 'WNW';
    } else if (cardinal >= 303.76 && cardinal <= 326.25) {
      return 'NW';
    } else if (cardinal >= 326.26 && cardinal <= 348.75) {
      return 'NNW';
    } else if (cardinal >= 348.76 && cardinal <= 360) {
      return 'N';
    }
  }

  // unused.  maybe later?
  getCardinal(ordinal) {
    switch(ordinal) {
      case 'N':   return 0;
      case 'NNE': return 22.5;
      case 'NE':  return 45;
      case 'ENE': return 67.5;
      case 'E':   return 90;
      case 'ESE': return 112.5;
      case 'SE':  return 135;
      case 'SSE': return 157.5;
      case 'S':   return 180;
      case 'SSW': return 202.5;
      case 'SW':  return 225;
      case 'WSW': return 247.5;
      case 'W':   return 270;
      case 'WNW': return 292.5;
      case 'NW':  return 315;
      case 'NNW': return 337.5;
    }
  }
}
