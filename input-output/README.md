# Input and Output

```js
audio: {deviceId: audioSource ? {exact: audioSource} : undefined}
```
위 코드를 사용시에는 하울링이 생길 수 있습니다.  
하울링이 생길 시 아래 코드의 주석을 확인하시고 변경하시면 되겠습니다.

```js
const audioSource = audioInputSelect.value;
const videoSource = videoSelect.value;
const constraints = {
    // 오디오를 사용하고 싶으시면 true로 변경하세요 또는 91번줄 코드의 주석 처리를 해제 하세요.
    // audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    // Audio => true: 사용함 | false: 사용 안 함.
    audio: false,
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
};
```
## v0.0.1
- 기본적인 장치 선택 가능

![Runing WebRTC](./image/main.png)

**v0.0.2 추가될 기능**  
- RePlay 기능 추가
- Record Download 기능 추가