$(function () {
    const $body = $("body");
    const $messages = $("#messages");
    const $input = $("#input");
    const $typing = $("#typingIndicator");
    const $welcomePanel = $("#welcomePanel");
    const $historyList = $("#historyList");

    const simulatedReplies = [
        "Signal received. I would start by breaking that into smaller steps and solving the riskiest part first.",
        "That looks workable. If you want, I can help turn it into cleaner code, a better plan, or a sharper explanation.",
        "I can help with that. Think of it like a terminal assistant that reads intent, returns structure, and keeps the flow moving.",
        "Good prompt. I would approach it with a quick outline, one strong example, and a clean final version.",
        "Here is the fast path: define the goal, trim noise, build the core interaction, then polish the visual details."
    ];

    function escapeHtml(text) {
        return $("<div>").text(text).html();
    }

    function currentTime() {
        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function autoResize() {
        $input.css("height", "auto");
        $input.css("height", `${Math.min($input[0].scrollHeight, 180)}px`);
    }

    function hideWelcome() {
        if ($welcomePanel.is(":visible")) {
            $welcomePanel.slideUp(250);
        }
    }

    function scrollToBottom() {
        $messages.stop().animate(
            { scrollTop: $messages[0].scrollHeight },
            250
        );
    }

    function setTyping(visible) {
        $typing.toggleClass("visible", visible);
        if (visible) {
            scrollToBottom();
        }
    }

    function addHistoryItem(label) {
        const safeLabel = escapeHtml(label);
        $historyList.find(".history-item").removeClass("active");
        const itemMarkup = `
            <button class="history-item active" type="button">
                <i class="fa-regular fa-clock"></i>
                <span>${safeLabel}</span>
            </button>
        `;
        $historyList.prepend(itemMarkup);
        $historyList.children().slice(5).remove();
    }

    function createMessageMarkup(text, sender) {
        const safeText = escapeHtml(text);
        const senderLabel = sender === "user" ? "You" : "Cipher";
        const avatarIcon = sender === "user"
            ? "fa-solid fa-user-secret"
            : "fa-solid fa-robot";
        const rowClass = sender === "user" ? "user-row" : "ai-row";
        const avatarClass = sender === "user" ? "user-avatar" : "ai-avatar";

        return `
            <article class="message-row ${rowClass}">
                ${sender === "ai" ? `<div class="avatar ${avatarClass}"><i class="${avatarIcon}"></i></div>` : ""}
                <div class="bubble-wrap">
                    <div class="message-meta">
                        <span>${senderLabel}</span>
                        <span>${currentTime()}</span>
                    </div>
                    <div class="message-bubble">${safeText}</div>
                </div>
                ${sender === "user" ? `<div class="avatar ${avatarClass}"><i class="${avatarIcon}"></i></div>` : ""}
            </article>
        `;
    }

    function addMessage(text, sender) {
        $messages.append(createMessageMarkup(text, sender));
        scrollToBottom();
    }

    function buildReply(prompt) {
        const lowerPrompt = prompt.toLowerCase();

        if (lowerPrompt.includes("code") || lowerPrompt.includes("debug") || lowerPrompt.includes("javascript")) {
            return "Code channel open. Start with the error message, expected behavior, and the smallest broken snippet. I can help isolate the issue from there.";
        }

        if (lowerPrompt.includes("study") || lowerPrompt.includes("plan")) {
            return "Planning mode enabled. I would split this into daily targets, one revision block, and one quick self-test at the end of each cycle.";
        }

        if (lowerPrompt.includes("idea") || lowerPrompt.includes("startup") || lowerPrompt.includes("brainstorm")) {
            return "Creative mode online. Let's combine one real user problem, one clear niche, and one feature that feels surprisingly useful on day one.";
        }

        return simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
    }

    function sendMessage(customText) {
        const text = (customText || $input.val()).trim();
        if (!text) {
            return;
        }

        hideWelcome();
        addMessage(text, "user");
        addHistoryItem(text.length > 26 ? `${text.slice(0, 26)}...` : text);
        $input.val("");
        autoResize();
        setTyping(true);

        setTimeout(() => {
            setTyping(false);
            addMessage(buildReply(text), "ai");
        }, 1100);
    }

    $("#sendBtn").on("click", function () {
        sendMessage();
    });

    $input.on("input", autoResize);

    $input.on("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    $(".suggestion-card").on("click", function () {
        sendMessage($(this).data("prompt"));
    });

    $(".prompt-chip").on("click", function () {
        $input.val($(this).text());
        autoResize();
        $input.trigger("focus");
    });

    $("#newChatBtn").on("click", function () {
        $messages.empty();
        $input.val("");
        autoResize();
        setTyping(false);
        $welcomePanel.slideDown(250);
        $historyList.find(".history-item").removeClass("active").first().addClass("active");
    });

    $("#themeToggle").on("click", function () {
        $body.toggleClass("light-mode");
        const iconClass = $body.hasClass("light-mode") ? "fa-solid fa-sun" : "fa-solid fa-moon";
        $(this).find("i").attr("class", iconClass);
    });

    $("#menuToggle").on("click", function () {
        $body.toggleClass("sidebar-open");
    });

    $(document).on("click", ".history-item", function () {
        $(".history-item").removeClass("active");
        $(this).addClass("active");
        if (window.innerWidth <= 860) {
            $body.removeClass("sidebar-open");
        }
    });

    $(window).on("resize", function () {
        if (window.innerWidth > 860) {
            $body.removeClass("sidebar-open");
        }
        autoResize();
    });

    autoResize();
    addMessage("Connection established. Ask me for code help, ideas, summaries, or a step-by-step plan.", "ai");
});
