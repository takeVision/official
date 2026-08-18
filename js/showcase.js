// ==========================================
// GAIA CLIENT TERMINAL ENGINE (PROTECTED & CLEAN)
// ==========================================

let lastUpdateId = 0;
let base64FileData = null;
let currentFileType = null;
let currentFileName = null;
let isSendingSignal = false; // 🛑 VERHINDERT DOPPELTES SENDEN

// 1. FILE UPLOADER HANDLER (Base64 Konvertierung)
window.updateFileName = function(input) {
    const file = input.files ? input.files[0] : null;
    const display = document.getElementById('fileNameDisplay');
    
    if (file) {
        currentFileName = file.name;
        currentFileType = file.type;
        if (display) display.innerText = `[ATTACHED: ${file.name}]`;

        const reader = new FileReader();
        reader.onload = function (e) {
            base64FileData = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        if (display) display.innerText = '';
        base64FileData = null;
        currentFileName = null;
        currentFileType = null;
    }
};

// 2. TRANSMIT SIGNAL (Website -> Vercel API -> Telegram)
window.sendGaiaSignal = async function(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Protection: Abbrechen, wenn bereits gesendet wird!
    if (isSendingSignal) return;

    const nameInput = document.getElementById('gaiaName');
    const emailInput = document.getElementById('gaiaEmail');
    const messageInput = document.getElementById('gaiaMessage');
    const chatHistory = document.getElementById('gaiaChatHistory');
    const placeholder = document.getElementById('chatPlaceholder');

    const name = nameInput ? nameInput.value : 'Anonym';
    const email = emailInput ? emailInput.value : '';
    const message = messageInput ? messageInput.value : '';

    if (!message.trim() && !base64FileData) return;

    // Sende-Sperre aktivieren
    isSendingSignal = true;

    if (placeholder) placeholder.remove();

    // Visual User Output ins Chatfenster Rendern
    const userMsgHtml = `
        <div style="text-align: right; margin-bottom: 12px;">
            <span style="color: #78fc83; font-size: 0.75rem; display: block; margin-bottom: 2px;">YOU // ${name.toUpperCase()}</span>
            <span style="background: rgba(120, 252, 131, 0.15); border: 1px solid #78fc83; color: #ffffff; padding: 8px 14px; border-radius: 4px; display: inline-block; max-width: 80%; text-align: left;">
                ${message} ${base64FileData ? `<br><small style="color: #78fc83;">[Media Attached: ${currentFileName}]</small>` : ''}
            </span>
        </div>`;
    
    if (chatHistory) {
        chatHistory.insertAdjacentHTML('beforeend', userMsgHtml);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Payload für die Vercel Engine schnüren
    const payload = {
        name: name,
        email: email,
        message: message,
        fileData: base64FileData,
        fileName: currentFileName,
        fileType: currentFileType
    };

    try {
        const res = await fetch('/api/engine?action=send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.ok) {
            // Inputs nach erfolgreichem Senden zurücksetzen
            if (messageInput) messageInput.value = '';
            const fileInput = document.getElementById('gaiaFile');
            const fileDisplay = document.getElementById('fileNameDisplay');
            if (fileInput) fileInput.value = '';
            if (fileDisplay) fileDisplay.innerText = '';
            base64FileData = null;
            currentFileName = null;
            currentFileType = null;
        } else {
            console.error('GAIA ENGINE ERROR:', data);
        }
    } catch (err) {
        console.error('TRANSMISSION FAILED:', err);
    } finally {
        // Sperre nach 500ms wieder freigeben
        setTimeout(() => {
            isSendingSignal = false;
        }, 500);
    }
};

// 3. RECEIVE REPLIES (Telegram -> Vercel API -> Website)
async function pollTelegramReplies() {
    try {
        const res = await fetch(`/api/engine?action=poll&offset=${lastUpdateId + 1}`);
        const data = await res.json();

        if (data.ok && data.result && data.result.length > 0) {
            const chatHistory = document.getElementById('gaiaChatHistory');
            const placeholder = document.getElementById('chatPlaceholder');

            for (const update of data.result) {
                lastUpdateId = update.update_id;

                if (update.message) {
                    if (placeholder) placeholder.remove();

                    // IMAGE TRANSMISSION FROM TELEGRAM
                    if (update.message.photo) {
                        const photos = update.message.photo;
                        const highestResPhoto = photos[photos.length - 1];
                        const caption = update.message.caption || '';
                        const proxyImgUrl = `/api/engine?action=file&file_id=${highestResPhoto.file_id}`;

                        const botImgHtml = `
                        <div style="text-align: left; margin-bottom: 15px;">
                            <span style="color: #ff6a00; font-size: 0.75rem; display: block; margin-bottom: 4px;">GAIA BASE // IMAGE TRANSMISSION</span>
                            <div style="background: rgba(255, 106, 0, 0.12); border: 1px solid #ff6a00; padding: 12px; border-radius: 6px; display: inline-block; max-width: 90%;">
                                <img src="${proxyImgUrl}" style="max-width: 100%; max-height: 420px; object-fit: contain; border-radius: 4px; display: block; margin: 0 auto 8px auto;">
                                ${caption ? `<span style="color: #ffffff; font-size: 0.85rem; display: block;">${caption}</span>` : ''}
                            </div>
                        </div>`;
                        if (chatHistory) {
                            chatHistory.insertAdjacentHTML('beforeend', botImgHtml);
                            chatHistory.scrollTop = chatHistory.scrollHeight;
                        }
                    } 
                    // TEXT MESSAGE FROM TELEGRAM
                    else if (update.message.text) {
                        const botReplyHtml = `
                            <div style="text-align: left; margin-bottom: 12px;">
                                <span style="color: #ff6a00; font-size: 0.75rem; display: block; margin-bottom: 2px;">GAIA BASE // SYSTEM</span>
                                <span style="background: rgba(255, 106, 0, 0.15); border: 1px solid #ff6a00; color: #ffffff; padding: 8px 14px; border-radius: 4px; display: inline-block; max-width: 80%;">
                                    ${update.message.text}
                                </span>
                            </div>`;
                        if (chatHistory) {
                            chatHistory.insertAdjacentHTML('beforeend', botReplyHtml);
                            chatHistory.scrollTop = chatHistory.scrollHeight;
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.error('POLLING ERROR:', e);
    }
}

// 4. AUTO-START POLLING ENGINE (Alle 3 Sekunden)
setInterval(pollTelegramReplies, 3000);

// ==========================================
// HERO AUDIO TOGGLE ENGINE
// ==========================================
window.toggleHeroSound = function() {
    const audio = document.getElementById('heroAudio');
    const btn = document.getElementById('heroSoundBtn');

    if (!audio || !btn) return;

    if (audio.paused) {
        audio.play().then(() => {
            btn.innerText = "[⏸ PAUSE HERO TRANSMISSION]";
            btn.style.background = "#78fc83";
            btn.style.color = "#000000";
            btn.style.boxShadow = "0 0 30px rgba(120, 252, 131, 0.6)";
        }).catch(err => {
            console.error("Audio Play Error:", err);
        });
    } else {
        audio.pause();
        btn.innerText = "[🔊 PLAY HERO TRANSMISSION]";
        btn.style.background = "rgba(120, 252, 131, 0.12)";
        btn.style.color = "#78fc83";
        btn.style.boxShadow = "0 0 20px rgba(120, 252, 131, 0.25)";
    }
};

// Discography Track-Click Event Binding
document.querySelectorAll('.discography-track').forEach(track => {
  track.addEventListener('click', function() {
    const audioSrc = this.getAttribute('data-audio-src');
    const title = this.getAttribute('data-title');
    const artist = this.getAttribute('data-artist') || 'GAIA MEDIA LEGACY';
    const cover = this.getAttribute('data-cover');

    const footerPlayer = document.getElementById('global-footer-player');
    if (footerPlayer) {
      footerPlayer.classList.add('is-active');
      
      const audioEl = footerPlayer.querySelector('audio');
      audioEl.src = audioSrc;
      
      footerPlayer.querySelector('.player-title').textContent = title;
      footerPlayer.querySelector('.player-artist').textContent = artist;
      if (cover) footerPlayer.querySelector('.player-cover').src = cover;
      
      audioEl.play().catch(err => console.log("Autoplay blockiert:", err));
    }
  });
});

// Lightbox Modal Steuerung
function openLightbox(imgUrl, title) {
  const modal = document.getElementById('gallery-lightbox');
  if (modal) {
    modal.querySelector('.lightbox-img').src = imgUrl;
    modal.querySelector('.lightbox-title').textContent = title || '';
    modal.classList.add('open');
  }
}

function closeLightbox() {
  const modal = document.getElementById('gallery-lightbox');
  if (modal) modal.classList.remove('open');
}

// Share Funktion (Web Share API mit Fallback)
async function shareImage(imgUrl, title) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || 'GAIA ARCHIVE',
        text: 'Schau dir diesen Content aus dem GAIA ARCHIVE an:',
        url: imgUrl
      });
    } catch (err) { console.log('Share abgebrochen'); }
  } else {
    navigator.clipboard.writeText(imgUrl);
    alert('Bild-Link in Zwischenablage kopiert!');
  }
}

// File Upload Listener für den Wave Chat
const chatFileInput = document.getElementById('chat-file-input');
chatFileInput?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const isImage = file.type.startsWith('image/');
    if (typeof appendChatMessage === 'function') {
        appendChatMessage({
          type: isImage ? 'image' : 'file',
          content: event.target.result,
          sender: 'user'
        });
    }
  };
  reader.readAsDataURL(file);
});

