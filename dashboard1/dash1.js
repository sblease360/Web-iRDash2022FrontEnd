let displayObjects = {};
let sessionDataCount = -1;


function loadingRoutine() {
    startConnection();
    setInterval(checkConnection(), 5000);
    displayObjects = createDisplayObjects()
}

function startConnection() {
    console.log("Attempting to create new websocket connection");
    socket = new WebSocket("ws://192.168.178.37:9051");

    socket.onopen = function (event) {
        console.log("WebSocket connection open, sending confirmation to data source");
        //displayObjects.messageModal.style.display = "None"
    };

    socket.onclose = function (event) {
        console.log("WebSocket closing");
        checkConnection()
    };

    socket.onmessage = function (event) { 
        
        let data = JSON.parse(event.data)
        //console.log(data);
        updateScreenLive(data)
        if (data.sessionDataCount != sessionDataCount) {
            updateSessionInfo(data);
            sessionDataCount = data.sessionDataCount;
        }
    };
};

function checkConnection() {
    if (!socket || socket.readyState == WebSocket.CLOSED) {
        startConnection()
    }
}

function toggleFullScreen() {
    if(document.fullscreenElement === null) {
        document.documentElement.requestFullscreen();
    } else {
        window.location.reload(true); 
    };  
}

function createDisplayObjects(){
    let objs = {
        gear: document.getElementById("gear-value"),
        speed: document.getElementById("speed-value"),
        rpm: document.getElementById("revs-value"),
        revCounter: document.getElementById("rev-counter-bar"),
    }
    return objs;
}

function updateSessionInfo(data) {
    for (let i = 0; i < data.shiftLightBoundaries.length; i++) {
        let a = document.getElementById("rev-boundary-" + (i + 1));
        a.style.height = data.shiftLightBoundaries[i].percent + "%";
        a.style.borderBottom = "2px solid rgb(" + data.shiftLightBoundaries[i].color + ")";
    }
}

function updateScreenLive(data) {

    //For simple value setting, if the html name matches the name in data it will be set with the below
    for (var key of Object.keys(data)) {
        //key = name
        //data[key] = value
        var a = document.getElementById(key);        
        if (a) {            
            a.innerHTML = data[key];
        }
    }

    
    //All other animations, colour changes etc need to be handled here
    displayObjects.revCounter.style.height = data.rpmPercentage + "%";
    if (data.rpmPercentage > 99.5) {
        displayObjects.revCounter.style.backgroundColor = "rgb(182, 21, 0)"
    } else {
        if (data.currentShiftLight === 0) {
            displayObjects.revCounter.style.backgroundColor = "rgb(68, 68, 68)";
        } else {
            displayObjects.revCounter.style.backgroundColor = "rgb(" + data.shiftLightBoundaries[data.currentShiftLight-1].color + ")";
        }
    }

};


