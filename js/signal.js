const form = document.getElementById('form');
const result = document.getElementById('result');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const originalText = submitBtn.textContent;

    // Terminal Status: Transmission läuft
    submitBtn.textContent = "TRANSMITTING...";
    submitBtn.disabled = true;
    result.textContent = ">> STATUS: UPLINK AKTIV // WARTE AUF SERVER...";

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            result.textContent = ">> STATUS: SUCCESS // SIGNAL EMPFANGEN // LEGACY UPDATED.";
            form.reset();
        } else {
            result.textContent = ">> FEHLER: " + data.message;
        }
    } catch (error) {
        result.textContent = ">> KRITISCHER FEHLER // UPLINK GESCHEITERT.";
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});