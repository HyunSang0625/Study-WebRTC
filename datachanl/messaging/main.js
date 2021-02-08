import {LitElement, html} from 'https://unpkg.com/@polymer/lit-element@0.6.2?module';

class MessagingSample extends LitElement {
    constructor() {
        super();
        this.connected =false;
        this.localMessage = '';
        this.remoteMessages = '';   
    }

    disconnect() {
        this._localConnection.close();
        this._remoteConnection.close();
    }

    async connect() {
        console.log('Connect!');
        try {
            const datachannelParams = {ordered: true};
            window.localConnection = this._localConnection = new RTCPeerConnection();
            this._localConnection.addEventListener('icecandidate', async e => {
                console.log('Local Connection ICE Candidate: ', e.candidate);
                await this._remoteConnection.addIceCandidate(e.candidate);
            });

            window.localChannel = this._localChannel = this._localConnection
                .createDataChannel('messaging-channel', datachannelParams);
            this.
        }
    }
}