// -------------------- FIREBASE CONFIG --------------------
const firebaseConfig = {
  apiKey: "AIzaSyBkhxk43N6AA-yZ8tUG7jvnXR2UN_Bju78",
  authDomain: "autoindia-a0860.firebaseapp.com",
  databaseURL: "https://autoindia-a0860-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "autoindia-a0860",
  storageBucket: "autoindia-a0860.appspot.com",
  messagingSenderId: "249019287580",
  appId: "1:249019287580:web:4277033e0512a9b8ceb7d9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// -------------------- GLOBAL VARIABLES --------------------
let acThreshold = 31;
let acManualOff = false;

// -------------------- LOGIN SYSTEM --------------------
function login(){
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if(user === "jisce" && pass === "techfest26"){
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboard").style.display = "grid";
  } else {
    document.getElementById("loginError").innerText = "Invalid username or password!";
  }
}

// -------------------- UPDATE DATA --------------------
function updateData(){
  db.ref("/").once("value").then(snapshot => {
    const d = snapshot.val();
    if(!d) return;

    // ---------------- TEMP ----------------
    const temp = d.temperature || 0;
    document.getElementById("temp").innerText = temp.toFixed(1);

    const tempSlider = document.getElementById("tempSlider");
    tempSlider.value = temp;
    let tempPercent = Math.min(100, (temp / 50) * 100);
    let tempColor = temp >= 32 ? "#f44336" : "#4CAF50";
    tempSlider.style.background = `linear-gradient(to right, ${tempColor} ${tempPercent}%, #444 ${tempPercent}%)`;

    // ---------------- HUMIDITY ----------------
    const hum = d.humidity || 0;
    document.getElementById("hum").innerText = hum.toFixed(1);

    const humSlider = document.getElementById("humSlider");
    humSlider.value = hum;
    let humPercent = Math.min(100, hum);
    let humColor = hum >= 60 ? "#f44336" : "#03A9F4";
    humSlider.style.background = `linear-gradient(to right, ${humColor} ${humPercent}%, #444 ${humPercent}%)`;

    // ---------------- CURRENT ----------------
    const curr = d.current || 0;
    document.getElementById("curr").innerText = curr.toFixed(2);

    const currSlider = document.getElementById("currentSlider");
    currSlider.value = curr;
    let currPercent = Math.min(100, (curr / 10) * 100);
    let currColor = curr >= 2.5 ? "#f44336" : "#4CAF50";
    currSlider.style.background = `linear-gradient(to right, ${currColor} ${currPercent}%, #444 ${currPercent}%)`;

    // ---------------- BREAKER ----------------
    document.getElementById("breakerStatus").innerText = d.relays[6] ? "TRIP" : "OFF";
    document.getElementById("tripStatus").innerText = d.trip ? "TRUE" : "FALSE";

    // ---------------- LIGHT ----------------
    document.getElementById("lightStatus").innerText = d.relays[4] ? "ON" : "OFF";

    // ---------------- AC CONTROL ----------------
    if(!acManualOff){
      if(temp >= acThreshold){
        db.ref("/relays/5").set(true);
      } else {
        db.ref("/relays/5").set(false);
      }
    }

    document.getElementById("acStatus").innerText = d.relays[5] ? "ON" : "OFF";

    const acSlider = document.getElementById("acSlider");
    let acPercent = Math.min(100, (temp / 40) * 100);
    let acColor = temp >= acThreshold ? "#f44336" : "#4CAF50";
    acSlider.style.background = `linear-gradient(to right, ${acColor} ${acPercent}%, #444 ${acPercent}%)`;

    // ---------------- MOTOR ----------------
    document.getElementById("motorStatus").innerText = d.motorStatus;

    // ---------------- SECURITY ----------------
    const sec = document.getElementById("securityStatus");
    if(d.relays[7]){
      sec.innerText = "SECURITY ALERT";
      sec.style.color = "red";
    } else {
      sec.innerText = "SECURITY SAFE";
      sec.style.color = "green";
    }
  });
}

// -------------------- CONTROLS --------------------

// Light control
function lightOn(){ db.ref("/relays/4").set(true); }
function lightOff(){ db.ref("/relays/4").set(false); }

// AC manual OFF
function acOff(){
  acManualOff = true;
  db.ref("/relays/5").set(false);
}

// AC threshold
function setACThreshold(val){
  acThreshold = parseFloat(val);
  document.getElementById("acThresholdValue").innerText = val;
  acManualOff = false;
}

// Motor control
function motorAction(){
  const mode = parseInt(document.getElementById("motorSelect").value);

  db.ref("/motorMode").set(mode);

  for(let i=0;i<4;i++){
    db.ref("/relays/"+i).set(i === (mode - 1));
  }

  db.ref("/motorStatus").set("Mode " + mode);
}

function motorOff(){
  db.ref("/motorMode").set(0);

  for(let i=0;i<4;i++){
    db.ref("/relays/"+i).set(false);
  }

  db.ref("/motorStatus").set("OFF");
}

// Breaker reset
function resetBreaker(){
  db.ref("/relays/6").set(false);
  db.ref("/trip").set(false);
}

// Security reset
function resetSecurity(){
  db.ref("/relays/7").set(false);
}

// -------------------- AUTO REFRESH --------------------
setInterval(updateData, 1000);
