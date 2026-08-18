document.addEventListener("DOMContentLoaded", function() {
    const burgerBtn = document.getElementById('onairBurgerBtn');
    const menuOverlay = document.getElementById('onairMenuOverlay');
    const menuLinks = document.querySelectorAll('.onair-menu-list a');

    if (burgerBtn && menuOverlay) {
        // Toggle Menu
        burgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            burgerBtn.classList.toggle('active');
            menuOverlay.classList.toggle('open');
            
            // Verhindert Scrollen im Hintergrund wenn Menü offen ist
            if (menuOverlay.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Schließen wenn ein Link geklickt wird
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                burgerBtn.classList.remove('active');
                menuOverlay.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }
});