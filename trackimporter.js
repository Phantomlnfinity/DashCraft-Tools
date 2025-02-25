const storedData = ["trackInput", "x", "y", "z", "r"]

async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    return tab;
}

let inputTimeout = 0
let fetchTimeout = 0
document.addEventListener('input', function() {
    clearTimeout(inputTimeout)
    inputTimeout = setTimeout(function(){generateData(trackData)}, 600)
});
document.getElementById("trackInput").addEventListener('input', function() {
    document.getElementById("dataResponse").innerHTML = "Loading..."
    clearTimeout(fetchTimeout)
    clearTimeout(inputTimeout)
    fetchTimeout = setTimeout(function(){getTrackData(document.getElementById("trackInput").value)}, 500)
})
document.addEventListener('input', backupInputData);

let trackData = []
let fakeTrackData = []
let id

async function getTrackData(input) {
    id = input.slice(-24)
    console.log(id)
    try {
        await fetch(`https://cdn.dashcraft.io/v2/prod/track/${id}.json?v=7`)
            .then(response => response.json())
            .then(json => json.trackPieces)
            .then(pieces => generateData(pieces))
            .then(a => {document.getElementById("dataResponse").innerHTML = "Track loaded!"; chrome.storage.local.set({"dataResponse": "Track loaded!"})})
    }
    catch {
        try {
            JSONinput = JSON.parse(input)
            const requirements = ["id", "uid", "r", "a"]
            
            if (!JSONinput.every(piece => requirements.every(requirement => piece.hasOwnProperty(requirement)) && piece.p.length == 3)) throw new Error("invalid json");
            id = false
            generateData(JSONinput)
            document.getElementById("dataResponse").innerHTML = "Track loaded!"
            chrome.storage.local.set({"dataResponse": "Track loaded!"})
        }
        catch {
            document.getElementById("dataResponse").innerHTML = "Invalid input. Using previous data."
            chrome.storage.local.set({"dataResponse": "Invalid input. Using previous data."})
        }
    }
    
}


async function generateData(pieces) {
    trackData = structuredClone(pieces)
    chrome.storage.local.set({"trackData": trackData})

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
        if (totals.p.map((p, index) => p-pieces[i].p[index]).some(p => Math.abs(p) > 2**24-1) || totals.r + Math.abs(pieces[i].r) > 2**24-1) {
            pieces.splice(i, 0, {"id":84,"uid":1000000,"p":totals.p,"r":totals.r,"a":[]})
            totals = {p: [0, 0, 0], r: 0}
            continue
        }
        totals.p = totals.p.map((p, index) => p - pieces[i].p[index])
        totals.r -= pieces[i].r
    }

    fakeTrackData = pieces
    
    instructions.innerHTML = `Make a new track and place ${pieces.length} pieces at 0, 0, 0 (not rotated)<br>Then, save the track, exit, and re-enter.`
    const tab = await getCurrentTab();
    chrome.tabs.sendMessage(tab.id, {type: "getJSON", data: fakeTrackData});
    
}



function backupInputData() {
    let data = {}
    for (let i = 0; i < storedData.length; i++) {
        data[storedData[i]] = document.getElementById(storedData[i]).value
    }
    chrome.storage.local.set(data, function(){});
}

chrome.storage.local.get(["trackData", "dataResponse", ...storedData], function(data){
    trackData = data.trackData
    document.getElementById("dataResponse").innerHTML = data.dataResponse || "<br>"
    for (let i = 0; i < storedData.length; i++) {
        document.getElementById(storedData[i]).value = data[storedData[i]]
    }
    generateData(trackData)
    document.getElementById("loading").hidden = true;
    document.getElementById("main").hidden = false;
})









