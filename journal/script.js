const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyClaBx4MVZdJbHG8kC-1XE4VZMjGczLTwA",
    authDomain: "psit-project-12199.firebaseapp.com",
    projectId: "psit-project-12199",
    storageBucket: "psit-project-12199.appspot.com",
    messagingSenderId: "124664563235",
    appId: "1:124664563235:web:b7d034b445870f20519396",
    measurementId: "G-PZ87S8162Y"
});

// const fs = require('fs');

document.querySelectorAll('.color').forEach((element) => {
    element.addEventListener('click', (event) => {
        let color = element.getAttribute('data-bgcolor');

        document.getElementById("journalTitle").dataset.bgcolor = color;
        document.getElementById("journalContent").dataset.bgcolor = color;
        document.getElementById("journalTheme").setAttribute('value',color);
      });
});

let imageUpload = 0;
let imageCode;

const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

// var userIP = "";

// async function fetchData() {
//     const response = await fetch('https://api.ipify.org/?format=json');
//     const data = await response.json();
//     console.log(data.ip)
//     userIP = await data.ip;
//   }
  
// fetchData();

// const userIP = fetch('https://api.ipify.org/?format=json')
//   .then(response => response.json())
//   .then((data) => {
//     return data.ip;
//   });

const addJournalForm = () => {
    imageUpload=0;

    document.getElementById("inputFields").innerHTML = `<input type="text" placeholder="title" id="journalTitle" data-bgcolor="default">
                <input type="text" placeholder="journalTheme" id="journalTheme" value="default" style="display: none;">
                <div class="journalContent">
                    
                    <textarea name="journalContent" id="journalContent" placeholder="Journal Content" cols="5" data-bgcolor="default"></textarea>
                    
                    <form action="" method="post" method="post" enctype="multipart/form-data"></form>
                    <input type="file" name="journalImage" style="display:none;" id="journalImage" onchange="displayImage(this)">
                    </form>

                    <img src="" alt="journalImage" class="journalImageInInput none" id="journalImageInInput">
                </div>`;
    $("#addJournal").toggleClass("none");
}

