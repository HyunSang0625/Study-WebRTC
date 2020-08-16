# GetUserMedia
getUserMedia()비디오 요소에서 비디오 스트림을 표시합니다.

- [GetUesrMedia Sample](https://webrtc.github.io/samples/src/content/getusermedia/gum/)
- [GitHub Source](https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/gum)

```js
const constraints = window.constraints = {
  audio: false,
  video: true
};
```
기본적인 Media에 대해서 설정합니다.  
비디오만 되게 하였고, 오디오를 사용하고 싶으시면 ```true```로 바꾸시면 됩니다.  
```js
function handleSuccess(stream) {
  const video = document.querySelector('video');
  const videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log(`Using video device: ${videoTracks[0].label}`);
  window.stream = stream;
  video.srcObject = stream;
}
```

```js
async function init(e) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
    e.target.disabled = true;
  } catch (e) {
    handleError(e);
  }
}
```

```js
document.querySelector('#showVideo').addEventListener('click', e => init(e));
```
버튼을 클씩시 event를 init(e)로 넘겨줘서 함수 init(e)가 실행됩니다.