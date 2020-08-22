'use strict';

let recordedBlobs;
let mediaDevices;

const videoElement = document.querySelector('video');
const audioInputSelect = document.querySelector('select#audioSource');
const audioOutputSelect = document.querySelector('select#audioOutput');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [audioInputSelect, audioOutputSelect, videoSelect];

audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);

function gotDevices(deviceInfos) {
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
      audioInputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'audiooutput') {
      option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
      audioOutputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
        .then(() => {
          console.log(`Success, audio output device attached: ${sinkId}`);
        })
        .catch(error => {
          let errorMessage = error;
          if (error.name === 'SecurityError') {
            errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
          }
          console.error(errorMessage);
          // Jump back to first output device in the list as it's the default.
          audioOutputSelect.selectedIndex = 0;
        });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}

function changeAudioDestination() {
  const audioDestination = audioOutputSelect.value;
  attachSinkId(videoElement, audioDestination);
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

const downloadButton = document.querySelector('button#download');
downloadButton.addEventListener('click', () => {
  const webm = 'video/webm'
  const date = new Date;
  const blob = new Blob(recordedBlobs, {type: webm});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `${date}.webm`;
  document.body.appendChild(a);
  console.log('[DOWNLOAD] RECORDING VIDEO DOWNLOADING');
  a.click();
  console.log('[DOWNLOAD COMPLETE] Recording VIDEO DOWNLOAD COMPLETION');
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});

const recordButton = document.querySelector('button#record');
recordButton.addEventListener('click', () => {
  if(recordButton.textContent === 'Start Recording'){
    startRecording();
  } else {
    stopRecording();
    recordButton.textcontent = 'Start Recording';
    playButton.disabled = false;
    downloadButton.disabled = false;
  }
})

function startRecording() {
  recordedBlobs = [];
  var mimeType = 'video/webm';
  let options = {mimeType: `${mimeType}; codecs=vp9, opus`};
  if(!MediaRecorder.isTypeSupported(options.mimeType)){
    console.error(`${options.mimeType} is not supported`);
    options = {mimeType: 'video/webm;codecs=vp8, opus'};
    if(!MediaRecorder.isTypeSupported(options.mimeType)){
      console.error(`${options.mimeType} is not supported`);
      options = {mimeType: mimeType}
      if(!MediaRecorder.isTypeSupported(options.mimeType)){
        console.error(`${options.mimeType} is not supported`);
        options = {mimeType: mimeType};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = {mimeType: ''};
        }
      }
    }
    try{
      mediaRecorder = new MediaRecorder(window.strem, options);
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e);
      errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
      return;
    }
  }
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop Recording';
  playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log('MediaRecorder started', mediaRecorder);
}

function handleDataAvailable(event){
  console.log('handleDataAvailable', event);
  if (event.data && event.data.size > 0){
    recordedBlobs.push(event.data);
  }
}

function start() {
  console.log('[WebRTC START]');
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const audioSource = audioInputSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    // 오디오를 사용하고 싶으시면 true로 변경하세요. 또는 91번줄 코드의 주석 처리를 해제 하세요.
    // audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    // true: 사용함 | false: 사용 안 함.
    audio: false,
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  console.log('[WebRTC SETTING]')
  console.log('AUDIO SETTING : ',constraints['audio']);
  console.log('VIDEO SETTING : ',constraints['video']);
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

audioInputSelect.onchange = start;
audioOutputSelect.onchange = changeAudioDestination;

videoSelect.onchange = start;

start();