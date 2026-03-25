// Firebase Config
const firebaseConfig =  {
  apiKey: "AIzaSyBkhxk43N6AA-yZ8tUG7jvnXR2UN_Bju78",
  authDomain: "autoindia-a0860.firebaseapp.com",
  databaseURL: "https://autoindia-a0860-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "autoindia-a0860",
  storageBucket: "autoindia-a0860.firebasestorage.app",
  messagingSenderId: "249019287580",
  appId: "1:249019287580:web:4277033e0512a9b8ceb7d9"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let acThreshold = 31;
let acManualOff = false;

// Login
function login(){
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  if(user==='jisce' && pass==='techfest26'){
    document.getElementById('loginScreen').style.display='none';
    document.getElementById('dashboard').style.display='block';
  } else {
    document.getElementById('loginError').innerText="Invalid username or password!";
  }
}

// Update Dashboard
function updateData(){
  db.ref("/").once("value").then(snap=>{
    const d = snap.val();
    if(d){
      // Temperature
      document.getElementById('temp').innerText = d.temperature.toFixed(1);
      const tempSlider = document.getElementById('tempSlider');
      tempSlider.value = d.temperature;
      const tempPercent = Math.min(100,(d.temperature/50)*100);
      const tempColor = d.temperature>=32 ? "#f44336" : "#4CAF50";
      tempSlider.style.background = `linear-gradient(to right, ${tempColor} ${tempPercent}%, #555 ${tempPercent}%)`;

      // Humidity
      document.getElementById('hum').innerText = d.humidity.toFixed(1);
      const humSlider = document.getElementById('humSlider');
      humSlider.value = d.humidity;
      const humPercent = Math.min(100,d.humidity);
      const humColor = d.humidity>=60 ? "#f44336" : "#03A9F4"; // example 60% threshold
      humSlider.style.background = `linear-gradient(to right, ${humColor} ${humPercent}%, #555 ${humPercent}%)`;

      // Current
      document.getElementById('curr').innerText = d.current.toFixed(3);
      const currentSlider = document.getElementById('currentSlider');
      currentSlider.value = d.current;
      const currentPercent = Math.min(100,(d.current/10)*100);
      const currColor = d.current>=2.5 ? "#f44336" : "#4CAF50";
      currentSlider.style.background = `linear-gradient(to right, ${currColor} ${currentPercent}%, #555 ${currentPercent}%)`;

      // Trip / Breaker
      document.getElementById('trip').innerText = d.trip ? "true" : "false";
      document.getElementById('breakerStatus').innerText = d.relays[6] ? "TRIP" : "OFF";

      // Lights
      document.getElementById('light1Status').innerText = d.relays[4] ? "ON" : "OFF";
      document.getElementById('light2Status').innerText = d.relays[5] ? "ON" : "OFF";

      // AC
      if(!acManualOff){
        if(d.temperature>=acThreshold) db.ref("/relays/5").set(true);
        else db.ref("/relays/5").set(false);
      }
      const acStatusEl = document.getElementById('acStatus');
      acStatusEl.innerText = d.relays[5] ? "ON" : "OFF";
      const acSlider = document.getElementById('acSlider');
      const acPercent = Math.min(100,(d.temperature/40)*100);
      const acColor = d.temperature>=acThreshold ? "#f44336" : "#4CAF50";
      acSlider.style.background = `linear-gradient(to right, ${acColor} ${acPercent}%, #555 ${acPercent}%)`;

      // Motor
      document.getElementById('motorStatus').innerText = d.motorStatus;

      // Security Laser
      const secSpan = document.getElementById('securityStatus');
      if(d.relays[7]){
        secSpan.innerText="Alert!";
        secSpan.className="securityAlert";
      } else {
        secSpan.innerText="Safe";
        secSpan.className="securitySafe";
      }
    }
  });
}

// AC manual OFF
function acManualOffBtn(){ acManualOff=true; db.ref("/relays/5").set(false); }

// AC threshold slider
function updateACThreshold(value){ acThreshold=parseFloat(value); document.getElementById('acThresholdValue').innerText=value; acManualOff=false; }

// Lights
function turnLight(pin,state){ db.ref("/relays/"+pin).set(state); }

// Motor
function motorAction(){
  const mode=parseInt(document.getElementById('motorSelect').value);
  db.ref("/motorMode").set(mode);
  for(let i=0;i<4;i++) db.ref("/relays/"+i).set(i==(mode-1));
  db.ref("/motorStatus").set("Mode "+mode);
}
function motorOff(){ db.ref("/motorMode").set(0); for(let i=0;i<4;i++) db.ref("/relays/"+i).set(false); db.ref("/motorStatus").set("OFF"); }

// Breaker reset
function resetBreaker(){ db.ref("/relays/6").set(false); db.ref("/trip").set(false); }

// Security reset
function resetSecurity(){ db.ref("/relays/7").set(false); }

// Auto update every second
setInterval(updateData,1000);