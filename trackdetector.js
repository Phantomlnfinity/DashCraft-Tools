let fetchTimeout = 0
document.getElementById("trackInput").addEventListener('input', function() {
    document.getElementById("result").innerHTML = "Loading..."
    clearTimeout(fetchTimeout)
    fetchTimeout = setTimeout(function(){checkTrack(document.getElementById("trackInput").value)}, 500)
})


async function checkTrack(link) {
    try {
        data = await fetch(`https://cdn.dashcraft.io/v2/prod/track/${link.slice(-24)}.json`)
            .then(response => response.json())
            .then(json => json.trackPieces)
        let total = BigInt(0);
        for (let i = 0; i < 4; i++) {
            total -= BigInt(data[i + data.length - 4].uid) * BigInt(2**(31*i));
        }
        
        try {
            console.log(total, total.toString(16))
            const track = await fetch(`https://api.dashcraft.io/trackv2/${total.toString(16)}`)
                .then(response => response.json())
            document.getElementById("result").innerHTML = `Track copied from <a target="_blank" href="https://dashcraft.io/?t=${total.toString(16)}">${track.user.username}</a>`
        }
        catch {
            if (data.some(piece => {
                if (piece.p.some(position => position % 15 != 0)) return true
                if (piece.p[0] < -750 || piece.p[0] > 750 || piece.p[1] < 0 || piece.p[1] > 1500 || piece.p[2] < -750 || piece.p[2] > 750) return true
                if (piece.r % 90 != 0) return true
                return false
            })) {
                document.getElementById("result").innerHTML = "Track imported from unknown source"
            } else {
                document.getElementById("result").innerHTML = "Track not copied"
            }
        }
    }
    catch {
        document.getElementById("result").innerHTML = "Invalid link"
    }
}
