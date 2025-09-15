
const video = document.getElementById('video')
const faceCam = document.getElementById('faceCam')
const captureEmotion = document.getElementById('captureEmotion')
const userQuery = document.getElementById('userQuery')
const getResponse = document.getElementById('getResponse')
const mainChatArea = document.getElementById('mainChatArea')
let currVoiceChatAIResponse = "";

let youtubeVideosSearchQuery = "";

let voiceChat = false;

const width = video.offsetWidth;
const height = 319;

let bestExpression="";
let bestExpressionValue=100;
let bestDiff=100;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  faceCam.append(canvas)
  const displaySize = { width: width, height: height }
  
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    // console.log(detections);
    
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})
captureEmotion.addEventListener('click',() => {
  bestDiff = 100;
  const clickedCanvas = document.createElement('Canvas');
  clickedCanvas.width = video.videoWidth;
  clickedCanvas.height = video.videoHeight;
  const ctx = clickedCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0, clickedCanvas.width, clickedCanvas.height);

  const dataURL = clickedCanvas.toDataURL();

  const imgElement = document.getElementById('capturedImage');
  imgElement.src = dataURL;

  const input = imgElement;
  const detectionsWithExpressions = faceapi.detectSingleFace(input, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().then(detectionsWithExpressions => {
    

    for(key in detectionsWithExpressions['expressions']) {
      if(detectionsWithExpressions['expressions'].hasOwnProperty(key)) {
          var value = detectionsWithExpressions['expressions'][key];

          if(value > 1){
            let diff = value-1;
            if(diff<bestDiff){
              bestExpressionValue = value;
              bestDiff = diff;
              bestExpression = key;
            }

          }else{
            let diff = 1-value;

            if(diff<bestDiff){
              bestExpressionValue = value;
              bestDiff = diff;
              bestExpression = key;
            }
          }
      }
    }
    // Write switch and case conditions to give ai suggestions based on the face expression of the user

    
    const personExpression = {
      "neutral": "I'm feeling unbiased today, suggest me things to change my Frame of mind",
      "happy": "I'm feeling delighted today, suggest me something to enjoy my happiness",
      "sad": "feeling sad and need some relaxation techniques",
      "angry": "I'm feeling angry today, how can I control myself doings unexpected things",
      "fearful": "I'm feeling afraid ,how can I quickly get rid of it",
      "disgusted": "I'm feeling disgusted. Can you give me a short list of uplifting activities or resources to help improve my mood",
      "surprised": "I'm surprised , how can I accede this unexpected situation calmly"
    };

    let prompt = "";

    switch (bestExpression) {
      case "neutral":
        prompt = personExpression[bestExpression];

        break;
      case "happy":
        prompt = personExpression[bestExpression];
        break;
      case "sad":
        prompt = personExpression[bestExpression];
        break;
      case "angry":
        prompt = personExpression[bestExpression];
        break;
      case "fearful":
        prompt = personExpression[bestExpression];
        break;
      case "disgusted":
        prompt = personExpression[bestExpression];
        break;
      case "surprised":
        prompt = personExpression[bestExpression];
        break;
      default:
        prompt = "If you don't know about the mental condition of a person what would you recommend";
        break;
    }

    sendUserEmotionState(bestExpression)

    const AIURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCmFDAW8GfdjQqXjXls_Q_s1yTGgid8hfc';
    
    
    fetch(AIURL, {
      method: "POST",
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt+aiConfigFaceExpression}] }],
      }),
    }).then((response)=>response.json()).then((data)=>{

      fetch(AIURL, {
        method: "POST",
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Write One Youtube search query for: ${prompt}`}]}],
        }),
      }).then((response) => response.json()).then((ytData) => {
          youtubeVideosSearchQuery = ytData.candidates[0].content.parts[0].text;
      });
      
      let responseData = data.candidates[0].content.parts[0].text;
      responseData = responseData.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    responseData = responseData.replace(/\*(.*?)\*/g, '<em>$1</em>');
      responseData = responseData.replaceAll("*", "•");
      responseData = responseData.replaceAll("##", "");
  

      // Getting current date and time for using it in hashing

      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      const responseInstance = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

      // import md5 from 'js-md5';

      // md5('Message to hash');
      // var hash = md5.create();
      // hash.update('Message to hash');
      // hash.hex();
                                          
      let content = `<div class="jokes-stories-ai">
                  <pre style="width:100%; text-align: left; margin:0; white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -pre-wrap white-space: -o-pre-wrap; word-wrap: break-word;"><p  id="content-${md5(responseInstance)}">`+responseData+`</p></pre>
                  <span class="align-end readIt" id="${md5(responseInstance)}" onclick="readResponse('${md5(responseInstance)}',1)">🔈</span>

                  <div class="chatOptionContainer">
                  <div class="getVideosBtn" onclick="getVideos()">Videos</div>
                  </div>
              </div>`;
      mainChatArea.insertAdjacentHTML('beforeend', content);

      const div = document.getElementById('mainChatArea');
      div.scrollTop = div.scrollHeight;

    })

  })
});


// Voice to text Converter Codes

function voiceToText(){
  var recognition = new webkitSpeechRecognition();
  // $("#recordAudio").attr("class","fa-solid fa-ear-listen");
  if(voiceChat){
    $("#voiceChatRecordAudio").attr("class","fa-regular fa-circle-stop voiceChatIcon");
  }else{
    $("#recordAudio").attr("class","fa-regular fa-circle-stop");
  }

  recognition.maxAlternatives = 100;
  // recognition.continuous = true;
  recognition.lang="en-GB";
  recognition.onresult= function(event){
      // console.log(event);
      if(voiceChat){
        document.getElementById("voiceChatQuery").innerHTML = event.results[0][0].transcript;
        $("#voiceChatRecordAudio").attr("class","fa-solid fa-microphone voiceChatIcon");
      }else{
        document.getElementById("userQuery").value = event.results[0][0].transcript;
        $("#recordAudio").attr("class","fa-solid fa-microphone");
      }
      
  }
  recognition.start();
}


// Text to Voice Converter Code

function readResponse(e,f){
  let voiceIco,speech;
  if(voiceChat){
    count = 1;
    voiceIco = document.getElementById("aiSoundIcon");
  }else{
    responseToRead = "content-"+e;

    voiceIco = document.getElementById(e);
    speech  = document.getElementById(responseToRead);
    count = f;
  }
  

  if(!speechSynthesis.speaking || speechSynthesis.pause()){
      if(voiceChat){
        speechText= currVoiceChatAIResponse;
      }else{
        speechText = speech.innerHTML;
        speechText = speechText.replaceAll("<b>", "");
        speechText = speechText.replaceAll("</b>", "");
        speechText = speechText.replaceAll("•", "");
      }

      var speechVoice = new SpeechSynthesisUtterance();
      var voices = speechSynthesis.getVoices();
      speechVoice.voice = voices[2];
      speechVoice.text = speechText;
      speechVoice.lang = 'en-US';
      speechVoice.pitch = 0.8; // Set the pitch to 1.2 (medium-high)
      speechVoice.rate = 1; // Set the rate to 0.8 (slightly slower)
      speechSynthesis.speak(speechVoice);  
  }

  if(count == 1){
    voiceIco.innerHTML="🔊";
    speechSynthesis.resume()
    if(voiceChat == false){
      setTimeout(() => {
        count = 2;
        document.getElementById(e).setAttribute('onclick',`readResponse('${e}',2)`);
    }, 300);
    }
    
  }else{
    speechSynthesis.paused
    voiceIco.innerHTML="🔈";
    if(voiceChat == false){
      count = 1;
      document.getElementById(e).setAttribute('onclick',`readResponse('${e}',1)`);
    }
  }

  setInterval(() => {
    if(!speechSynthesis.speaking && count == 2){
      voiceIco.innerHTML="🔈";
      if(voiceChat == false){
          count = 1;
      }

    }
  },100);


  }

function stopReading(){
  let voiceIco = document.getElementById("aiSoundIcon");
  speechSynthesis.cancel();
  voiceIco.innerHTML="🔈";
}



userQuery.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendUserQuery();
    getResponseFromAI();
    clearInput();
  }
});
getResponse.addEventListener("click",()=>{
  sendUserQuery();
  getResponseFromAI();
  clearInput();
});

function clearInput(){
  if(voiceChat){

  }else{
    userQuery.value = '';
  }
}

function sendUserQuery(){
  if(voiceChat){

  }else{
      let userQueryContent = `<div class="align-end chat-property-same chat-of-user">
      <p>`+userQuery.value+`</p>
  </div>`;
      mainChatArea.insertAdjacentHTML('beforeend', userQueryContent);
      const div = document.getElementById('mainChatArea');
      div.scrollTop = div.scrollHeight; 
  }
  
}

function sendUserEmotionState(e){
  let userQueryContent = `<div class="align-end chat-property-same chat-of-user">
                <p>Your Current Emotion: `+e+`</p>
            </div>`;
  mainChatArea.insertAdjacentHTML('beforeend', userQueryContent);
  const div = document.getElementById('mainChatArea');
  div.scrollTop = div.scrollHeight;
}

function getResponseFromAI(){
  const AIURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCmFDAW8GfdjQqXjXls_Q_s1yTGgid8hfc';
  let query = "";
  if(voiceChat){
    query = document.getElementById("voiceChatQuery").innerHTML+aiConfig;
    ytQuery = document.getElementById("voiceChatQuery").innerHTML;
  }else{
    query = userQuery.value+aiConfig;
    ytQuery = userQuery.value;
  }
  // Getting current date and time for using it in hashing

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const responseInstance = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  
  fetch(AIURL, {
    method: "POST",
    body: JSON.stringify({
      contents: [{ parts: [{ text: query}] }],
    }),
  }).then((response)=>response.json()).then((data)=>{
        
    fetch(AIURL, {
      method: "POST",
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Write One Youtube search query for: ${ytQuery}`}]}],
      }),
    }).then((response) => response.json()).then((ytData) => {
        youtubeVideosSearchQuery = ytData.candidates[0].content.parts[0].text;
    });

    
    let responseData = data.candidates[0].content.parts[0].text;

    if(voiceChat){
        responseData = responseData.replace(/\*\*(.*?)\*\*/g, '$1');
        responseData = responseData.replace(/\*(.*?)\*/g, '$1');
        responseData = responseData.replaceAll("*", "");
        responseData = responseData.replaceAll("##", "");
    }else{
        responseData = responseData.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        responseData = responseData.replace(/\*(.*?)\*/g, '<em>$1</em>');
        responseData = responseData.replaceAll("*", "•");
        responseData = responseData.replaceAll("##", "");
    }


    if(voiceChat){
        currVoiceChatAIResponse = responseData;
        readResponse();
    }else{
        let content = `<div class="jokes-stories-ai">
                  <pre style="width:100%; text-align: left; margin:0; white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -pre-wrap white-space: -o-pre-wrap; word-wrap: break-word;"><p  id="content-${md5(responseInstance)}">`+responseData+`</p></pre>
                  <span class="align-end readIt" id="${md5(responseInstance)}" onclick="readResponse('${md5(responseInstance)}',1)">🔈</span>
                  <div class="chatOptionContainer">
                    <div class="getVideosBtn" onclick="getVideos()" >Videos</div>
                  </div>
              </div>`;
        mainChatArea.insertAdjacentHTML('beforeend', content);
        const div = document.getElementById('mainChatArea');
        div.scrollTop = div.scrollHeight;
    }
    
  });
}

