document.addEventListener("DOMContentLoaded", function() {
    const lightbox = document.getElementById("custom-lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const triggers = document.querySelectorAll(".lightbox-trigger");

    triggers.forEach(trigger => {
        trigger.addEventListener("click", function(e) {
            e.preventDefault();
            const fullImgUrl = this.getAttribute("href");
            lightboxImg.setAttribute("src", fullImgUrl);
            lightbox.style.display = "flex";
        });
    });

    lightbox.addEventListener("click", function() {
        lightbox.style.display = "none";
        lightboxImg.setAttribute("src", "");
    });
});
