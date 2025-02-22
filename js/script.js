document.addEventListener("DOMContentLoaded", () => {
    console.log("JS подключен и работает!");

    const searchInput = document.getElementById("search");
    const countriesContainer = document.getElementById("countries-container");

    searchInput.addEventListener("input", () => {
        console.log("Поиск:", searchInput.value);
    });
});
