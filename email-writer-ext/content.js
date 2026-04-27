
// console.log("Email Writer Extension - Loaded");

// const API_URL = "https://smart-email-assistant-project.onrender.com/api/email/generate";

// let isProcessing = false;

// /* ================= CREATE BUTTON ================= */
// function createAIButton() {
//     const button = document.createElement('button');

//     button.innerText = "AI Reply";
//     button.className = "ai-reply-button";

//     button.style.marginRight = "8px";
//     button.style.height = "36px";
//     button.style.padding = "0 16px";
//     button.style.backgroundColor = "#0b57d0";
//     button.style.color = "white";
//     button.style.border = "none";
//     button.style.borderRadius = "18px";
//     button.style.cursor = "pointer";
//     button.style.display = "inline-flex";
//     button.style.alignItems = "center";

//     return button;
// }
// /* ================= GET EMAIL CONTENT ================= */

// function getEmailContent() {
//     const selectors = ['.a3s.aiL', '.h7', '.gmail_quote'];

//     for (let sel of selectors) {
//         const el = document.querySelector(sel);
//         if (el) return el.innerText.trim();
//     }

//     return "";
// }

// /* ================= FIND COMPOSE BOX ================= */

// function findComposeBox() {
//     return document.querySelector('[role="textbox"][contenteditable="true"]');
// }

// /* ================= CALL API ================= */

// async function callAPI(emailContent) {
//     const response = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             emailContent,
//             tone: "professional"
//         })
//     });

//     if (!response.ok) {
//         throw new Error("API failed: " + response.status);
//     }

//     return await response.text();
// }

// /* ================= INSERT TEXT ================= */

// function insertText(text) {
//     const box = findComposeBox();

//     if (!box) {
//         alert("Compose box not found");
//         return;
//     }

//     box.focus();
//     document.execCommand("insertText", false, text);
// }

// /* ================= INJECT BUTTON ================= */
// function injectButton() {

//     console.log("Trying to inject button...");

//     // prevent duplicate
//     if (document.querySelector(".ai-reply-button")) return;

//     // find Send button (reliable)
//     const sendButton = document.querySelector('[data-tooltip*="Send"]');

//     if (!sendButton) {
//         console.log("Send button not found");
//         return;
//     }

//     console.log("Send button found");

//     const button = createAIButton();

//     button.onclick = async () => {

//         if (isProcessing) return;
//         isProcessing = true;

//         button.innerText = "Generating...";

//         try {
//             const emailContent = getEmailContent();

//             if (!emailContent) {
//                 alert("No email content found");
//                 return;
//             }

//             const reply = await callAPI(emailContent);
//             insertText(reply);

//         } catch (err) {
//             console.error(err);
//             alert("Failed to generate reply");
//         } finally {
//             button.innerText = "AI Reply";
//             isProcessing = false;
//         }
//     };

//     // 🔥 THIS LINE FIXES ALIGNMENT
//     sendButton.parentElement.insertBefore(button, sendButton);
// }

// /* ================= OBSERVER ================= */

// const observer = new MutationObserver(() => {
//     setTimeout(injectButton, 800);
// });

// observer.observe(document.body, {
//     childList: true,
//     subtree: true
// });






































console.log("Email Writer Extension - Loaded");

const API_URL = "https://smart-email-assistant-project.onrender.com/api/email/generate";

let isProcessing = false;

/* ================= CREATE BUTTON ================= */
function createAIButton() {
    const button = document.createElement('button');

    button.innerText = "AI Reply";
    button.className = "ai-reply-button";

    button.style.marginRight = "8px";
    button.style.height = "36px";
    button.style.padding = "0 16px";
    button.style.backgroundColor = "#0b57d0";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "18px";
    button.style.cursor = "pointer";
    button.style.display = "inline-flex";
    button.style.alignItems = "center";

    return button;
}

/* ================= GET EMAIL CONTENT ================= */
function getEmailContent() {
    const selectors = ['.a3s.aiL', '.h7', '.gmail_quote'];

    for (let sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.innerText.trim()) {
            return el.innerText.trim();
        }
    }

    return "";
}

/* ================= FIND COMPOSE BOX ================= */
function findComposeBox(container) {
    return container.querySelector('[role="textbox"][contenteditable="true"]');
}

/* ================= CALL API (SAFE) ================= */
async function callAPI(emailContent) {
    try {
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

    } catch (error) {
        console.error("API ERROR:", error);
        throw error;
    }
}

/* ================= INSERT TEXT ================= */
function insertText(container, text) {
    const box = findComposeBox(container);

    if (!box) {
        alert("Compose box not found");
        return;
    }

    box.focus();
    document.execCommand("insertText", false, text);
}

/* ================= INJECT BUTTON ================= */
function injectButton() {

    const composeBoxes = document.querySelectorAll('[role="textbox"][contenteditable="true"]');

    composeBoxes.forEach((composeBox) => {

        const container =
            composeBox.closest('[role="dialog"]') ||
            composeBox.closest('.aDh') ||
            composeBox.closest('.nH');

        if (!container) return;

        // ✅ Prevent duplicate per compose
        if (container.querySelector(".ai-reply-button")) return;

        const sendButton = container.querySelector('[data-tooltip*="Send"]');

        if (!sendButton) return;

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

                insertText(container, reply);

            } catch (err) {
                console.error(err);
                alert("Failed to generate reply");
            } finally {
                button.innerText = "AI Reply";
                isProcessing = false;
            }
        };

        // ✅ perfect placement
        sendButton.parentElement.insertBefore(button, sendButton);
    });
}

/* ================= OBSERVER ================= */
let timeout;

const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(injectButton, 600);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});