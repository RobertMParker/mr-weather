window.onload = function() {
  // On window load, query the DOM for which chart types exist, and load them.
  
  var elements = document.getElementsByClassName("WUWind");
  for (var i=0; i<elements.length; i++) {
    new WUWind(elements[i].id);
  }
  
  elements = document.getElementsByClassName("NWSWind");
  for (var i=0; i<elements.length; i++) {
    new NWSWind(elements[i].id);
  }
  
  elements = document.getElementsByClassName("BelchertownWind");
  for (var i=0; i<elements.length; i++) {
    new BelchertownWind(elements[i].id);
  }
  
  var elements = document.getElementsByClassName("AWWind");
  for (var i=0; i<elements.length; i++) {
    new AWWind(elements[i].id);
  }
  
  var elements = document.getElementsByClassName("NOAAWind");
  for (var i=0; i<elements.length; i++) {
    new NOAAWind(elements[i].id, elements[i].getAttribute('timezone'));
  }
  
  var elements = document.getElementsByClassName("TideChart");
  for (var i=0; i<elements.length; i++) {
    new TideChart(elements[i].id);
  }
};

// TODO: Refresh the page on a set interval.  Maybe every 10 minutes.
