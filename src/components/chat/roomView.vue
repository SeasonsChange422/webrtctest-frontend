<!--
 * @Author: Dhx
 * @Date: 2024-02-27 13:50:40
 * @Description: 
 * @FilePath: \vuetify-project\src\components\chat\roomView.vue
-->
<script setup lang="ts">
import { ref } from 'vue';
import socket from '@/utils/socket.js'
var myoffer = ref('')
var myanswer = ref('')
var otheroffer = ref('')
var otheranswer = ref('')
var candidates = ref<RTCIceCandidate[]>([])
var othercandidates = ref('')
var yourConn: any;
var stream: any;
// var RTCSessionDescription:any;
var PeerConnection: any;
// var isVideo = false;
// var isCaller = false;
// var currentUserInfo = {};
// var isPC = true;
// var preHeadPath = "file/head/";
// var preUploadPath = "/file/upload/";
// var pictureCache = new Map();
var localVideo = ref<any>(null);
var remoteVideo = ref<any>(null);
let name = 0
let targetUser = 0
// var minflag = 0;
// var audioVideoDevices;
function initWebRTC() {
    name = Math.ceil((Math.random() * 1e19) / 1)
    socket.setName(name)
    // @ts-expect-error
    PeerConnection = (window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection || undefined);
    // RTCSessionDescription = (window.webkitRTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription || undefined);

    if (navigator.mediaDevices === undefined) {
        // @ts-expect-error
        navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            // @ts-expect-error
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }

    var mediaOpts = {
        // audio: audioVideoDevices.audioinput || audioVideoDevices.audiooutput,
        audio: true,
        // video: audioVideoDevices?.video ? { facingMode: "user" } : true
    }
    // @ts-expect-error
    navigator.getUserMedia(mediaOpts, successFunc, errorFunc);


    function successFunc(myStream: any) {
        stream = myStream;
        //displaying local video stream on the page
        localVideo.value.srcObject = stream;
        console.log(stream)
        //using Google public stun server,turn中继服务器需要自己搭建，可参考网上coturn搭建教程
        var configuration = {
            iceServers: [
                // {
                //     'urls': 'stun:stun.l.google.com:19302'
                // },
                { urls: "stun:43.138.140.21:3478" },
                { urls: "turn:43.138.140.21:3478", username: "dhx", credential: "142857" }
            ]
        };

        yourConn = new RTCPeerConnection(configuration);

        // setup stream listening
        yourConn.addStream(stream);
        //when a remote user adds stream to the peer connection, we display it
        yourConn.onaddstream = function (e: any) {
            remoteVideo.value.srcObject = e.stream;

        };
        // stream.getTracks().forEach(track => {
        //     yourConn.addTrack(track, stream);
        // });
        // Setup ice handling
        yourConn.onicecandidate = function (event: any) {
            if (event.candidate) {
                console.log(event.candidate)
                candidates.value.push(event.candidate)
                // websocket.send(JSON.stringify({
                //     from: currentUserInfo.userName,
                //     to: isCaller ? currentUserInfo.to : videodata.caller,
                //     contentType: "candidate",
                //     content: event.candidate
                // }));
            }
        };
        setInterval(() => {
            if (candidates.value.length != 0) {
                socket.MessageCreator.sendCandidate(name, targetUser, candidates.value[0])
                candidates.value.shift();
            }
        }, 1000)
        yourConn.ontrack = function (evt: any) {
            console.log(evt);
            remoteVideo.value!.srcObject = evt.streams[0];
            remoteVideo.value.muted = true
        }

    }
    function errorFunc(err: any) {
        if ("NotFoundError" == err.name) {
            console.log("设备不具备视频、音频条件或没有音视频权限");
        } else {
            console.log(err.name);
        }
        // isVideo = false;
        // isCaller = false;
    }


}
const handleJoin = async function (target) {
    targetUser = target
    let offer = await yourConn.createOffer()
    yourConn.setLocalDescription(offer)
    console.log("offer:", offer, yourConn.localDescription)
    socket.MessageCreator.sendOffer(name, target, offer)
}
const handleOffer = async function (target, offer) {
    yourConn.setRemoteDescription(new RTCSessionDescription(offer));
    let answer = await yourConn.createAnswer();
    yourConn.setLocalDescription(answer)
    socket.MessageCreator.sendAnswer(name, target, answer)
}
const handleAnswer = function (answer) {
    yourConn.setRemoteDescription(new RTCSessionDescription(answer));
}
const handleCandidate = async function (candidate) {
    yourConn.addIceCandidate(new RTCIceCandidate(candidate))
}
initWebRTC()
setTimeout(() => {
    socket.initSocket()
    let handler = {
        onJoin: handleJoin,
        onOffer: handleOffer,
        onAnswer: handleAnswer,
        onCandidate: handleCandidate
    }
    socket.setHandler(handler)
    socket.onOpen(() => {
        socket.MessageCreator.joinToRoom(name)
    })
}, 2000)


// const createOffer = function () {
//     // create an answer to an offer
//     yourConn.createOffer(function (offer: any) {
//         console.log(offer)
//         // yourConn.setLocalDescription(offer);
//         setTimeout(() => {
//             myoffer.value = yourConn.localDescription

//         }, 4000)
//     }, function (error: any) {
//         console.log(error)
//         alert("Error when creating an offer");
//     });
// }
// const handleOffer = function () {
//     yourConn.setRemoteDescription(new RTCSessionDescription(JSON.parse(otheroffer.value)));
//     yourConn.createAnswer(function (answer: any) {
//         yourConn.setLocalDescription(answer);
//         console.log(answer)
//         myanswer.value = answer
//     }, function (error: any) {
//         console.log(error)
//         alert("Error when creating an answer");
//     });
// }
// const handleAnswer = function () {
//     yourConn.setRemoteDescription(new RTCSessionDescription(JSON.parse(otheranswer.value)))
// }
// const handleCandidates = function () {
//     let candidateArray = JSON.parse(othercandidates.value)
//     for (let i = 0; i < candidateArray.length; i++) {
//         console.log(candidateArray[i])
//         yourConn.addIceCandidate(new RTCIceCandidate(candidateArray[i]))
//     }
// }

</script>
<template>
    <div class="roomView">
        <div>local</div>
        <audio ref="localVideo" controls style="height: 100px;"></audio>
        <div>remote</div>
        <!-- <button @click="createOffer()">createoffer</button>
        <button @click="handleOffer()">createanswer</button> -->
        <input style="border: black 1px solid;" v-model="otheroffer" placeholder="offer">
        <!-- <button @click="handleAnswer()">answer</button> -->
        <input style="border: black 1px solid;" v-model="otheranswer" placeholder="answer">
        <button @click="handleCandidates()">handleCandidates</button>
        <input style="border: black 1px solid;" v-model="othercandidates" placeholder="candidates">
        <audio ref="remoteVideo" controls style="height: 100px;"></audio>
        <div style="display: flex;">
            <div style="width: 33%;">
                <textarea v-text="JSON.stringify(myoffer)"
                    style="height: 200px;width:100%;border:black 1px solid;"></textarea>
            </div>
            <div style="width: 33%;">
                <textarea v-text="JSON.stringify(myanswer)"
                    style="height: 200px;width:100%;border:black 1px solid;"></textarea>
            </div>
            <div style="width: 33%;">
                <textarea v-text="JSON.stringify(candidates)"
                    style="height: 200px;width:100%;border:black 1px solid;"></textarea>
            </div>
        </div>
    </div>
</template>
<style scoped>
@import "@/assets/style/chat/room.css";
</style>