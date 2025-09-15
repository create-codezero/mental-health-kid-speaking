const div = document.getElementById('videoContainer');
const width = div.offsetWidth;
let stoppedSession = 0;

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyClaBx4MVZdJbHG8kC-1XE4VZMjGczLTwA",
    authDomain: "psit-project-12199.firebaseapp.com",
    projectId: "psit-project-12199",
    storageBucket: "psit-project-12199.appspot.com",
    messagingSenderId: "124664563235",
    appId: "1:124664563235:web:b7d034b445870f20519396",
    measurementId: "G-PZ87S8162Y"
});

const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

// voice to text converter
function voiceToText(){
    var recognition = new webkitSpeechRecognition();
    let oldContent = document.getElementById("kidSpeech").value;
    console.log("me called again");

    // recognition.maxAlternatives = 10;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang="en-GB";

    recognition.onresult= function(event){
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        }
        document.getElementById("kidSpeech").value = oldContent + " " + transcript;
        console.log("recording done");
        console.log("result: "+transcript);
        
        // recognition.start();

        // recall the voice to text
        // voiceToText();
    }
    recognition.onend = () => {
        // recognition.stop();
        if(!stoppedSession){
            voiceToText();
        }
        console.log("ended");
    }

    // recognition.stop = () => {
    //     console.log("stoped");
    //     // recognition.stop();
    //     // voiceToText();
    //     // recognition.start();
    // }
    recognition.start();

    // navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    //     console.log("system audio me hu");
        
    //     stream.getAudioTracks()[0].enabled = false; // Mute the audio
    //     }).catch(error => console.error('Error getting user media:', error));
}

const stopSessionShowProgress = () => {
    stopVideo();
    stoppedSession = 1;
    let userSpeech = document.getElementById("kidSpeech").value;
    let videoContent = "big small happy sad hot cold on off fast slow push pull front back stop go dry wet full empty lazy active afraid brave laugh cry right left boy girl open close sit stand healthy sick break fix quit noisy catch thrown sunny cloudy";

    let wordsAlreadyCounted = [];

    let videoContentArr,userSpeechArr;
    videoContentArr = videoContent.split(" ");
    userSpeechArr = userSpeech.split(" ");

    let previousWord="";
    let totalWordSpoken = 0;


    userSpeechArr.forEach((word) => { //lopp 1
        let isValidCount = 1;
        word = word.toLowerCase();
        let videoWordMatched = 0;
        
        if(previousWord != word){

            videoContentArr.forEach((videoWord)=>{ //loop 2
                videoWord = videoWord.toLowerCase();
                // console.log(word + "   " + videoWord);
                


                if(videoWord === word){
                    videoWordMatched = 1;
                    // console.log("Matched Above Combination");
                    

                    wordsAlreadyCounted.forEach((countedWord)=>{ //loop 3
                        countedWord = countedWord.toLowerCase();

                        if(countedWord === word){
                            // console.log("Matched but word already Counted");
                            
                            isValidCount = 0;
                        }
                    });

                }

            });


        }else{
            isValidCount = 0;
        }
        

        if(isValidCount == 1 && videoWordMatched == 1){
            wordsAlreadyCounted.push(word)
            totalWordSpoken++;
        }

        console.log(wordsAlreadyCounted)
        previousWord = word;
    });

    console.log(totalWordSpoken);

    document.getElementById('kidsProgress').innerHTML = "Total Words in Video: " + videoContentArr.length + "<br>Total Words Kid Spoken: " + totalWordSpoken;

    // Getting current date and time for using it in hashing
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const responseInstance = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    db.collection('childProgressReport')
            .add({
                kidSpoken: userSpeech,
                sessionTakenAt: responseInstance,
                totalCorrectWordsSpoken: totalWordSpoken,
                totalVideoWords:videoContentArr.length,
                totalWordsKidSpoken: userSpeechArr.length
            })
    
}

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

function onYouTubeIframeAPIReady() {
     player = new YT.Player('player', {
          height: Number(width)/16*9,
          width: width,
          videoId: 'BWdXN0wwi6A',
          playerVars: {
               'playsinline': 1
          },
          events: {
               'onReady': onPlayerReady,
               'onStateChange': onPlayerStateChange
          }
     });
}

function onPlayerReady(event) {
    //  event.target.playVideo();
    // voiceToText();
}

var done = false;

function onPlayerStateChange(event) {
     if (event.data == YT.PlayerState.PLAYING && !done) {
          // this code will be executed when video will played
          voiceToText();
          $("#playerControlBlocker").toggleClass("none");
          done = true;
     }
}

function stopVideo() {
    $("#playerControlBlocker").toggleClass("none");
    player.stopVideo();
}


