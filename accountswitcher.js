async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    return tab;
}




(async () => {
    const tab = await getCurrentTab();
    const {tokens} = await chrome.tabs.sendMessage(tab.id, {type: "getTokens", data: []});
    
    console.log(tokens)
    console.log(tokens.length)
    accountFetches = [];
    for (let i = 0; i < tokens.length; i++) {
        console.log(tokens[i])
        accountFetches.push(f=
            fetch("https://api.dashcraft.io/auth/account", {headers: {
                Authorization: tokens[i]
            }})
                .then(response => response.json())
                .then(account => {
                    document.getElementById("accountlist").innerHTML += 
                    `<div class="small" id="${account._id + "parent"}">
                        <button id="${account._id + "signin"}">
                            <span class="text">${account.username}</span>
                        </button>
                        <button class="deletebutton" id="${account._id + "delete"}">
                            <image class="buttonbackground" src="trashcan.png">
                        </button>
                    </div>`
                    return {id: account._id, token: tokens[i]}
                    
                })
    )
    }
    buttons = await Promise.all(accountFetches);
    console.log(buttons)

    for (let i = 0; i < buttons.length; i++) {
        console.log(document.getElementById(buttons[i].id))
        document.getElementById(buttons[i].id + "signin").addEventListener("click", () => {
            chrome.tabs.sendMessage(tab.id, {type: "signIn", data: buttons[i].token})
        })

        document.getElementById(buttons[i].id + "delete").addEventListener("click", () => {
            chrome.tabs.sendMessage(tab.id, {type: "removeToken", data: buttons[i].token})
            document.getElementById(buttons[i].id + "parent").remove()
        })
    }

    console.log(document)
    document.getElementById("loading").hidden = true;
    document.getElementById("main").hidden = false;
})();

