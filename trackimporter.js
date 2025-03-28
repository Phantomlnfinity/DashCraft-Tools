const storedData = ["x", "y", "z", "r"]
let numInputs = 1;

async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    return tab;
}

function resetData() {
    trackData = []
    for (numInputs = 1; document.getElementById("trackInput" + numInputs); numInputs++) {
        trackData.push([])
        console.log(numInputs)
        getTrackData(document.getElementById("trackInput" + numInputs).value, numInputs-1)
    }
    numInputs--
    console.log(numInputs)
}

let inputTimeout = 0
let fetchTimeout = 0
document.addEventListener('input', function() {
    clearTimeout(inputTimeout)
    inputTimeout = setTimeout(function(){generateData()}, 600)
});
document.getElementById("trackInput1").addEventListener('input', function() {
    document.getElementById("dataResponse").innerHTML = "Loading..."
    clearTimeout(fetchTimeout)
    clearTimeout(inputTimeout)
    fetchTimeout = setTimeout(function(){getTrackData(document.getElementById("trackInput1").value, 0)}, 500)
})
document.addEventListener('input', backupInputData);



document.getElementById("addtrack").addEventListener("click", function() {
    trackData.push([]);
    addInput()
});

function addInput() {
    numInputs++
    const id = numInputs
    const input = document.createElement('div')
    input.id = "input" + id
    input.innerHTML = 
    `<div class="inputwrapper" style="width: calc(100% - 45px); float: left; margin: 0;">
        <input id="trackInput${id}" placeholder="Link or JSON" autocomplete="off">
    </div>
    
    <button id="deleteInput${id}"style="width: 45px; height: 45px; float: left; margin: 0; background-color: red; background-image: none;">
        <image src="trashcan.png" width="100%"></image>
    </button>`
    document.getElementById("trackInputs").appendChild(input);
    document.getElementById("trackInput" + id).addEventListener('input', function() {
        document.getElementById("dataResponse").innerHTML = "Loading..."
        clearTimeout(fetchTimeout)
        clearTimeout(inputTimeout)
        fetchTimeout = setTimeout(function(){getTrackData(document.getElementById("trackInput" + id).value, id-1)}, 500)
    })
    document.getElementById("deleteInput" + id).addEventListener('click', function() {
        document.getElementById("input" + id).remove()
        numInputs--
        trackData.splice(id-1, 1)
        backupInputData()
    })
    backupInputData()
    chrome.storage.local.set({"trackData": JSON.stringify(trackData)})
}



let trackData = []
let fakeTrackData = []
let id

async function getTrackData(input, index) {
    id = input.slice(-24)
    try {
        await fetch(`https://cdn.dashcraft.io/v2/prod/track/${id}.json?v=7`)
            .then(response => response.json())
            .then(json => json.trackPieces)
            .then(pieces => {
                trackData[index] = pieces
                generateData()
            })
            .then(a => {document.getElementById("dataResponse").innerHTML = "Track loaded!"; chrome.storage.local.set({"dataResponse": "Track loaded!"})})
    }
    catch {
        try {
            JSONinput = JSON.parse(input)
            const requirements = ["id", "uid", "r", "a"]
            
            if (!JSONinput.every(piece => requirements.every(requirement => piece.hasOwnProperty(requirement)) && piece.p.length == 3)) throw new Error("invalid json");
            id = false
            trackData[index] = JSONinput
            generateData()
            document.getElementById("dataResponse").innerHTML = "Track loaded!"
            chrome.storage.local.set({"dataResponse": "Track loaded!"})
        }
        catch {
            trackData[index] = [];
            generateData();
            document.getElementById("dataResponse").innerHTML = `Track loaded without input #${index+1}.`;
            chrome.storage.local.set({"dataResponse": `Track loaded without input #${index+1}.`});
        }
    }
    
}


function rotateAround(p, center, rotation) {
    const radians = -rotation*Math.PI/180
    const x = p[0] - center[0]
    const y = p[2] - center[2]
    return [Math.round((Math.cos(radians) * x) - (Math.sin(radians) * y)) + center[0], p[1], Math.round((Math.cos(radians) * y) + (Math.sin(radians) * x)) + center[2]]
}