const castData = {
  'gml-core': {
    title: 'GAIA MEDIA LEGACY (GML)',
    content: 'GAIA MEDIA LEGACY ist die Schnittstelle zwischen Next-Gen Media Distribution, immersivem Design und dezentralen Inhalten im GAIA UNIVERSE...'
  }
};

function openCastModal(key) {
  const data = castData[key];
  if (!data) return;
  const body = document.getElementById('modal-body');
  const modal = document.getElementById('cast-modal');
  if (body) {
    body.innerHTML = `
      <h2>${data.title}</h2>
      <p class="typewriter-text">${data.content}</p>
    `;
  }
  if (modal) modal.classList.add('active');
}

function closeCastModal() {
  const modal = document.getElementById('cast-modal');
  if (modal) modal.classList.remove('active');
}

// ============================================================
// 🎬 GAIA SHOWCASE: BUNNY STREAM VIDEO PLAYER ENGINE
// ============================================================
window.playGaiaTrack = function(videoId, title) {
    console.log("🎬 [GML Showcase] Lade Video-ID:", videoId);

    var iframe = document.getElementById("gaiaBunnyPlayer");
    var titleDisplay = document.getElementById("gaiaVideoTitle");

    if (iframe && videoId) {
        iframe.src = "https://iframe.mediadelivery.net/embed/706349/" + videoId + "?autoplay=true&loop=true&muted=false";
    } else {
        console.error("❌ Player-Iframe (#gaiaBunnyPlayer) nicht im DOM gefunden!");
    }

    if (titleDisplay && title) {
        titleDisplay.innerText = title;
    }

    var playerWrapper = document.querySelector(".web5-player-wrapper");
    if (playerWrapper) {
        playerWrapper.scrollIntoView({ behavior: "smooth", block: "center" });
    }
};