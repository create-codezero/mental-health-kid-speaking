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

const getJournals = () => {
    // Write code to get all the journals of the user
    db.collection('childProgressReport')
    .orderBy("sessionTakenAt","desc")
    .get()
    .then((data) => {
        
        const dataValue = data.docs.map((item) => {
            return{...item.data(), id: item.id}
        });

        console.log(dataValue);

        for (const key in dataValue) {

                contentCode = `<div class="oldElementContainer" data-bgcolor="default">
                <div class="oldElementContainerHeader">
                    <div class="journalDetails">
                        <p class="journalTitle" id="${dataValue[key].id}-title">Total Correct Words Kid Spoken: ${dataValue[key].totalCorrectWordsSpoken}</p>
                        <p class="journalDate" style="font-size: 10px;">Date: ${dataValue[key].sessionTakenAt}</p>
                    </div>
                    <div class="oldElementHeaderBtnContainer">
                        ${((Number(dataValue[key].totalCorrectWordsSpoken)/Number(dataValue[key].totalVideoWords))*100).toFixed(2)}%
                    </div>
                </div>
                <div class="oldElementContentContainer">
                    <p id="${dataValue[key].id}-content"><strong>Kid Speech:   </strong>${dataValue[key].kidSpoken}</p><br>
                    <p id="${dataValue[key].id}-content"><strong>Total Words in the Video: ${dataValue[key].totalVideoWords}</strong></p>
                </div>
            </div>`;
            
            document.getElementById("oldJournalContainer").insertAdjacentHTML('beforeend',contentCode);
          }
        
        
    }) 

}

getJournals();