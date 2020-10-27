window.onload = function() {
  new WUWind('KCADALYC37');
  new WUWind('KCADALYC1');
  new BelchertownWind('https://www.mixdivr.org/wx/weewx/belchertown/json/homepage.json');
  new WUWind('KCASANFR69');
  new AWWind('80:7D:3A:7C:36:29');
  new NOAAWind('urn:ioos:station:wmo:46026', 7);
  new NWSWind('MTR/84,122');
  new NWSWind('MTR/84,124');
  new TideChart('9414290');
};

// TODO: Refresh the page on a set interval.  Maybe every 10 minutes.
