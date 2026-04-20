function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.classList.toggle("hidden");
}

// Optional: close when clicking outside
window.addEventListener("click", function(e) {
    const menu = document.getElementById("dropdownMenu");
    const icon = document.querySelector(".profile-icon");

    if (!icon.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add("hidden");
    }
    console.log("fahhhhhhhh!!!!!!!!!!!!!")
});

function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.classList.toggle("hidden");
}







const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");

if (input) {
    input.addEventListener("change", function () {
        const file = this.files[0];

        if (file) {
            preview.src = URL.createObjectURL(file);
            preview.classList.remove("hidden");
        }
    });
}


