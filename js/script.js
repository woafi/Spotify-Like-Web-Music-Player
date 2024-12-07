let currSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {

    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    // Calculate minutes
    const minutes = Math.floor(seconds / 60);
    // Calculate remaining seconds
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMintues = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    return `${formattedMintues}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/Spotify%20Clone/song/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(response)
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // console.log(element.href.split("/song/")[1])
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    // console.log(document.querySelector(".songList").getElementsByTagName("ul")[0])
    songUL.innerHTML = "";
    for (const element of songs) {
        songUL.innerHTML += `<li><img class="filter" src="svg/music.svg" alt="">
                            <div class="info">
                                <div>${element.replaceAll("%20", " ")}</div>
                            </div>
                            <div class="playList">
                                <span>Play Now</span>
                                <img class="filter" src="svg/play.svg" alt="">
                            </div></li>`
    }
    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            // console.log(e.querySelector(".info").firstElementChild.innerHTML.trim()) if song is not play use trim()
        })
    })
    return songs
}

//Play music function
function playMusic(track, pause = false) {
    currSong.src = `/Spotify Clone/song/${currFolder}/` + track;
    if (!pause) {
        currSong.play();
        play.src = "svg/pause.svg";
    }

    document.querySelector(".songInfo").innerHTML = decodeURI(track.split(".m")[0]);
    document.querySelector(".duration").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/Spotify%20Clone/song/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    // console.log(anchors[0])
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        // console.log(e.href)
        if (e.href.includes("/song")) {
            // console.log(e.href.split("/").slice(-2)[0])
            let folder = e.href.split("/")[5]
            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/Spotify%20Clone/song/${folder}/info.json`)
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <div class="circular-box">
                                <svg class="play-button" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 20V4L19 12L5 20Z" fill="#000" />
                                </svg>
                            </div>
                        </div>
                        <div class="image">
                            <img src="song/${folder}/cover.jpg" alt="">
                        </div>
                        <div class="text">
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>
                    </div>`
        }
    }
    //load the playlist whenever card is click
    Array.from(document.querySelectorAll(".card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            // await getSongs(`${e.dataset.folder}`)
            songs = await getSongs(`${e.dataset.folder}`)
            // console.log(songs);
            playMusic(songs[0])
        })
    });

}

async function main() {

    //Get the list of all songs
    await getSongs(`cs`)
    //for loading the song after refresh
    playMusic(songs[0], true)


    //Display all the albums
    await displayAlbums()

    //Attach an event listener to each song after touch play button in seekbar
    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play()
            play.src = "svg/pause.svg"
        } else {
            currSong.pause()
            play.src = "svg/play.svg"
        }
    })

    // duration update
    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".duration").innerHTML = formatTime(currSong.currentTime) + " / " + formatTime(currSong.duration)
        //seekbar is running
        // document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%";
    })
    // add event listener to seekbar
    // document.querySelector(".seekbar").addEventListener("click", e => {
    //     let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    //     document.querySelector(".circle").style.left = percent + "%";
    //     currSong.currentTime = (currSong.duration * percent) / 100;
    // })
    // Update seek bar and time display
    const seekBar = document.getElementById('seek-bar');
    currSong.addEventListener('timeupdate', () => {
        // Sync the seek bar with the current playback time
        seekBar.value = (currSong.currentTime / currSong.duration) * 100;
    });
    // add event listener to seekbar
    seekBar.addEventListener('input', () => {
        const seekTo = (seekBar.value / 100) * currSong.duration;
        currSong.currentTime = seekTo;
    });

    //add event listener to hamburger
    document.getElementById("ham").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    document.getElementById("close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-200%";
    })

    //add event listener to prev and nxt button
    prev.addEventListener("click", () => {
        currSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        currSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    //add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/100")
        currSong.volume = e.target.value / 100
    })

    //add en event listener to volume button
    document.querySelector(".volume > img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    //play-button hover
    Array.from(document.querySelectorAll(".card")).forEach((e) => {
        // console.log(e.querySelector(".play").innerHTML)

        e.addEventListener("mouseover", element => {
            e.querySelector(".play").style.opacity = "1";
            e.querySelector(".play").style.top = "160px";
        })
        e.addEventListener("mouseout", element => {
            e.querySelector(".play").style.opacity = "0";
            e.querySelector(".play").style.top = "210px";
        })
    })
    // console.log(document.querySelector(".play"))

}
main()


