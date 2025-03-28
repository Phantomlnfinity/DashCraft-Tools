let fakeTrackData;
try {
    fakeTrackData = JSON.parse(localStorage.getItem("trackData"));
}
catch {
    fakeTrackData = [];
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
    if (headers.hasOwnProperty("headers") && headers.headers.hasOwnProperty("Authorization") && headers.headers.Authorization != "") {
        let tokens
        try {
            tokens = JSON.parse(localStorage.getItem("tokens"));
        } catch {
            tokens = [];
        }
        if (!tokens.includes(headers.headers.Authorization)) {
            realFetch("https://api.dashcraft.io/auth/account", {headers: {
                Authorization: headers.headers.Authorization
            }})
                .then(response => response.json())
                .then(account => {
                    if (!/^Player\d{7}$/.test(account.username)) {
                        tokens.push(headers.headers.Authorization);
                        localStorage.setItem("tokens", JSON.stringify(tokens))
                    }
                })
        }
    }
    if (fakeTrackData.length > 0 && /^https:\/\/cdn\.dashcraft\.io\/v2\/prod\/track\/.{24}\.json\?v=.?.$/.test(url)) {
        return new Promise((resolve, reject) => {
            let response
            realFetch(url, headers)
                .then(responsea => {response = responsea; return responsea.json()})
                .then(json => {
                    const newData = generateData(json.trackPieces, fakeTrackData);
                    console.log(newData);
                    if (json.trackPieces.length != newData.length) {
                        message(`Track has ${json.trackPieces.length} pieces but should have ${newData.length}. Opening regular track instead.`, true)
                    } else {
                        json.trackPieces = newData;
                        message("JSON swapped successfully!", false)
                    }
                    return json;
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







function generateData(pieces, fakePieces) {    
    let newPieces = structuredClone(fakePieces);
    function getTotal(array) {
        let total = {p: [0, 0, 0], r: 0}
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < 3; j++) {
                total.p[j] += array[i].p[j];
            }
            total.r += array[i].r
        }
        return total
    }

    const oldTotal = getTotal(pieces);
    const newTotal = getTotal(fakePieces);
    console.log(oldTotal, newTotal);
    const dif = {p: [oldTotal.p[0] - newTotal.p[0], oldTotal.p[1] - newTotal.p[1], oldTotal.p[2] - newTotal.p[2]], rotation: oldTotal.r - newTotal.r};
    if (dif.p.some(p => p != 0) || dif.rotation != 0) {
        newPieces.push({"id":84,"uid":1000000,"p":dif.p,"r":dif.rotation,"a":[]});
    }
    return newPieces;

}









