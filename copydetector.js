let fetchTimeout = 0
document.getElementById("trackInput").addEventListener('input', function() {
    document.getElementById("result").innerHTML = "Loading..."
    clearTimeout(fetchTimeout)
    fetchTimeout = setTimeout(function(){checkTrack(document.getElementById("trackInput").value)}, 500)
})


async function checkTrack(link) {
    try {
        let data = await fetch(`https://cdn.dashcraft.io/v2/prod/track/${link.slice(-24)}.json`)
            .then(response => response.json())
            .then(json => json.trackPieces)
        
        if (data.some(piece => {
            if (piece.p.some(position => position % 15 != 0)) return true
            if (piece.p[0] < -750 || piece.p[0] > 750 || piece.p[1] < 0 || piece.p[1] > 1500 || piece.p[2] < -750 || piece.p[2] > 750) return true
            if (piece.r % 90 != 0) return true
            return false
        })) {
            document.getElementById("result").innerHTML = "Track has illegal block placements"
        } else {
            document.getElementById("result").innerHTML = "Track not imported"
        }
    } catch {
        document.getElementById("result").innerHTML = "Invalid link"
    }
}
