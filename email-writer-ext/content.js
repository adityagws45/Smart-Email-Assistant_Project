console.log("Email Writer Extension - Loaded");

const API_URL = "https://smart-email-assistant-project.onrender.com/api/email/generate";

let isProcessing = false;

/* ================= CREATE BUTTON ================= */

function createAIButton() {
    const button = document.createElement('button');
    button.innerText = "AI Reply";
    button.className = "ai-reply-button";

    button.style.marginRight = "8px";
    button.style.padding = "6px 12px";
    button.style.backgroundColor = "#0b57d0";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";

    return button;
}

/* ================= GET EMAIL CONTENT ================= */

function getEmailContent() {
    const selectors = ['.a3s.aiL', '.h7', '.gmail_quote'];

    for (let sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el.innerText.trim();
    }

    return "";
}

/* ================= FIND COMPOSE BOX ================= */

function findComposeBox() {
    return document.querySelector('[role="textbox"][contenteditable="true"]');
}

/* ================= CALL API ================= */

async function callAPI(emailContent) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            emailContent,
            tone: "professional"
        })
    });

    if (!response.ok) {
        throw new Error("API failed: " + response.status);
    }

    return await response.text();
}

/* ================= INSERT TEXT ================= */

function insertText(text) {
    const box = findComposeBox();

    if (!box) {
        alert("Compose box not found");
        return;
    }

    box.focus();
    document.execCommand("insertText", false, text);
}

/* ================= INJECT BUTTON ================= */

function injectButton() {

    console.log("Trying to inject button...");

    // avoid duplicate
    if (document.querySelector(".ai-reply-button")) return;

    const composeBox = findComposeBox();

    if (!composeBox) {
        console.log("Compose box not found");
        return;
    }

    // go upward to find container with buttons
    let parent = composeBox;

    for (let i = 0; i < 8; i++) {
        parent = parent.parentElement;
        if (!parent) break;

        if (parent.querySelector('button')) {
            console.log("Found button container");
            break;
        }
    }

    if (!parent) {
        console.log("No suitable container found");
        return;
    }

    console.log("Injecting AI button");

    const button = createAIButton();

    button.onclick = async () => {

        if (isProcessing) return;
        isProcessing = true;

        button.innerText = "Generating...";

        try {
            const emailContent = getEmailContent();

            if (!emailContent) {
                alert("No email content found");
                return;
            }

            const reply = await callAPI(emailContent);

            insertText(reply);

        } catch (err) {
            console.error(err);
            alert("Failed to generate reply");
        } finally {
            button.innerText = "AI Reply";
            isProcessing = false;
        }
    };

    parent.appendChild(button);
}

/* ================= OBSERVER ================= */

const observer = new MutationObserver(() => {
    setTimeout(injectButton, 800);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});