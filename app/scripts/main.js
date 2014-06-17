var pads = document.querySelectorAll('.pad');
var defaultUrls = ['../../examples/2.wav', '../../examples/3.wav', '../../examples/4.wav',
        '../../examples/5.wav', '../../examples/6.wav', '../../examples/7.wav', '../../examples/8.wav',
         '../../examples/9.wav', '../../examples/10.wav', '../../examples/11.wav', '../../examples/12.wav',];
var keys = ['1', '2', '3', '4', 'q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'];
var audioContext = audioContext();

function audioContext() {
  var context;

  if (typeof AudioContext !== "undefined") {
      context = new AudioContext();
    } else if (typeof webkitAudioContext !== "undefined") {
      context = new webkitAudioContext();
    } else {
      throw new Error('AudioContext not supported. :(');
  }

  return context;
}

var pad = function(element, url, key) {
  this.el = element;
  this.key = key;
  this.url = url;
  this.source = undefined;
  this.buffer = undefined;
  this.addListeners();
};

pad.prototype.addListeners = function () {
  var self = this;
  this.el.addEventListener('click', function(evt) { self.play.call(self, evt) }, false);
  this.el.addEventListener('dragover', cancel, false);
  this.el.addEventListener('dragenter', cancel, false);
  this.el.addEventListener('drop', function(evt) { self.uploader.call(self, evt) }, false);
  Mousetrap.bind(this.key, function(evt) {self.play.call(self, evt) }, false);
};

pad.prototype.needBuffer = function () {
  return this.buffer === undefined;
};

pad.prototype.onLoaded = function(source) {
  this.buffer = source;
  this.source = audioContext.createBufferSource();
  this.source.buffer = this.buffer;
  this.source.connect(audioContext.destination);
  this.source.start(audioContext.currentTime);
};

pad.prototype.play = function() {
  if (this.needBuffer()) {
    var self = this;
    loadSound(this.url, function(src) { self.onLoaded.call(self, src) });
  } else {
    console.log('WAT')
    this.onLoaded(this.buffer);
  }
};

pad.prototype.stop = function() {
  this.source.stop(audioContext.currentTime);
};

pad.prototype.uploader = function(e) {
  if (e.preventDefault) e.preventDefault();

  var self = this;
  var file = e.dataTransfer.files[0];
  var reader = new FileReader();
  reader.onloadend = function(src) { self.onDropEnd.call(self, src) };
  reader.readAsArrayBuffer(file);
};

pad.prototype.onDropEnd = function(src) {
  var self = this;
  if (src.target.result) {
    var buffer = src.target.result;
  }
  decode(buffer, function(src) { self.onLoaded.call(self, src) });
};

function cancel(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  return false;
}

function loadSound(url, cb) {
  makeRequest(url, cb);
}

function makeRequest(url, cb) {
  console.log('making request');

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    var data = request.response;

    decode(data, cb);
  };

  request.send();
}

function decode(data, success, error) {
  audioContext.decodeAudioData(data, success, error);
}

//bootstrap
function init() {
  for (var i = 0; i < pads.length; i++) {
    var url = defaultUrls[i];
    var key = keys[i];

    pads[i].setAttribute('data-id', i + 1);
    var padd = new pad(pads[i], url, key);
  }
}

init();
