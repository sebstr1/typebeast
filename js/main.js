/*******************************************************************************
 * Projektuppgift, Kurs: DT146G
 * File: main.js
 * Desc: main JavaScript file for Projektuppgift
 * 
 * Sebastian Strindlund
 * sest1601
 * sest1601@student.miun.se
 ******************************************************************************/
var textObjects = []  
var activeText = "";
var activeTitle = "";
var correctChars = "";
var gross = 0;
var net = 0;
var acc = 0;
var errors = "";
var elapsed_minutes = 0;
var nIntervId;
var seconds = 0;
var alreadyOnfire = false;


 // Runs when document is ready. Loads XML data, adds event listeners. Plays Welcome sound
 function pageLoad() {
    loadXML(); 
    addListeners();
 }

 //Plays audio filed based on given filePath
 function playAudio(file) {
     let audio = new Audio(file)
     audio.play()
 }

 // Resets All stats
 function resetStats() {
    correctChars = "";
    gross = 0;
    net = 0;
    acc = 0;
    errors = "";
    elapsed_minutes = 0;
    seconds = 0;

     for (let i = 0; i < textObjects.length; i++) {
         if (activeTitle == textObjects[i].title) loadTextSelected(textObjects[i]); // Loads correct text
     }

    updateStats() // Updates the stats box since stats now are reset.
 }

 // Adds all eventlisteners needed
 function addListeners() {
    
    // Listener for Language Selector
    let langSelector = document.querySelectorAll(".lang-selector").forEach(element => {
        element.addEventListener("click", langSelectAction)
    });

    // Listener for text selector
    let textSelector = document.querySelector(".selector");
    textSelector.addEventListener('change', textSelected);

    // Listener for user input (typewriting)
    let useripnut = document.querySelector(".user-input-field");
    useripnut.addEventListener('keypress', userTyped);
    useripnut.addEventListener('keydown', backSpace);

    // Listener for play stop button
     let button = document.querySelector(".action-button");
     button.addEventListener('click', actionButton);
     
 }

 // Calls loadSelectorMenu based on language clicked.
 function langSelectAction(e) {
    e.target.value == "swe" ? loadSelectorMenu("swedish") : loadSelectorMenu("english");
 }

 // clears & Loads textselector menu with swedish or english texts.
 function loadSelectorMenu(lang) {

    // Finds and clears the selector options
    let selector = document.querySelector(".selector")
     for (i = selector.options.length - 1; i >= 0; i--) {
         selector.remove(i)
     }

    // For each text with correct language - add text title to selector options
    textObjects.forEach(element => {
        if (element.language == lang) {
            let option = document.createElement("option");
            option.text = element.title
            selector.add(option);
        }
    });

    // Loads first text when changing language
    for (let i = 0; i < textObjects.length; i++) {
        if (textObjects[i].title == selector[0].value) loadTextSelected(textObjects[i]);
    }
 }

 // Function that handles user click on play/stop button
 function actionButton(e) {

     if (e.target.getAttribute("src") == "./img/play.png") {// User clicked PLAY
        resetStats();
        e.target.setAttribute("src", "./img/stop.png") // Change icon to a stop icon
        interval("start")
     } 
     else { //User clicked STOP
         e.target.setAttribute("src", "./img/play.png") // change icon to play icon
         interval("stop")
     }
 }

 // Start and stops timer
 function interval(action) {
    let typingfield = document.querySelector(".user-input-field");
    let textselector = document.querySelector(".selector")

    // enables and focus typingfield, disable selector and starts timer that updates every 1 second.
    if (action == "start") { // start timer
        typingfield.disabled = false;
        textselector.disabled = true;
        typingfield.focus();
        nIntervId = setInterval(timer, 1000);
    
    } else { // Stop timer, disable typing field, enable text selector set play icon
        clearInterval(nIntervId);
        clearField();
        typingfield.disabled = true;
        textselector.disabled = false;
        let button = document.querySelector(".action-button");
        button.setAttribute("src", "./img/play.png") // change icon to play icon
    }
 }
 // Timer that updates every second, calls updateStats();
 function timer() {
     seconds += 1;
     updateStats();
 }
