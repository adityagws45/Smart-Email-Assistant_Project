console.log("Email Writer Extension - Content Script Loaded");

/* ================= BUTTON ================= */
function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

/* ================= EMAIL CONTENT ================= */
function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];

    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }

    return '';
}

/* ================= TOOLBAR ================= */
function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];

    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }

    return null;
}

/* ================= COMPOSE BOX (FINAL FIX) ================= */
function getComposeBox() {

    // ✅ 1. BEST METHOD → active focused element
    const active = document.activeElement;
    if (active && active.getAttribute("contenteditable") === "true") {
        return active;
    }

    // ✅ 2. Gmail specific compose box
    const compose = document.querySelector(
        'div[aria-label="Message Body"][role="textbox"]'
    );
    if (compose) return compose;

    // ✅ 3. Fallback → last visible editable box
    const all = document.querySelectorAll('[contenteditable="true"]');
    for (const el of all) {
        if (el.offsetHeight > 100) {
            return el;
        }
    }

    return null;
}

/* ================= API CALL ================= */
async function callAPI(emailContent) {
    const url = 'https://smart-email-assistant-project.onrender.com/api/email/generate';

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

/* ================= INJECT BUTTON ================= */
function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, creating AI button");

    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        button.innerHTML = 'Generating...';
        button.disabled = true;

        try {
            const emailContent = getEmailContent();

            if (!emailContent) {
                alert("No email content found!");
                return;
            }

            const reply = await callAPI(emailContent);

            // ⏳ IMPORTANT: Gmail needs time
            await new Promise(res => setTimeout(res, 2500));

            const composeBox = getComposeBox();

            console.log("ACTIVE ELEMENT:", document.activeElement);
            console.log("Compose box:", composeBox);

            if (!composeBox) {
                throw new Error("Compose box not found");
            }

            composeBox.focus();
            document.execCommand('insertText', false, reply);

        } catch (error) {
            console.error("FINAL ERROR:", error);
            alert(error.message || "Something went wrong");

        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

/* ================= OBSERVER ================= */
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);

        const hasCompose = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (
                node.matches('.aDh, .btC, [role="dialog"]') ||
                node.querySelector('.aDh, .btC, [role="dialog"]')
            )
        );

        if (hasCompose) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 1000);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});