async function generateData() {

    chrome.storage.local.set({"trackData": trackData})
    let pieces = []

    let finishLocation = [0, 0, 0]
    let finishRotation = 0
    let startLocation = [0, 0, 0]  
    let startRotation = 0

    for (let i = 0; i < trackData.length; i++) {
        let currentTrack = structuredClone(trackData[i]);
        const start = currentTrack.find(piece => piece.id == 1)
        if (start) {
            startLocation = structuredClone(start.p)
            startRotation = start.r
            if (i != 0) currentTrack = currentTrack.filter(piece => piece.id != 1);
        }
        for (let j = 0; j < currentTrack.length; j++) {
            pieces.push(structuredClone(currentTrack[j]))
            if (i != 0) {
                pieces[pieces.length-1].p = rotateAround(pieces[pieces.length-1].p, startLocation, finishRotation - startRotation)
                for (let k = 0; k < 3; k++) pieces[pieces.length-1].p[k] += finishLocation[k] - startLocation[k];
                pieces[pieces.length-1].r += finishRotation - startRotation;
            }
        }

        if (i != trackData.length - 1) {
        const finish = pieces.find(piece => piece.id == 2)
            if (finish) {
                finishLocation = structuredClone(finish.p)
                finishRotation = finish.r
                pieces = pieces.map(piece => {
                    if (piece.id == 2) {
                        piece.id = 3;
                    }
                    return piece
                })
            }
        }
        console.log(finishLocation, finishRotation)
        console.log(startLocation, startRotation)
    }

    function getValue(id) {
        return parseInt(document.getElementById(id).value) || 0
    }

    let shift = [getValue("x"), getValue("y"), getValue("z")]
    let rotation = getValue("r")

    const radians = -rotation*Math.PI/180

    let totals = {p: [0, 0, 0], r: 0}
    for (let i = 0; i < pieces.length; i++) {
        const x = pieces[i].p[0]
        const y = pieces[i].p[2]
        pieces[i].p[0] = Math.round((Math.cos(radians) * x) - (Math.sin(radians) * y));
        pieces[i].p[2] = Math.round((Math.cos(radians) * y) + (Math.sin(radians) * x));
        for (let j = 0; j < 3; j++) {
            pieces[i].p[j] += shift[j];
        }
        pieces[i].r += rotation;
        totals.p = totals.p.map((p, index) => p - pieces[i].p[index])
        totals.r -= pieces[i].r
        if (totals.p.some(p => Math.abs(p) > 2**24-1) || Math.abs(totals.r) > 2**24-1) {
            pieces.splice(i, 0, {"id":84,"uid":1000000,"p":totals.p.map((p, index) => p + pieces[i].p[index]),"r":totals.r + pieces[i].r,"a":[]});
            totals = {p: pieces[i+1].p.map(p => -p), r: -pieces[i+1].r};
            i++;
        }
    }
    fakeTrackData = pieces
    
    instructions.innerHTML = `Open a track with exactly ${pieces.length + 1} pieces.`
    const tab = await getCurrentTab();
    chrome.tabs.sendMessage(tab.id, {type: "getJSON", data: fakeTrackData});
    
}



function backupInputData() {
    let data = {}
    for (let i = 0; i < storedData.length; i++) {
        data[storedData[i]] = document.getElementById(storedData[i]).value
    }
    data["dataResponse"] = document.getElementById("dataResponse").innerHTML
    data["trackInputs"] = [];
    for (let i = 0; i < numInputs; i++) {
        console.log(i, numInputs);
        data["trackInputs"].push(document.getElementById("trackInput" + (i+1)).value)
    }
    chrome.storage.local.set(data, function(){});
}


chrome.storage.local.get(["trackData", "dataResponse", "trackInputs", "x", "y", "z", "r"], function(data){
    try {
        trackData = JSON.parse(data.trackData);
    }
    catch {
        trackData = [];
    }
    document.getElementById("dataResponse").innerHTML = data.dataResponse ??= "";
    trackInputs = data.trackInputs ??= [];
    for (let i = 0; i < data.trackInputs.length; i++) {
        if (i != 0) addInput();
        document.getElementById("trackInput" + (i + 1)).value = trackInputs[i];
    }
    console.log(numInputs);
    console.log(trackInputs);
    document.getElementById("x").value = data.x ??= "";
    document.getElementById("y").value = data.y ??= "";
    document.getElementById("z").value = data.z ??= "";
    document.getElementById("r").value = data.r ??= "";
    document.getElementById("loading").hidden = true;
    document.getElementById("main").hidden = false;
    resetData();
    backupInputData();
    generateData();
})