// Updates stats
 function updateStats() {
     // Selects stats element so we can update them
     let grossEl = document.querySelector(".stats-gross"); 
     let netEl = document.querySelector(".stats-net"); 
     let accEl = document.querySelector(".stats-acc"); 
     let errorsEl = document.querySelector(".stats-err"); 

     elapsed_minutes = seconds/60; 

     gross = (((correctChars.length + errors.length) / 5) / elapsed_minutes); // Gross WPM
 
     net = (gross - (errors.length / elapsed_minutes));  //  Net WPM
     if (net < 0) net = 0;

     acc = (correctChars.length / (correctChars.length + errors.length)) * 100 // Accuracy

    // Updates the stats elements
     grossEl.innerHTML = "Gross WPM: " + ~~gross.toFixed(0);
     netEl.innerHTML = "Net WPM: " + ~~net.toFixed(0);
     accEl.innerHTML = "Accuracy: " + ~~acc.toFixed(0) +"%";
     errorsEl.innerHTML = "Errors: " + errors.length; 

    // If net wpm is 40 or higher play sound and add class onfire to headerlabel
    let headerLabel = document.querySelector(".header-label")
    if (net >= 40) {
        headerLabel.classList.add("on-fire")
        if (!alreadyOnfire) {
            playAudio('./audio/unstoppable.mp3')
            alreadyOnfire = true;
        }
    } else { // Net WPM below 40, remove on-fire class from headerlabel.
        headerLabel.classList.remove("on-fire")
        alreadyOnfire = false;
    }
 }

 // Handles userInput from keys that generates chars
 function userTyped(e) {
    let index = correctChars.length;                          // what index we are on (to compare against the active text)
    let key = e.key                                           // char user entered
    let activeTextChar = activeText[index]                    // get char that user should have typed
     if (document.querySelector(".casing-checkbox").checked) { // If ingorecasing is checked - do toLowerCase to ignore casing.
        key = key.toLowerCase();
        activeTextChar = activeTextChar.toLowerCase();
     }

    if (key == activeTextChar) {             // If user entered the correct char
        correctChars += key                  // Add char to correctChars string
        if (key == " ") clearField()         // if correct char was space, then clear the input field
        updateProgression("success", index)  // Update progression with "success"

    } else {                                // If user entered wrong char
        e.preventDefault()
        errors += key;                      // Add char to errors string.
        updateProgression("fail", index)    // update progression with "fail"
        playAudio('./audio/error.mp3')      // Play fail audio
    }
 }

 // If user types backspace in input field - ignore it.
 function backSpace(e) {
     if (e.key == "Backspace") {
         e.preventDefault()
     }
 }
 //Update progression
 function updateProgression(type, index) {
    let chartoUpdate = document.getElementById("textIndex" + index) // Find the char in activetext display to update
     switch (type) {
         case "success":                                    // if success
             chartoUpdate.classList.remove("nextChar")     // remove the nextChar class from char
             chartoUpdate.classList.add("completedChar")   // Add completedChar class to char

             if (index + 1 == activeText.length) {         // If end of text reached
                 interval("stop");                         // Stop interval
                 playAudio('./audio/complete.mp3')         // Play completed audio
                 break;                                    
             }
             let nextChar = document.getElementById("textIndex" + (index+1))  // Add nextchar class to the next char
             nextChar.classList.add("nextChar")
             break;
         case "fail":                                                               // If fail
             chartoUpdate.classList.add("failChar")                                 // Add failChar class to the char
             let failedChar = document.getElementById("textIndex" + index)
             if (failedChar.innerHTML == " ") failedChar.classList.add("failSpace")
             break;
         default:
             return;
     }
 }

 // Finds object with selected text (by title) and sends it to the loadtext function
 function textSelected(e) {
     for (let i = 0; i < textObjects.length; i++) {
         if (textObjects[i].title == e.target.value) loadTextSelected(textObjects[i]);
     }
 }

 function loadTextSelected(obj) { // Loads the selected text with title and author
    let title = document.querySelector(".text-title"); // Finds title element
    let author = document.querySelector(".text-author"); // author element
    let text = document.querySelector(".text-active"); // text element

     let countChars = obj.text.length   // Count chars in active text
     let words = obj.text.split(" ").length // Cound words in active text

    // Sets title, author and text
    title.innerHTML = obj.title;
    author.innerHTML = obj.author + ` (${words} words, ${countChars} chars)`;
    text.innerHTML = ""  // clears text so we can appenChilds below

    let textArray = obj.text.split("") // creates array from strin
    textArray.forEach(function(element, index) { // for each element in array
        let span = document.createElement("span") // create array
        span.setAttribute('id', 'textIndex'+index) // set attribute
        span.innerHTML = element;   // add char to span
        text.appendChild(span)    // append span to element
    });

    // Sets active text, title, the first active char and clears inputfield.
    activeText = obj.text; 
    activeTitle = obj.title
    let nextChar = document.getElementById("textIndex0")
    nextChar.classList.add("nextChar")
    clearField();
 }

 // Clears userinput-field
 function clearField() {
     let inputField = document.querySelector(".user-input-field")
     inputField.value = ""
 }

// Loads XML via fetch (get request)
 function loadXML() {
     let url = "./texts.xml"

     fetch(url) // Call the fetch function passing the url as parameter
         .then(response => response.text()) // Get the response text
         .then((response) => {
             createObjects(response) // Create textobjects with the responsetext
             loadTextSelected(textObjects[0]) // loads first text
             loadSelectorMenu("swedish")    // Sets the selectormenu to swedish
         }).catch((err) => {
             console.log('fetch', err)
         })
 }

 
 
 // Creates objects with title, author, lang and text. Puts them all in array
 function createObjects(response) {
     let xmlDummy = document.createElement("xml") // Creates a dummy xml element
     xmlDummy.innerHTML = response                // Sets resposne to be the innerhtml of xml element

    // Now we can use getElementsByTagName to get all title, author, language and text objects!
    let titles = xmlDummy.getElementsByTagName("title")
    let authors = xmlDummy.getElementsByTagName("author")
    let language = xmlDummy.getElementsByTagName("language")
    let texts = xmlDummy.getElementsByTagName("text")

    // Creates object for each title and then sets its properties.
    for (let i = 0; i < titles.length; i++) {
        var tObj = {}
        tObj.title = titles[i].innerHTML;
        tObj.author = authors[i].innerHTML;
        tObj.language = language[i].innerHTML;
        tObj.text = texts[i].innerHTML;
        textObjects.push(tObj)
    }
 }
window.addEventListener("load", pageLoad()) // when page is loaded, detect what page user is on and determine script to run
