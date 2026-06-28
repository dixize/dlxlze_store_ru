document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. МИНИМАЛИСТИЧНЫЙ КУРСОР-ТОЧКА
    // ==========================================
    const dot = document.querySelector(".custom-cursor-dot");

    if (dot && window.innerWidth > 768) {
        document.addEventListener("mousemove", (e) => {
            dot.style.opacity = "1";
            dot.style.left = `${e.clientX}px`;
            dot.style.top = `${e.clientY}px`;
        });
        document.addEventListener("mouseleave", () => {
            dot.style.opacity = "0";
        });
    }

    // ==========================================
    // 2. БЕЗОПАСНАЯ АНИМАЦИЯ СКРОЛЛА (REVEAL)
    // ==========================================
    const revealTargets = document.querySelectorAll(".scroll-reveal");
    
    // JS работает -> готовим блоки к анимации
    revealTargets.forEach(target => target.classList.add("js-prep"));

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("scroll-reveal-active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });
    
    revealTargets.forEach(target => revealObserver.observe(target));

    // ==========================================
    // 3. ФИЛЬТРАЦИЯ КЕЙСОВ ПОРТФОЛИО
    // ==========================================
    const filterButtons = document.querySelectorAll(".filter-btn");
    const portfolioCards = document.querySelectorAll(".portfolio-item-card");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filterValue = button.getAttribute("data-filter");
            portfolioCards.forEach(card => {
                const cat = card.getAttribute("data-category");
                if (filterValue === "all" || cat === filterValue) {
                    card.classList.remove("hide");
                } else {
                    card.classList.add("hide");
                }
            });
        });
    });

    // ==========================================
    // 4. ДИНАМИЧЕСКИЙ УМНЫЙ КАЛЬКУЛЯТОР ЦЕН
    // ==========================================
    const tiles = document.querySelectorAll(".selector-tile");
    const checkTg = document.getElementById("addon-tg");
    const checkAnim = document.getElementById("addon-anim");
    const priceDisplay = document.getElementById("live-price-display");
    const tgText = document.getElementById("tg-addon-price-text");
    const animText = document.getElementById("anim-addon-price-text");

    let currentType = "landing"; 
    let currentTypeName = "Лендинг / Промо";

    // Отслеживание клика по типу сайта
    tiles.forEach(tile => {
        tile.addEventListener("click", (e) => {
            // Если кликнули по ссылке на пример внутри плитки, не меняем активную плитку
            if (e.target.classList.contains("tile-example-link")) return;

            tiles.forEach(t => t.classList.remove("active"));
            tile.classList.add("active");
            
            currentType = tile.getAttribute("data-type");
            currentTypeName = tile.querySelector("h4").textContent;
            
            calculateTotal();
        });
    });

    // Отслеживание изменений в чекбоксах
    if (checkTg) checkTg.addEventListener("change", calculateTotal);
    if (checkAnim) checkAnim.addEventListener("change", calculateTotal);

    function calculateTotal() {
        let basePrice = 750;
        
        if (currentType === "landing") {
            basePrice = 750;
            
            // Настройка текста и разблокировка опций
            if (tgText) tgText.textContent = "+200 ₽";
            if (animText) animText.textContent = "+150 ₽";
            if (checkTg) checkTg.disabled = false;
            if (checkAnim) checkAnim.disabled = false;
            
            // Расчет добавочной стоимости
            if (checkTg && checkTg.checked) basePrice += 200;
            if (checkAnim && checkAnim.checked) basePrice += 150;

        } else if (currentType === "store") {
            basePrice = 1250;
            
            // Опции включены в общую стоимость
            if (tgText) tgText.textContent = "Включено";
            if (animText) animText.textContent = "Включено";
            
            if (checkTg) { checkTg.checked = true; checkTg.disabled = true; }
            if (checkAnim) { checkAnim.checked = true; checkAnim.disabled = true; }

        } else if (currentType === "service") {
            basePrice = 800;
            
            if (tgText) tgText.textContent = "+200 ₽";
            if (animText) animText.textContent = "+100 ₽";
            if (checkTg) checkTg.disabled = false;
            if (checkAnim) checkAnim.disabled = false;
            
            if (checkTg && checkTg.checked) basePrice += 200;
            if (checkAnim && checkAnim.checked) basePrice += 100;
        }
        
        if (priceDisplay) {
            priceDisplay.textContent = basePrice;
        }
    }

    // Запускаем первичный расчет при старте страницы
    calculateTotal();

    // ==========================================
    // 5. ИНТЕГРАЦИЯ И ОТПРАВКА В TELEGRAM API
    // ==========================================
    const feedbackForm = document.getElementById("portfolio-interactive-form");
    const successUI = document.getElementById("form-success-state");
    const submitButton = document.getElementById("form-submit-trigger");
    const spinner = submitButton ? submitButton.querySelector(".spinner") : null;
    const btnText = submitButton ? submitButton.querySelector(".btn-text") : null;

    if (feedbackForm) {
        feedbackForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (btnText && spinner && submitButton) {
                btnText.textContent = "Отправка спецификации...";
                spinner.classList.remove("hidden");
                submitButton.style.pointerEvents = "none";
            }

            const payload = {
                name: document.getElementById("client_name").value.trim(),
                contact: document.getElementById("client_contact").value.trim(),
                comment: document.getElementById("client_task").value.trim(),
                totalPrice: priceDisplay ? priceDisplay.textContent : "0"
            };

            let options = [];
            if (currentType === "store") {
                options.push("Telegram API (Включено)", "UI-Анимации (Включено)");
            } else {
                if (checkTg && checkTg.checked) options.push("Telegram API");
                if (checkAnim && checkAnim.checked) options.push("UI-Анимации");
            }
            const optionsText = options.length > 0 ? options.join(", ") : "Нет";

            // Данные Telegram для dixize store
            const BOT_TOKEN = "8661284136:AAHBgqLam2eJiR0Nw_JGDWIkt5mi_FCTux0"; 
            const CHAT_ID = "5415190532"; 

            const textMessage = `
📝 СФОРМИРОВАНО НОВОЕ ТЗ
──────────────────
👤 Имя клиента: ${payload.name}
📞 Связь: ${payload.contact}

🖥️ Спецификация сайта: ${currentTypeName}
⚙️ Выбранные опции: ${optionsText}
💬 Пожелания: ${payload.comment || "Не указаны"}

💵 Итоговая стоимость: ${payload.totalPrice} ₽
──────────────────
📊 Заявка собрана через форму на сайте.
            `.trim();

            try {
                const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: textMessage
                    })
                });

                if (response.ok) {
                    feedbackForm.style.opacity = "0";
                    setTimeout(() => {
                        feedbackForm.classList.add("hidden-state");
                        if (successUI) successUI.classList.remove("hidden-state");
                    }, 250);
                } else {
                    throw new Error("Telegram API Error");
                }

            } catch (error) {
                console.error(error);
                if (btnText && spinner && submitButton) {
                    btnText.textContent = "Ошибка сети. Повторить?";
                    spinner.classList.add("hidden");
                    submitButton.style.pointerEvents = "auto";
                }
            }
        });
    }
});
