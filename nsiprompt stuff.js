var engines = Services.search.getVisibleEngines();
var engineNames = [];
engines.forEach(function(engine) {
  engineNames.push(engine.name);
});
var addTheseEngineNamesToContext = [];


var check = {value: false};
var input = {value: "1"};
var result = Services.prompt.prompt(null, "Engine Count", "How many search engines to add to the conext menu? (Max: " + engines.length + ")", input, null, check);
if (result) {
  if (isNaN(input.value) || input.value == '') {
    Services.prompt.alert(null, "Error", "Must enter a number");
  } else {
    if (input.value > 0 && input.value <= engines.length) {
      for (var i=0; i<input.value; i++) {
        var selected = {};
        var result = Services.prompt.select(null, "Select Engine " + (i + 1), "Select the engine to add to menu in position " + (i + 1), engineNames.length, engineNames, selected);
        if (result) {
          console.log(selected);
          addTheseEngineNamesToContext.push(engineNames[selected.value]);
          if (i == input.value-1) {
            Services.prompt.alert(null, "ok windowListener.register", addTheseEngineNamesToContext);
          }
        } else {
          Services.prompt.alert(null, "Cancelled", "Cancelled");
        }
      }
      
    } else {
      Services.prompt.alert(null, "Error", "You only have " + engines.length + " search engines, must enter a number between 1 and " + engines.length);
    }
  }
}