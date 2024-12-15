


let fakeTrackData = JSON.parse(localStorage.getItem("trackData") || "[]")

function checkJSON(json) {
    if (json.length != fakeTrackData.length) {
        message(`Track has ${json.length} pieces but should have ${fakeTrackData.length}. Opening regular track instead.`, true)
        return false
    }
    let totalsa = {p: [0, 0, 0], r: 0}
    let totalsb = {p: [0, 0, 0], r: 0}
    for (let i = 0; i < json.length; i++) {
        for (let j = 0; j < 3; j++) {
            totalsa.p[j] -= json[i].p[j];
            totalsb.p[j] -= fakeTrackData[i].p[j];
        }
        totalsa.r -= json[i].r
        totalsb.r -= fakeTrackData[i].r
    }
    if (totalsa.p[0] != totalsb.p[0]) {
        message(`Total of x coordinates is ${totalsa.p[0]} but should be ${totalsb.p[0]}.\n Opening regular track instead.`, true)
        return false
    } 
    if (totalsa.p[1] != totalsb.p[1]) {
        message(`Total of y coordinates is ${totalsa.p[1]} but should be ${totalsb.p[1]}.\n Opening regular track instead.`, true)
        return false
    }
    if (totalsa.p[2] != totalsb.p[2]) {
        message(`Total of z coordinates is ${totalsa.p[2]} but should be ${totalsb.p[2]}.\n Opening regular track instead.`, true)
        return false
    }
    if (totalsa.r != totalsb.r) {
        message(`Total of rotations is ${totalsa.r} but should be ${totalsb.r}.\n Opening regular track instead.`, true)
        return false
    }
    message("JSON swapped successfully!", false)
    return true
}



function message(text, error) {
    const messagebox = document.getElementById("messagebox")    
    if (error) {
        messagebox.style.background = "#9c362f"
        messagebox.style.borderColor = "#4a120e"
    } else {
        messagebox.style.background = "#479c2f"
        messagebox.style.borderColor = "#184a0e"
    }
    messagebox.innerHTML = text
    messagebox.style.display = "block"
    setTimeout(function() {messagebox.style.display = "none"}, 5000)
}


const realFetch = window.fetch;
window.fetch = function(url, headers={}) {
    if (fakeTrackData.length > 0 && /^https:\/\/cdn\.dashcraft\.io\/v2\/prod\/track\/........................\.json\?v=.?.$/.test(url)) {
        return new Promise((resolve, reject) => {
            let response
            realFetch(url, headers)
                .then(responsea => {response = responsea; return responsea.json()})
                .then(json => {
                    if (checkJSON(json.trackPieces)) json.trackPieces = fakeTrackData
                    return json
                })

                .then(data => {
                    // Create a new Response object with the modified data
                    const newResponse = new Response(JSON.stringify(data), response);
                    resolve(newResponse)
                })
        });
    }
    return realFetch(url, headers);
};


function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }
  ready(async function(){
    let ui = document.createElement("div");
    ui.appendChild(document.createTextNode("hi"))
    ui.id = "dcutils"
    ui.style = "position: absolute; top: 0; left: 0; z-index: 100000; width: 100%; height: 100%; pointer-events: none"; 
    // document.getElementById("unity-container").style.position = "relative"
    document.body.appendChild(ui)
    const div = document.getElementById("dcutils")
    div.innerHTML = 
    `<div id="messagebox" style="display: none; width: 300px; background: #9c362f; border-radius: 15px; border: 5px solid #4a120e; padding: 15px; float: right; margin: 15px"></div>`
    
})

document.addEventListener('getJSON', function (e) {
    fakeTrackData = e.detail
    localStorage.setItem("trackData", JSON.stringify(fakeTrackData))
});
