mdc.ripple.MDCRipple.attachTo(document.querySelector(".mdc-button"));

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomDialog = null;
let roomId = null;

function init() {
  document.querySelector("#cameraBtn").addEventListener("click", openUserMedia);
  document.querySelector("#hangupBtn").addEventListener("click", hangUp);
  document.querySelector("#createBtn").addEventListener("click", createRoom);
  document.querySelector("#joinBtn").addEventListener("click", joinRoom);
  roomDialog = new mdc.dialog.MDCDialog(document.querySelector("#room-dialog"));
}

async function createRoom() {
  //creating a connection using RTCPeerConnection
  const db = firebase.firestore();
  const roomRef = await db.collection("rooms").doc();

  console.log("Create PeerConnection with configuration: ", configuration);
  peerConnection = new RTCPeerConnection(configuration);

  registerPeerConnectionListeners();

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  //  collecting ICE candidates
  const callerCandidatesCollection = roomRef.collection("callerCandidates");

  peerConnection.addEventListener("icecandidate", (event) => {
    if (!event.candidate) {
      console.log("Got final candidate!");
      return;
    }

    console.log("Got candidate: ", event.candidate);
    callerCandidatesCollection.add(event.candidate.toJSON());
  });

  // creating a room
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log("Created offer:", offer);

  const roomWithOffer = {
    offer: {
      type: offer.type,
      sdp: offer.sdp,
    },
  };

  await roomRef.set(roomWithOffer);
  roomId = roomRef.id;
  console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
  document.querySelector(
    "#currentRoom"
  ).innerText = `Your room ID is ${roomRef.id} `;

  peerConnection.addEventListener("track", (event) => {
    console.log("Got remote track:", event.streams[0]);
    event.streams[0].getTracks().forEach((track) => {
      console.log("Add a track to the remoteStream:", track);
      remoteStream.addTrack(track);
    });
  });

  // Listening for remote session description
  roomRef.onSnapshot(async (snapshot) => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data && data.answer) {
      console.log("Got remote description: ", data.answer);
      const rtcSessionDescription = new RTCSessionDescription(data.answer);
      await peerConnection.setRemoteDescription(rtcSessionDescription);
    }
  });

  // Listening for remote ICE candidates
  roomRef.collection("calleeCandidates").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        let data = change.doc.data();
        console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
}

function joinRoom() {
  //Joining a room when Room ID is entered by the user
  document.querySelector("#createBtn").disabled = true;
  document.querySelector("#joinBtn").disabled = true;

  document.querySelector("#confirmJoinBtn").addEventListener(
    "click",
    async () => {
      roomId = document.querySelector("#room-id").value;
      console.log("Join room: ", roomId);
      document.querySelector(
        "#currentRoom"
      ).innerText = `Room joined: ${roomId} `;
      await joinRoomById(roomId);
    },
    { once: true }
  );
  roomDialog.open();
}

async function joinRoomById(roomId) {
  const db = firebase.firestore();
  const roomRef = db.collection("rooms").doc(`${roomId}`);
  const roomSnapshot = await roomRef.get();
  console.log("Got room:", roomSnapshot.exists);

  if (roomSnapshot.exists) {
    console.log("Create PeerConnection with configuration: ", configuration);
    peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners();
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // collecting ICE candidates
    const calleeCandidatesCollection = roomRef.collection("calleeCandidates");
    peerConnection.addEventListener("icecandidate", (event) => {
      if (!event.candidate) {
        console.log("Got final candidate!");
        return;
      }
      console.log("Got candidate: ", event.candidate);
      calleeCandidatesCollection.add(event.candidate.toJSON());
    });

    peerConnection.addEventListener("track", (event) => {
      console.log("Got remote track:", event.streams[0]);
      event.streams[0].getTracks().forEach((track) => {
        console.log("Add a track to the remoteStream:", track);
        remoteStream.addTrack(track);
      });
    });

    // Code for creating SDP answer
    const offer = roomSnapshot.data().offer;
    console.log("Got offer:", offer);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    console.log("Created answer:", answer);
    await peerConnection.setLocalDescription(answer);

    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    };
    await roomRef.update(roomWithAnswer);

    // Listening for remote ICE candidates
    roomRef.collection("callerCandidates").onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }
}

async function openUserMedia(e) {
  // getting permission to access webcam and microphone and acces UserMedia
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  document.querySelector("#localVideo").srcObject = stream;
  localStream = stream;
  remoteStream = new MediaStream();
  document.querySelector("#remoteVideo").srcObject = remoteStream;

  console.log("Stream:", document.querySelector("#localVideo").srcObject);
  document.querySelector("#cameraBtn").disabled = true;
  document.querySelector("#joinBtn").disabled = false;
  document.querySelector("#createBtn").disabled = false;
  document.querySelector("#hangupBtn").disabled = false;
}
async function mute(e) {
  localStream = null;
}

async function hangUp(e) {
  const tracks = document.querySelector("#localVideo").srcObject.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });

  if (remoteStream) {
    remoteStream.getTracks().forEach((track) => track.stop());
  }

  if (peerConnection) {
    peerConnection.close();
  }

  document.querySelector("#localVideo").srcObject = null;
  document.querySelector("#remoteVideo").srcObject = null;
  document.querySelector("#cameraBtn").disabled = false;
  document.querySelector("#joinBtn").disabled = true;
  document.querySelector("#createBtn").disabled = true;
  document.querySelector("#hangupBtn").disabled = true;
  document.querySelector("#currentRoom").innerText = "";

  // Deleting room on hangup
  if (roomId) {
    const db = firebase.firestore();
    const roomRef = db.collection("rooms").doc(roomId);
    const calleeCandidates = await roomRef.collection("calleeCandidates").get();
    calleeCandidates.forEach(async (candidate) => {
      await candidate.ref.delete();
    });
    const callerCandidates = await roomRef.collection("callerCandidates").get();
    callerCandidates.forEach(async (candidate) => {
      await candidate.ref.delete();
    });
    await roomRef.delete();
  }

  document.location.reload(true);
}

function registerPeerConnectionListeners() {
  peerConnection.addEventListener("icegatheringstatechange", () => {
    console.log(
      `ICE gathering state changed: ${peerConnection.iceGatheringState}`
    );
  });

  peerConnection.addEventListener("connectionstatechange", () => {
    console.log(`Connection state change: ${peerConnection.connectionState}`);
  });

  peerConnection.addEventListener("signalingstatechange", () => {
    console.log(`Signaling state change: ${peerConnection.signalingState}`);
  });

  peerConnection.addEventListener("iceconnectionstatechange ", () => {
    console.log(
      `ICE connection state change: ${peerConnection.iceConnectionState}`
    );
  });
}

init();
