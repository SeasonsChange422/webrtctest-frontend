/*
 * @Author: Dhx
 * @Date: 2024-06-28 17:30:52
 * @Description: 
 * @FilePath: \vuetify-project\src\utils\socket.js
 */

let remoteAddress = "ws://localhost:8001/websocket-server"
let socket = {}
let initSocket = () => {
    socket = new WebSocket(remoteAddress)
    socket.onmessage =  (event)=>{
        handleMessage(event.data)
    }
}
let onOpen = (func) => {
    socket.onopen = func
    
}
let sendMessage = (message) => {
    socket.send(message)
}
let name = 0
let onOffer = ()=>{}
let onJoin = ()=>{}
let onAnswer = ()=>{}
let onCandidate = ()=>{}
const handleMessage = (message) => {
    let Obj = JSON.parse(message)
    console.log(name)
    if(Obj.name == name) return
    if(Obj.type == 'join') {
        // 新用户加入房间
        console.log('join')
        onJoin(Obj.name)
    } else if(Obj.type == 'offer'){
        // 接收offer
        onOffer(Obj.name,Obj.content)
    } else if(Obj.type == 'answer'){
        onAnswer(Obj.content)
    } else if(Obj.type == 'candidate'){
        onCandidate(Obj.content)
    }
}
const setName = (n) =>{
    name = n
}
const setHandler = (handler)=>{
    onOffer = handler.onOffer
    onJoin = handler.onJoin
    onAnswer = handler.onAnswer
    onCandidate = handler.onCandidate
}
const MessageCreator = {
    joinToRoom: (name) => {
        let message = {
            type: 'join',
            name: name,
            target: '',
            contnent: '',
        }
        MessageCreator.sendMsg(message)
    },
    sendOffer: (name,target,content)=>{
        console.log(content)
        let message = {
            type: 'offer',
            name: name,
            target: target,
            content: content
        }
        MessageCreator.sendMsg(message)
    },
    sendAnswer: (name,target,content)=>{
        let message = {
            type: 'answer',
            name: name,
            target: target,
            content: content
        }
        MessageCreator.sendMsg(message)
    },
    sendCandidate: (name,target,content)=>{
        let message = {
            type: 'candidate',
            name:name,
            target:target,
            content:content
        }
        MessageCreator.sendMsg(message)
    },
    sendMsg: (msg) => {
        sendMessage(JSON.stringify(msg))
    }
}
export default{remoteAddress,initSocket,sendMessage,onOpen,setHandler,MessageCreator,setName}