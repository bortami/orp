const portalId = '242871179';

const FORM_CONFIG = {
    contact: {
        formId: 'b018d2d4-5dbb-4f42-b025-5a652a0e5ce7',
        formSelector: '#hubspot-form',
        containerSelector: '#form-container',
        responseSelector: '#form-response',
        getFields: (formData) => [
            { name: 'firstname', value: formData.get('firstname') || '' },
            { name: 'lastname', value: formData.get('lastname') || '' },
            { name: 'email', value: formData.get('email') || '' },
            { name: 'mobilephone', value: formData.get('mobilephone') || '' },
            { name: 'message', value: formData.get('message') || '' }
        ],
        successMsg: 'Thank you! Your message was sent.',
        errorMsg: 'Submission failed. Please try again later.'
    },
    newsletter: {
        formId: '80977c67-2ba3-4d02-bd4b-a42382933a46',
        formSelector: '#newsletter-form',
        containerSelector: '#newsletter-container',
        responseSelector: '#newsletter-response',
        getFields: (formData) => [
            { name: 'email', value: formData.get('email') || '' }
        ],
        successMsg: 'Thanks for subscribing!',
        errorMsg: 'Oops! Something went wrong. Please try again.'
    }
};

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

async function handleFormSubmit(config, event) {
    event.preventDefault();

    const form = document.querySelector(config.formSelector);
    const formData = new FormData(form);
    const fields = config.getFields(formData);

    const hutk = getCookie('hubspotutk');
    const context = {
        pageUri: window.location.href,
        pageName: document.title
    };
    if (hutk) context.hutk = hutk;

    const data = { fields, context };
    const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${config.formId}`;

    const container = document.querySelector(config.containerSelector);
    const responseDiv = document.querySelector(config.responseSelector);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        container.style.display = 'none';
        if (response.ok) {
            responseDiv.innerHTML = `<p class="success-message">${config.successMsg}</p>`;
        } else {
            responseDiv.innerHTML = `<p class="error-message">${config.errorMsg}</p>`;
        }
    } catch (err) {
        console.error('Network error:', err);
        container.style.display = 'none';
        responseDiv.innerHTML = `<p class="error-message">A connection error occurred. Try again later.</p>`;
    }
}

// Attach event listeners if forms exist
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector(FORM_CONFIG.contact.formSelector);
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit.bind(null, FORM_CONFIG.contact));
    }
    const newsletterForm = document.querySelector(FORM_CONFIG.newsletter.formSelector);
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleFormSubmit.bind(null, FORM_CONFIG.newsletter));
    }
});