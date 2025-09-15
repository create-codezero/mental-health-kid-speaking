const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyClaBx4MVZdJbHG8kC-1XE4VZMjGczLTwA",
    authDomain: "psit-project-12199.firebaseapp.com",
    projectId: "psit-project-12199",
    storageBucket: "psit-project-12199.appspot.com",
    messagingSenderId: "124664563235",
    appId: "1:124664563235:web:b7d034b445870f20519396",
    measurementId: "G-PZ87S8162Y"
});

document.querySelectorAll('.color').forEach((element) => {
    element.addEventListener('click', (event) => {
        let color = element.getAttribute('data-bgcolor');

        document.getElementById("therapyTitle").dataset.bgcolor = color;
        document.getElementById("therapyContent").dataset.bgcolor = color;
        document.getElementById("therapyTheme").setAttribute('value',color);
      });
});

let currWorkingTherapy,doneTill=0;


const db = firebaseApp.firestore();
const auth = firebaseApp.auth();


const addTherapyForm = () => {
    $("#addTherapy").toggleClass("none");
}

const addTherapy = () => {
    const therapyContent = document.getElementById('therapyContent').value
    const therapyTitle = document.getElementById('therapyTitle').value

    if(therapyTitle==="" || therapyTitle.length === 0 || therapyContent==="" || therapyContent.length === 0 ){
        alert("Please fill all the fields");
    }else{
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const responseDate = `${day}/${month}/${year}`;
        const responseTime = `${hours}:${minutes}:${seconds}`;

        db.collection('therapy')
        .add({
            therapyTitle: therapyTitle,
            therapyContent: therapyContent,
            therapyPeriod: 30,
            therapyDoneTill:0,
            therapyDate: responseDate,
            therapyLastTaken: responseDate,
            therapyTime: responseTime
        })
        .then((docRef) => {
            let currRef = docRef.id;

            db.collection('therapyContentTypes').doc(currRef)
            .set({
                therapyContentTypes: "Meditations,Yoga,Reading,Videos",
                meditationsRating:5,
                yogaRating:5,
                readingRating:5,
                videosRating:5,
                therapyDoneTill:0,
                therapyDate: responseDate,
                therapyLastTaken: responseDate,
                therapyTime: responseTime
            })

            document.getElementById('therapyContent').value = "";
            document.getElementById('therapyTitle').value = "";
            document.getElementById("oldTherapyContainer").innerHTML = "";
            $("#addTherapy").toggleClass("none");
            getTherapies();
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
    }

    
}

const getTherapies = () => {
    db.collection('therapy')
    .orderBy("therapyDate","desc")
    .get()
    .then((data) => {
        const dataValue = data.docs.map((item) => {
            return{...item.data(), id: item.id}
        });

        for (const key in dataValue) {
            let contentCode = `<div class="oldElementContainer" data-bgcolor="${dataValue[key].therapyTheme}" onclick="loadTherapyContent('${dataValue[key].id}')">
                <div class="oldElementContainerHeader">
                    <div class="therapyDetails">
                        <p class="therapyTitle" id="${dataValue[key].id}-title">${dataValue[key].therapyTitle}</p>
                        <p class="therapyDate" style="font-size: 10px;">Date: ${dataValue[key].therapyDate}</p>
                    </div>
                    <div class="oldElementHeaderBtnContainer">
                        <!--- <div class="elementHeaderBtn" onclick="deleteTherapy('${dataValue[key].id}')"><i class="fa-solid fa-trash"></i></div> --->
                        <p>${dataValue[key].therapyDoneTill} days done</p>
                    </div>
                </div>
                <div class="oldElementContentContainer">
                    <p id="${dataValue[key].id}-content">${dataValue[key].therapyContent}</p>
                </div>
            </div>`;
            document.getElementById("oldTherapyContainer").insertAdjacentHTML('beforeend',contentCode);
          }
        
        
    }) 

}


const updateJournal = () => {
    const journalContent = document.getElementById('editJournalContent').value
    const journalTitle = document.getElementById('editJournalTitle').value
    const journalReference = document.getElementById('editJournalReference').value

    db.collection('journalDB').doc(journalReference)
    .update({
        journalTitle: journalTitle,
        journalContent: journalContent
    })
    .then(() => {

        document.getElementById('editJournalContent').value = "";
        document.getElementById('editJournalTitle').value = "";
        document.getElementById('editJournalReference').value = "";
        // document.getElementById(`${journalReference}-title`).value = journalTitle;
        // document.getElementById(`${journalReference}-content`).value = journalContent;
        
        document.getElementById("oldJournalContainer").innerHTML = "";
        $("#editJournal").toggleClass("none");
        getJournals();
    })
    .catch((error) => {
        console.error("Error updating document: ", error);
    });
}

const editTherapy = (e) => {
    db.collection('therapy').doc(e)
    .get()
    .then((data) => {
        document.getElementById('editTherapyContent').value = data._delegate._document.data.value.mapValue.fields.therapyContent.stringValue;
        document.getElementById('editTherapyTitle').value = data._delegate._document.data.value.mapValue.fields.therapyTitle.stringValue;
        document.getElementById('editTherapyReference').value = e;

        $("#editTherapy").toggleClass("none");
    })

}

const deleteTherapy = (e) => {
    db.collection('therapy').doc(e).delete()
    .then(() => {
        // alert('Therapy Deleted');
        document.getElementById("oldTherapyContainer").innerHTML = "";
        getTherapies();
    })
    .catch((err) =>{
        console.log(err)
    })
}


function voiceToText(){
    var recognition = new webkitSpeechRecognition();
    $("#recordAudio").attr("class","fa-regular fa-circle-stop");
    let oldContent = document.getElementById("therapyContent").value;
  
    recognition.maxAlternatives = 100;
    // recognition.continuous = true;
    recognition.lang="en-GB";
    recognition.onresult= function(event){
        document.getElementById("therapyContent").value = oldContent + " " + event.results[0][0].transcript;
        $("#recordAudio").attr("class","fa-solid fa-microphone");
    }
    recognition.start();
}

const loadTherapyContent = (id) => {
    let docRef = id;
    currWorkingTherapy = id;
    let contentTypes,therapyDate,firstLoad=0;
    $("#therapySelectionTab").toggleClass("none");
    $("#therapyContentContainer").toggleClass("none");
    

    db.collection('therapy').doc(docRef)
    .get()
    .then((data) => {
        doneTill = data._delegate._document.data.value.mapValue.fields.therapyDoneTill.integerValue;
        let total = data._delegate._document.data.value.mapValue.fields.therapyPeriod.integerValue;
        let query = data._delegate._document.data.value.mapValue.fields.therapyContent.stringValue;
        
        therapyDate = data._delegate._document.data.value.mapValue.fields.therapyLastTaken.stringValue;

        const separator = "/";
        const dateArr = therapyDate.split(separator);
        let powerText = "th";

        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const responseDate = `${day}/${month}/${year}`;
        const responseTime = `${hours}:${minutes}:${seconds}`;

        if(Number(day) > Number(dateArr[0]) && Number(month) >= Number(dateArr[1]) && Number(year) >= Number(dateArr[2])){

            if(Number(doneTill)>0){
                // New day content should be unlocked
                for(let i=1;i<=Number(doneTill)+1;i++){
                    switch (i) {
                        case 1:
                            powerText = "st";
                            break;
                        case 2:
                            powerText = "nd";
                            break;
                        case 3:
                            powerText = "rd";
                            break;
                        default:
                            powerText = "th";
                    }
                    let content =`<div class="roundDailyButton" onclick="loadDayDataBB('${docRef}','${i}')">
                    <p class="powerContainedText">${i}<span class="powerText">${powerText}</span></p>
                    <p>Day</p>
                </div>`;
                    document.getElementById("therapyContentHeader").insertAdjacentHTML('beforeend',content);
                    if(Number(doneTill)+1 ==i){
                        firstLoad = 1;
                        loadDayContent(i,firstLoad,query,docRef);
                    }
                }
        
                for(let i=Number(doneTill)+2;i<=Number(total);i++){
                    switch (i) {
                        case 1:
                            powerText = "st";
                            break;
                        case 2:
                            powerText = "nd";
                            break;
                        case 3:
                            powerText = "rd";
                            break;
                        default:
                            powerText = "th";
                    }
                    let content =`<div class="roundDailyButton locked">
                    <p class="powerContainedText">${i}<span class="powerText">${powerText}</span></p>
                    <p>Day</p>
                </div>`;
                    document.getElementById("therapyContentHeader").insertAdjacentHTML('beforeend',content);
                }
            }else{
                for(let i=1;i<=Number(doneTill)+1;i++){
                    switch (i) {
                        case 1:
                            powerText = "st";
                            break;
                        case 2:
                            powerText = "nd";
                            break;
                        case 3:
                            powerText = "rd";
                            break;
                        default:
                            powerText = "th";
                    }
                    let content =`<div class="roundDailyButton" onclick="loadDayDataBB('${docRef}','${i}')">
                    <p class="powerContainedText">${i}<span class="powerText">${powerText}</span></p>
                    <p>Day</p>
                </div>`;
                    document.getElementById("therapyContentHeader").insertAdjacentHTML('beforeend',content);
                    if(Number(doneTill)+1 ==i){
                        firstLoad = 1;
                        loadDayContent(i,firstLoad,query,docRef);
                    }
                }
        
                for(let i=Number(doneTill)+2;i<=Number(total);i++){
                    switch (i) {
                        case 1:
                            powerText = "st";
                            break;
                        case 2:
                            powerText = "nd";
                            break;
                        case 3:
                            powerText = "rd";
                            break;
                        default:
                            powerText = "th";
                    }
                    let content =`<div class="roundDailyButton locked">
                    <p class="powerContainedText">${i}<span class="powerText">${powerText}</span></p>
                    <p>Day</p>
                </div>`;
                    document.getElementById("therapyContentHeader").insertAdjacentHTML('beforeend',content);
                }
            }

        }else{
            // New day content should not be unlocked

            if(Number(doneTill)>0){
                
                for(let i=1;i<=Number(doneTill);i++){
                    switch (i) {
                        case 1:
                            powerText = "st";
                            break;
                        case 2:
                            powerText = "nd";
                            break;
                        case 3:
                            powerText = "rd";
                            break;
                        default:
                            powerText = "th";
                    }
                    let content =`<div class="roundDailyButton" onclick="loadDayDataBB('${docRef}','${i}')">
                    <p class="powerContainedText">${i}<span class="powerText">${powerText}</span></p>
                    <p>Day</p>
                </div>`;
                    document.getElementById("therapyContentHeader").insertAdjacentHTML('beforeend',content);
                    if(Number(doneTill) ==i){
                        firstLoad = 0;
                        loadDayContent(i,firstLoad,query,docRef);
                    }
                }
        
                for(let i=Number(doneTill)+1;i<=Number(total);i++){
                    switch (i) {
                        case 1:
                            powerText = "st";
                            break;
                        case 2:
                            powerText = "nd";
                            break;
                        case 3:
                            powerText = "rd";
                            break;
                        default:
                            powerText = "th";
                    }
                    let content =`<div class="roundDailyButton locked">
                    <p class="powerContainedText">${i}<span class="powerText">${powerText}</span></p>
                    <p>Day</p>
                </div>`;
                    document.getElementById("therapyContentHeader").insertAdjacentHTML('beforeend',content);
                }
            }else{
                for(let i=1;i<=Number(doneTill)+1;i++){
                    switch (i) {
                        case 1:
                            powerText = "st";
                            break;
                        case 2:
                            powerText = "nd";
                            break;
                        case 3:
                            powerText = "rd";
                            break;
                        default:
                            powerText = "th";
                    }
                    let content =`<div class="roundDailyButton" onclick="loadDayDataBB('${docRef}','${i}')">
                    <p class="powerContainedText">${i}<span class="powerText">${powerText}</span></p>
                    <p>Day</p>
                </div>`;
                    document.getElementById("therapyContentHeader").insertAdjacentHTML('beforeend',content);
                    if(Number(doneTill)+1 ==i){
                        firstLoad = 1;
                        loadDayContent(i,firstLoad,query,docRef);
                    }
                }
        
                for(let i=Number(doneTill)+2;i<=Number(total);i++){
                    switch (i) {
                        case 1:
                            powerText = "st";
                            break;
                        case 2:
                            powerText = "nd";
                            break;
                        case 3:
                            powerText = "rd";
                            break;
                        default:
                            powerText = "th";
                    }
                    let content =`<div class="roundDailyButton locked">
                    <p class="powerContainedText">${i}<span class="powerText">${powerText}</span></p>
                    <p>Day</p>
                </div>`;
                    document.getElementById("therapyContentHeader").insertAdjacentHTML('beforeend',content);
                }
            }

        }

    })
    
}

const loadDayContent = (e,firstLoad,query,docRef) => {
    let contentTypeArr,contentTypeString,getThisTypeContent;

    // get which content type should be load

    db.collection('therapyContentTypes').doc(docRef)
    .get()
    .then((data) => {
        contentTypeString = data._delegate._document.data.value.mapValue.fields.therapyContentTypes.stringValue;

        contentTypeArr = contentTypeString.split(",");

        let arrLength = contentTypeArr.length;
        e = Number(e);
        if(e>arrLength){
            currContentType = e%arrLength;
            currContentType--;
            getThisTypeContent = contentTypeArr[currContentType];
        }else{
            currContentType = e-1;
            getThisTypeContent = contentTypeArr[currContentType];
        }

        if(Number(firstLoad)){
            loadDayData(query,getThisTypeContent,docRef,e);
        }else{
            loadDayDataBB(docRef,e);
        }
    })
}

const rateIt = (dr,rateTillCount,dayNum) => {
    let contentRef = dr+"-dailyC-"+dayNum;
    rateTillCount = Number(rateTillCount);
    db.collection('therapyContents').doc(contentRef)
    .update({
        contentRating: rateTillCount
    }).then(()=>{
        loadDayDataBB(dr,dayNum);
    })
    
}

const loadDayDataBB = (dr,dayNum) => {
    const thisDayRef = dr+"-dailyC-"+dayNum;
    
    let ratingContainer = document.getElementById('ratingContainer');
    ratingContainer.innerHTML = "";

    db.collection('therapyContents').doc(thisDayRef)
    .get()
    .then((data) => {
        contentData = data._delegate._document.data.value.mapValue.fields.content.stringValue;
        contentDay = data._delegate._document.data.value.mapValue.fields.contentDay.integerValue;
        contentTypeString = data._delegate._document.data.value.mapValue.fields.therapyContentTypes.stringValue;
        therapyTakenDate = data._delegate._document.data.value.mapValue.fields.therapyTakenDate.stringValue;
        contentRating = data._delegate._document.data.value.mapValue.fields.contentRating.integerValue;
        

        let content = `<p  id="content">`+contentData+`</p>`;
        document.getElementById('loadContentHere').innerHTML = content;
        

        for(let i=1;i<=Number(contentRating);i++){
            
            let content = `<i class="fa-solid fa-star" onclick="rateIt('${dr}','${i}','${dayNum}')"></i>`;
            ratingContainer.insertAdjacentHTML('beforeend',content);
        }

        for(let i=Number(contentRating)+1;i<=5;i++){

            let content = `<i class="fa-regular fa-star" onclick="rateIt('${dr}','${i}','${dayNum}')"></i>`;
            ratingContainer.insertAdjacentHTML('beforeend',content);
        }

        
    })
}

const loadDayData = (e,type,dr,dayNum) => {
    const AIURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCmFDAW8GfdjQqXjXls_Q_s1yTGgid8hfc';
        e = "recommend me some "+type+" if "+e;

        // Getting current date and time
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const responseDate = `${day}/${month}/${year}`;
        const responseTime = `${hours}:${minutes}:${seconds}`;

        let voiceChat = 0;
        fetch(AIURL, {
            method: "POST",
            body: JSON.stringify({
              contents: [{ parts: [{ text: e}] }],
            }),
          }).then((response)=>response.json()).then((data)=>{
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

            db.collection('therapy').doc(dr)
            .update({
                therapyDoneTill: dayNum,
                therapyLastTaken: responseDate
            }).then(()=>{
                db.collection('therapyContentTypes').doc(dr)
                .update({
                    therapyDoneTill: dayNum,
                    therapyLastTaken: responseDate
                }).then(()=>{
                    db.collection('therapyContents').doc(dr+"-dailyC-"+dayNum)
                    .set({
                        content:responseData,
                        therapyContentTypes: type,
                        contentRating:0,
                        contentDay:dayNum,
                        therapyTakenDate: responseDate
                    }).then(()=>{
                        loadDayDataBB(dr,dayNum)
                    })
                })
            })

            
          });
}

getTherapies()


// Except Firebase Js Part Below

let reading = 0;
const readOutTherapy = () => {
    if(!(reading)){
    let contentContainer = document.getElementById("loadContentHere");
    let content = contentContainer.innerText;

    content = content.replaceAll("<b>", "");
    content = content.replaceAll("</b>", "");
    content = content.replaceAll("•", "");

    var speechVoice = new SpeechSynthesisUtterance();
    var voices = speechSynthesis.getVoices();
    speechVoice.voice = voices[2];
    speechVoice.text = content;
    speechVoice.lang = 'en-US';
    speechVoice.pitch = 0.8;
    speechVoice.rate = 1; 
    speechSynthesis.speak(speechVoice);

    reading = 1;

    let voiceIco = document.getElementById("readOutIcon");
    voiceIco.innerHTML="🔊";

    console.log(content);
    }else{
        let voiceIco = document.getElementById("readOutIcon");
        speechSynthesis.cancel();
        voiceIco.innerHTML="🔈";

        reading = 0;
    }
}


