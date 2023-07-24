window.onload = function() {
  loadChartData();
  
  // Reload chart data every 10 minutes
  setInterval(loadChartData, 10 * 60 * 1000);
};


function loadChartData() {
  // query the DOM for which chart types exist, and load them.
  var elements = document.getElementsByClassName("WUWind");
  for (var i=0; i<elements.length; i++) {
    new WUWind(elements[i].id);
  }
  
  elements = document.getElementsByClassName("TempestWind");
  for (var i=0; i<elements.length; i++) {
    new TempestWind(elements[i].id);
  }
  
  elements = document.getElementsByClassName("NWSWind");
  for (var i=0; i<elements.length; i++) {
    new NWSWind(elements[i].id);
  }
  
  elements = document.getElementsByClassName("BelchertownWind");
  for (var i=0; i<elements.length; i++) {
    new BelchertownWind(elements[i].id);
  }
  
  elements = document.getElementsByClassName("NOAAWind");
  for (var i=0; i<elements.length; i++) {
    new NOAAWind(elements[i].id, elements[i].getAttribute('timezone'));
  }
  
  elements = document.getElementsByClassName("TideChart");
  for (var i=0; i<elements.length; i++) {
    new TideChart(elements[i].id);
  }
}