function toggleChanged(){
  const checkbox = document.getElementById('toggle-btn');
  speechSynthesis.cancel();
  if (checkbox && checkbox.checked) {
    $("#mainChatArea").toggleClass("none");
    $("#textInputArea").toggleClass("none");
    $("#voiceChatUI").toggleClass("none");
    voiceChat = true;
  }else{
    $("#mainChatArea").toggleClass("none");
    $("#textInputArea").toggleClass("none");
    $("#voiceChatUI").toggleClass("none");
    voiceChat=false;
  }
}

function getVideos(){
  let title = youtubeVideosSearchQuery;
  let fetchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${title}&type=video&key=AIzaSyBtd9TOx5bzYKMwfBKom6XyNsDWNUO0kac`;

  fetch(fetchURL).then(res => res.json()).then(data => {
    // console.log(data);
    
    for(let i=0; i<5; i++){
      let videoCode = `<a href="https://youtu.be/${data.items[i].id.videoId}" target="_blank">
                <div class="video-ai">
                    <div class="video-thumbnail">
                        <img src="${data.items[i].snippet.thumbnails.default.url}">
                    </div>
                    <div class="video-info">
                        ${data.items[i].snippet.title}
                    </div>
                </div>
            </a>`;

      mainChatArea.insertAdjacentHTML('beforeend', videoCode);
      const div = document.getElementById('mainChatArea');
      div.scrollTop = div.scrollHeight;
    }
    
  });
}

// getVideos("Printing Hello World in c language");


let content = `<div class="jokes-stories-ai">
                <pre style="width:100%; text-align: left; margin:0; white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -pre-wrap white-space: -o-pre-wrap; word-wrap: break-word;"><p>How can I help you today?</p></pre>
            </div>`;
mainChatArea.insertAdjacentHTML('beforeend', content);

let loadingContainer = document.querySelector(".loadingContainer");
let h1 = document.querySelector("h1");
setTimeout(()=> {
    h1.innerText = "> Remove all thoughts from your mind...";
},0);

setTimeout(()=> {
    h1.innerText = "> Use Headphones For Better Experience";
}, 3000);

setTimeout(()=> {
    h1.innerText = "> Keep your back straight while sitting down";
}, 6000);

setTimeout(()=> {
  $("#loadingContainer").toggleClass("none");
}, 9000);

