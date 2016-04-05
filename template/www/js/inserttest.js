var runTests = function() {
  var testFrame = document.createElement('iframe');
  testFrame.width = "100%";
  testFrame.height = "100%";
  testFrame.id = "test-frame";
  testFrame.src = "NEWURL";
  document.getElementsByTagName('body')[0].appendChild(testFrame);
  INIT
};
