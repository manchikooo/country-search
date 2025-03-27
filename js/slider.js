document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("population-slider");
    const input = document.getElementById("population-input");

    // Функция для форматирования чисел (добавляет пробелы)
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Функция обновления синей полоски
    function updateSliderTrack() {
        const min = slider.min;
        const max = slider.max;
        const value = slider.value;

        const percentage = ((value - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(to right, black ${percentage}%, #ddd ${percentage}%)`;
    }

    // Обновляем input и полосу при движении ползунка
    slider.addEventListener("input", () => {
        input.value = formatNumber(slider.value);
        updateSliderTrack();
    });

    // Обновляем ползунок при вводе в input
    input.addEventListener("input", () => {
        let rawValue = input.value.replace(/\s/g, '');
        let numberValue = parseInt(rawValue, 10);

        if (!isNaN(numberValue)) {
            numberValue = Math.max(slider.min, Math.min(slider.max, numberValue));
            slider.value = numberValue;
            input.value = formatNumber(numberValue);
            updateSliderTrack();
        }
    });

    // Восстановление правильного значения при потере фокуса
    input.addEventListener("blur", () => {
        let rawValue = input.value.replace(/\s/g, '');
        if (rawValue === "" || isNaN(parseInt(rawValue, 10))) {
            input.value = formatNumber(slider.value);
        }
    });

    // Устанавливаем начальное значение синей полоски
    updateSliderTrack();
});

// Функция для сворачивания/разворачивания фильтра
function toggleSingleFilter(element) {
    const sliderContainer = element.parentElement;
    sliderContainer.classList.toggle("active");
}
