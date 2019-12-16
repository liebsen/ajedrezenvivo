module.exports = function (audio,vol) {
  if(vol === undefined) vol = 1
  if(audio === undefined) audio = "move.ogg";
  var audio = new Audio('/assets/audio/' + audio);
  audio.vol = vol

  var playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.then(_ => {
      // Automatic playback started!
      // Show playing UI.
    })
    .catch(error => {
      // Auto-play was prevented
      // Show paused UI.
    });
  }
}