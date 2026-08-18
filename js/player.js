document.addEventListener("DOMContentLoaded", function() {
    // --- Globale Variablen für den Web3-Player ---
    const audio = document.getElementById("gaia-audio-engine");
    const player = document.getElementById("web3-player-dock");
    const playBtn = document.getElementById("player-play-btn");
    const playIcon = document.getElementById("play-icon");
    const pauseIcon = document.getElementById("pause-icon");
    const titleDisplay = document.getElementById("player-current-title");
    const coverDisplay = document.getElementById("player-current-cover");
    const progressFill = document.getElementById("player-progress-fill");
    const progressBar = document.getElementById("player-progress-bar");
    const currentTimeText = document.getElementById("player-current-time");
    const totalTimeText = document.getElementById("player-total-time");
    const closeBtn = document.getElementById("player-close-btn");

    // --- Hero Audio (Background) ---
    const heroAudio = document.getElementById("bg-sound");
    const soundControlButtons = document.querySelectorAll(".sound-control");

    let currentActiveTrigger = null;
    let isUnlocked = false;

    // --- Mobile Audio Unlocker ---
    function unlockMobileAudio() {
        if (isUnlocked) return;
        audio.play().then(() => { audio.pause(); }).catch(() => {});
        if (heroAudio) {
            heroAudio.play().then(() => { heroAudio.pause(); }).catch(() => {});
        }
        isUnlocked = true;
    }

    // --- Hero Sound Control ---
    soundControlButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            unlockMobileAudio();
            if (heroAudio.paused) {
                heroAudio.play();
                updateHeroIcons(true);
            } else {
                heroAudio.pause();
                updateHeroIcons(false);
            }
        });
    });

    function updateHeroIcons(isPlaying) {
        soundControlButtons.forEach(btn => {
            const svg = btn.querySelector('.sound-svg');
            svg.innerHTML = isPlaying 
                ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>' 
                : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
        });
    }

    // --- Player Funktionen ---
    function playTrack() {
        audio.play().then(() => {
            player.classList.add("playing");
            togglePlayIcons(true);
            updateTriggerText(true);
        }).catch(err => console.error(err));
    }

    function pauseTrack() {
        audio.pause();
        player.classList.remove("playing");
        togglePlayIcons(false);
        updateTriggerText(false);
    }

    function togglePlayIcons(isPlaying) {
        if (!playIcon || !pauseIcon) return;
        playIcon.style.display = isPlaying ? "none" : "block";
        pauseIcon.style.display = isPlaying ? "block" : "none";
    }

    function resetAllTriggers() {
        document.querySelectorAll(".play-trigger").forEach(trig => {
            const playSpan = trig.querySelector("span");
            if (playSpan) {
                playSpan.textContent = "▶ PLAY";
                playSpan.style.color = "#00f0ff";
            }
        });
    }

    function updateTriggerText(isPlaying) {
        if (!currentActiveTrigger) return;
        const audioSrc = currentActiveTrigger.getAttribute("data-audio");
        document.querySelectorAll(`.play-trigger[data-audio="${audioSrc}"]`).forEach(trig => {
            const playSpan = trig.querySelector("span");
            if (playSpan) {
                playSpan.textContent = isPlaying ? "❚❚ PAUSE" : "▶ PLAY";
                playSpan.style.color = isPlaying ? "#00ff66" : "#00f0ff";
            }
        });
    }

    function formatTime(seconds) {
        let min = Math.floor(seconds / 60);
        let sec = Math.floor(seconds % 60);
        return min + ":" + (sec < 10 ? "0" + sec : sec);
    }

    // --- Event Listener ---
    if (closeBtn) {
        closeBtn.addEventListener("click", function(e) {
            e.preventDefault();
            audio.pause();
            audio.currentTime = 0;
            player.classList.remove("playing", "active");
            togglePlayIcons(false);
            resetAllTriggers();
        });
    }

    playBtn.addEventListener("click", function(e) {
        e.preventDefault();
        unlockMobileAudio();
        if (audio.src) {
            if (audio.paused) playTrack(); else pauseTrack();
        }
    });

    document.querySelectorAll(".play-trigger").forEach(item => {
        item.addEventListener("click", function(e) {
            e.preventDefault();
            unlockMobileAudio();
            
            // Auto-Pause Hero-Audio wenn Web3-Track startet
            if (heroAudio && !heroAudio.paused) {
                heroAudio.pause();
                updateHeroIcons(false);
            }

            const audioSrc = this.getAttribute("data-audio");
            const trackName = this.getAttribute("data-title");
            const coverSrc = this.getAttribute("data-cover");

            if (!audioSrc) return;

            const isCurrentTrack = audio.src && audio.src.includes(audioSrc);

            if (isCurrentTrack) {
                if (audio.paused) playTrack(); else pauseTrack();
            } else {
                resetAllTriggers();
                audio.src = audioSrc;
                audio.load();
                titleDisplay.textContent = trackName;
                coverDisplay.src = coverSrc || "";
                coverDisplay.style.display = coverSrc ? "block" : "none";
                player.classList.add("active");
                currentActiveTrigger = this;
                playTrack();
            }
        });
    });

    audio.addEventListener("timeupdate", () => {
        if (audio.duration && progressBar) {
            progressFill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
            currentTimeText.textContent = formatTime(audio.currentTime);
        }
    });

    audio.addEventListener("loadedmetadata", () => {
        if(totalTimeText) totalTimeText.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("ended", () => {
        audio.pause();
        audio.currentTime = 0;
        player.classList.remove("playing");
        togglePlayIcons(false);
        resetAllTriggers();
    });

    progressBar.addEventListener("click", function(e) {
        const percent = e.offsetX / this.offsetWidth;
        audio.currentTime = percent * audio.duration;
    });
});
