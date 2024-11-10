let startButton = document.getElementById("start");
let stopButton = document.getElementById("stop");
let smallSquare = document.getElementById("small-square");
let bigSquare = document.getElementById("big-square");
let anim = document.getElementById("anim");
let playButton = document.getElementById("play");
let closeButton = document.getElementById("close")
let work = document.getElementById("work");
let message = document.getElementById("message");
let reloadButton = document.getElementById("reload");
let aside = document.querySelector("aside");

let borderRadius = 5;
let smallSpeed = 5;
let bigSpeed = 3;
let isAnimating;

let logCount = 0;

playButton.addEventListener("click", () => {
    work.style.visibility = "visible";

    localStorage.clear();

    fetch("http://127.0.0.1:8000/clear-logs", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    log("play button");
})

closeButton.addEventListener("click", () => {
    work.style.visibility = "hidden";

    stopButton.click();

    log("close button");

    fetch("http://127.0.0.1:8000/save-logs", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            logs: JSON.parse(localStorage.getItem("log"))
        })
    }).then(() => {
        fetch("http://127.0.0.1:8000/get-logs", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => {
            return response.json()
        }).then((response) => {
            let table = document.createElement("table");
            let thLocal = document.createElement("th");
            let thBackend = document.createElement("th");
            
            thLocal.textContent = "Local";
            thBackend.textContent = "Server";
    
            table.appendChild(thLocal);
            table.appendChild(thBackend);
    
            localStorageLog = JSON.parse(localStorage.getItem("log"))
    
            for (let index = 0; index < response.length; index++) {
                let tr = document.createElement("tr");
                let tdLocal = document.createElement("td");
                let tdBackend = document.createElement("td")
    
                let localData = localStorageLog[index];
                let backendData = response[index];
    
                tdLocal.textContent = `${localData.sequence_number} | ${localData.message} | ${localData.datetime}`;
                tdBackend.textContent = `${backendData.sequence_number} | ${backendData.message} | ${backendData.datetime}`;
    
                tr.appendChild(tdLocal);
                tr.appendChild(tdBackend);
    
                table.append(tr);
            }
    
            aside.appendChild(table);
        })
    });
})

startButton.addEventListener("click", () => {
    stopButton.style.display = "block";
    startButton.style.display = "none";
    
    isAnimating = true;

    moveSquares();

    log("start button");
})

stopButton.addEventListener("click", () => {
    reloadButton.style.display = "block";
    stopButton.style.display = "none";
    startButton.style.display = "none";
    
    isAnimating = false;

    log("stop button");
})

reloadButton.addEventListener("click", () => {
    startButton.style.display = "block";
    reloadButton.style.display = "none";

    smallSpeed = Math.abs(smallSpeed);
    bigSpeed = Math.abs(bigSpeed);

    smallSquare.style.left = 0;
    bigSquare.style.top = 0;

    log("reload button");
})

function moveSquares() {
    if (isAnimating) {
        if (smallSquare.offsetLeft >= bigSquare.offsetLeft 
            && smallSquare.offsetLeft <= bigSquare.offsetLeft + bigSquare.offsetWidth 
            && smallSquare.offsetTop >= bigSquare.offsetTop 
            && smallSquare.offsetTop <= bigSquare.offsetTop + bigSquare.offsetHeight) {
                isAnimating = false;

                log(`squares overlap`);
            }

        if (smallSquare.offsetLeft + smallSquare.offsetWidth + borderRadius > anim.offsetWidth || smallSquare.offsetLeft < 0) {
            smallSpeed = -smallSpeed;
        } 

        if (bigSquare.offsetTop + bigSquare.offsetHeight + borderRadius > anim.offsetHeight || bigSquare.offsetTop < 0){
            bigSpeed = -bigSpeed;
        }

        smallSquare.style.left = smallSquare.offsetLeft + smallSpeed + 'px';
        bigSquare.style.top = bigSquare.offsetTop + bigSpeed + 'px';

        log(`small square new position: ${smallSquare.offsetLeft}; big square new position ${bigSquare.offsetTop}`);

        requestAnimationFrame(moveSquares);
    }
}

function log(messageText) {
    message.textContent = messageText;

    logCount += 1; 

    localStorageLog = localStorage.getItem("log") == null ? [] : JSON.parse(localStorage.getItem("log"));
    localStorageLog.push({sequence_number: logCount, message: messageText, datetime: new Date().toLocaleString()});
    localStorage.setItem("log", JSON.stringify(localStorageLog));
}
