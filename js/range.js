document.addEventListener("DOMContentLoaded", () => {
    const rangeContainer = document.querySelector(".range-container");

    // ✅ Открываем фильтр по умолчанию, но устанавливаем `data-open` для корректной работы toggle
    rangeContainer.classList.add("active");
    rangeContainer.setAttribute("data-open", "true");
});

// Функция сворачивания/разворачивания фильтра
function toggleRange(element) {
    const rangeContainer = element.parentElement;
    const rangeContent = rangeContainer.querySelector(".range-content");

    // ✅ Проверяем, открыт ли фильтр по `data-open`
    if (rangeContainer.getAttribute("data-open") === "true") {
        rangeContent.style.display = "none";
        rangeContainer.classList.remove("active");
        rangeContainer.setAttribute("data-open", "false");
    } else {
        rangeContent.style.display = "block";
        rangeContainer.classList.add("active");
        rangeContainer.setAttribute("data-open", "true");
    }
}
