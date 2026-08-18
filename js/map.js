document.addEventListener("DOMContentLoaded", function() {
    // 1. Initialisiere die Karte (Hier kannst du die Koordinaten deines HQ eintragen)
    // [Breitengrad, Längengrad], Zoomstufe (z.B. 13)
    var map = L.map('map', {
        scrollWheelZoom: false // Verhindert, dass die Map ungewollt beim Scrollen zoomt
    }).setView([48.138000, 11.534000], 13); // Beispiel Berlin. Trag hier deine Koordinaten ein!

    // 2. Lade die OpenStreetMap-Kacheln
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 3. Füge einen edlen Marker für ONAIR hinzu
    var customIcon = L.divIcon({
        className: 'onair-map-marker',
        html: '<div style="background-color: #00ffff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px rgba(0,255,255,0.8);"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    L.marker([48.138000, 11.534000], { icon: customIcon })
        .addTo(map)
        .bindPopup('<b>ONAIR HQ</b><br>GAIA PRODUCTIONS.')
        .openPopup();
});
setTimeout(function() {
    map.invalidateSize();
}, 100);