const addJournal = async () => {
    // Write code to add new user Journal 
    const journalContent = document.getElementById('journalContent').value
    const journalTitle = document.getElementById('journalTitle').value
    const journalTheme = document.getElementById('journalTheme').value

    if(journalTitle==="" || journalTitle.length === 0 || journalContent==="" || journalContent.length === 0 ){
        alert("Please fill all the fields");
    }else{
        // Getting current date and time for using it in hashing
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const responseInstance = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

        if(imageUpload){

            db.collection('journalDB')
            .add({
                journalTitle: journalTitle,
                journalContent: journalContent,
                journalTheme: journalTheme,
                journalContainImage: 1,
                journalImageCode: imageCode,
                journalDate: responseInstance
            })
            .then((docRef) => {
                document.getElementById('journalContent').value = "";
                document.getElementById('journalTitle').value = "";
                document.getElementById("oldJournalContainer").innerHTML = "";
                $("#addJournal").toggleClass("none");
                getJournals();
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
        }else{
            db.collection('journalDB')
            .add({
                journalTitle: journalTitle,
                journalContent: journalContent,
                journalTheme: journalTheme,
                journalContainImage:0,
                journalImageCode: "",
                journalDate: responseInstance
            })
            .then((docRef) => {
                document.getElementById('journalContent').value = "";
                document.getElementById('journalTitle').value = "";
                document.getElementById("oldJournalContainer").innerHTML = "";
                $("#addJournal").toggleClass("none");
                getJournals();
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
        }

        
    }

    
}

const updateJournal = () => {
    // Write code to add new user Journal 
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

const getJournals = () => {
    // Write code to get all the journals of the user
    db.collection('journalDB')
    .orderBy("journalDate","desc")
    .get()
    .then((data) => {
        const dataValue = data.docs.map((item) => {
            return{...item.data(), id: item.id}
        });

        for (const key in dataValue) {
            let content;
            if(Number(dataValue[key].journalContainImage) == 1){
                contentCode = `<div class="oldElementContainer" data-bgcolor="${dataValue[key].journalTheme}">
                <div class="oldElementContainerHeader">
                    <div class="journalDetails">
                        <p class="journalTitle" id="${dataValue[key].id}-title">${dataValue[key].journalTitle}</p>
                        <p class="journalDate" style="font-size: 10px;">Date: ${dataValue[key].journalDate}</p>
                    </div>
                    <div class="oldElementHeaderBtnContainer">
                        <div class="elementHeaderBtn" onclick="deleteJournal('${dataValue[key].id}')"><i class="fa-solid fa-trash"></i></div>

                        <div class="elementHeaderBtn" onclick="editJournal('${dataValue[key].id}')"><i class="fa-solid fa-pencil"></i></div>
                    </div>
                </div>
                <div class="oldElementContentContainer">
                    <p id="${dataValue[key].id}-content">${dataValue[key].journalContent}</p>
                    <img src="${dataValue[key].journalImageCode}" class="journalImageInInput"/>
                </div>
            </div>`;
            }else{
                contentCode = `<div class="oldElementContainer" data-bgcolor="${dataValue[key].journalTheme}">
                <div class="oldElementContainerHeader">
                    <div class="journalDetails">
                        <p class="journalTitle" id="${dataValue[key].id}-title">${dataValue[key].journalTitle}</p>
                        <p class="journalDate" style="font-size: 10px;">Date: ${dataValue[key].journalDate}</p>
                    </div>
                    <div class="oldElementHeaderBtnContainer">
                        <div class="elementHeaderBtn" onclick="deleteJournal('${dataValue[key].id}')"><i class="fa-solid fa-trash"></i></div>

                        <div class="elementHeaderBtn" onclick="editJournal('${dataValue[key].id}')"><i class="fa-solid fa-pencil"></i></div>
                    </div>
                </div>
                <div class="oldElementContentContainer">
                    <p id="${dataValue[key].id}-content">${dataValue[key].journalContent}</p>
                </div>
            </div>`;
            }
            
            document.getElementById("oldJournalContainer").insertAdjacentHTML('beforeend',contentCode);
          }
        
        
    }) 

}

const editJournal = (e) => {
    // Write code to update the journal of a user (e is journal ID here)
    // Write code to get all the journals of the user
    db.collection('journalDB').doc(e)
    .get()
    .then((data) => {
        document.getElementById('editJournalContent').value = data._delegate._document.data.value.mapValue.fields.journalContent.stringValue;
        document.getElementById('editJournalTitle').value = data._delegate._document.data.value.mapValue.fields.journalTitle.stringValue;
        document.getElementById('editJournalReference').value = e;

        $("#editJournal").toggleClass("none");
    })

}

const deleteJournal = (e) => {
    db.collection('journalDB').doc(e).delete()
    .then(() => {
        // alert('Journal Deleted');
        document.getElementById("oldJournalContainer").innerHTML = "";
        getJournals();
    })
    .catch((err) =>{
        console.log(err)
    })
}

// Voice to text Converter Codes

function voiceToText(){
    var recognition = new webkitSpeechRecognition();
    $("#recordAudio").attr("class","fa-regular fa-circle-stop");
    let oldContent = document.getElementById("journalContent").value;
  
    recognition.maxAlternatives = 100;
    // recognition.continuous = true;
    recognition.lang="en-GB";
    recognition.onresult= function(event){
        document.getElementById("journalContent").value = oldContent + " " + event.results[0][0].transcript;
        $("#recordAudio").attr("class","fa-solid fa-microphone");
    }
    recognition.start();
}

getJournals()


// Image upload code below

const triggerImageUpload = (e) => {
    let id = e;
    document.querySelector(`#${id}`).click();
}


const displayImage = (e) => {
    if (e.files[0]) {
         var reader = new FileReader();
         reader.onload = function(e) {
            console.log(e.target.result);
            
            document.querySelector('#journalImageInInput').setAttribute('src', e.target.result);
            $('#journalImageInInput').toggleClass("none");

            imageUpload = 1;
            imageCode = e.target.result;

         }
         reader.readAsDataURL(e.files[0]);
    }
}