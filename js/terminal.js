document.addEventListener('DOMContentLoaded', () => {
    console.log("Terminal-Script geladen und bereit."); // Zur Kontrolle im Inspector

    const messages = [
        "Try Connection...",
        ".","..","...","....", 
        "Connection Initialized",
        "Checking Connection...",
       ".","..","...","....", 
        "Connection Granted",
        "Security Protocols initialazing...",
        ".","..","...","....", 
        "Security protocol available ",
        "STATUS : ACTIVE",
        "Verifying Security Keys...",
        ".","..","...","....", 
        "GAIA Security Keyring initialazing...",
        ".","..","...","....", 
        "KEY Accepted ", 
        "Validating Token...",
        ".","..","...","....", 
        "Token Accepted",
        "Secure Connection Start...",
        ".","..","...","....", 
        "Secure Tunnel Established",
        "Secure Connection Online",
        "Waiting for Transition..."
    ];

    const output = document.getElementById('terminal-output');
    
    // Check, ob das Element überhaupt gefunden wurde
    if (!output) {
        console.error("Fehler: Element #terminal-output nicht gefunden!");
        return;
    }

    let i = 0;

    function runTerminal() {
        if (i < messages.length) {
            output.innerText = messages[i];
            output.style.opacity = 1;
            i++;
            setTimeout(runTerminal, 450);
        } else {
            output.innerHTML += '<span class="terminal-cursor"></span>';
        }
    }

    // Sequenz starten
    runTerminal();
});
    // Startet die Sequenz, sobald die Seite geladen ist