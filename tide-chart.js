// I couldn't find a tide chart that I liked, so what the hell lets just build one...

const DATE_FORMAT = "YYYYMMDD";

const BLUE = 'rgb(59, 73, 227)';
const BLACK = 'rgb(0, 0, 0)';

class TideChart {
  constructor(stationId) {
    // Get the tide predictions for several days
    var yesterday = moment().subtract(1, 'days');
    var tomorrow = moment().add(1, 'days');
    
    // TODO(robparker): Check if NOAA api fixed their bug with CORS, and remove the proxy call through https://cors-anywhere.herokuapp.com/
    var tideDataUrl = "https://cors-anywhere.herokuapp.com/https://tidesandcurrents.noaa.gov/api/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date="
        + yesterday.format(DATE_FORMAT)
        + "&end_date="
        + tomorrow.format(DATE_FORMAT)
        + "&datum=MLLW&station="
        + stationId 
        + "&time_zone=lst_ldt&units=english&interval=hilo&format=json";
    
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onDataLoad.bind(this);
    this.xmlhttp.open("GET", tideDataUrl, true);
    this.xmlhttp.send();
  }
  
  onDataLoad() {
    if (this.xmlhttp.readyState==4) {
      if (this.xmlhttp.status==200) {
        var response = JSON.parse(this.xmlhttp.responseText);
        var result = [];
        var currentDate = moment().date();
        for (var i=0; i<response.predictions.length; i++) {
          var prediction = response.predictions[i];
          var predictionMoment = moment(prediction.t);
          result.push({x: predictionMoment, y: prediction.v});
        }
        this.createChart(result);
      } else {
        // On error, don't show a chart.
        console.error("Didn't get the expected status: " + this.xmlhttp.status);
      }
    }
  }
  
  createChart(tidePredictions) {
    var ctx = document.getElementById('tide-chart');
    var config = {
			type: 'line',
			data: {
        datasets: [{
          label: 'Tide Height',
          borderColor: BLACK,
          backgroundColor: BLUE,
          pointRadius: 5,
          pointHoverRadius: 10,
          data: tidePredictions,
        }]
      },
			options: {
				scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'hour'
            },
            ticks: {
              fontSize: FONT_SIZE,
              // Only display data for current day, even though we have more data than that.  The extra data isn't
              // visible, it helps form the curve at the graph boundaries.  And graphing a full days worth of data
              // helps shows the peaks and troughs in the graph.
              min: moment().startOf('day'),
              max: moment().endOf('day'),
            },
          }],
          yAxes: [{
            ticks: {
              // No min, since tide can go negative
              fontSize: 20,
            },
          }],
				},
        legend: {
          labels: {
            fontSize: FONT_SIZE
          },
        },
        // This uses the ChartJS annotation plugin to draw a red vertical line at the current time
        // The other charts are monitoring live data, and the last piece of data is most relevant.
        // This chart is using predictions, so it's much easier to read with a marker.
        annotation: {
          drawTime: 'afterDatasetsDraw',
          annotations: [
            {
              type: "line",
              mode: "vertical",
              scaleID: "x-axis-0",
              value: moment(),
              borderColor: "red",
              borderWidth: 3,
            }
          ]
        },
			},
		};
	  new Chart(ctx, config);
  }
}
