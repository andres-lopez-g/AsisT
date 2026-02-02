import React from 'react';

const LanguageSwitcher = () => {
    const switchLanguage = (lang) => {
        // Set cookie for Google Translate
        document.cookie = `googtrans=/en/${lang}; path=/`;
        document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;

        // Attempt to change via dropdown if it exists, otherwise force reload
        const trySwitch = (attempts) => {
            const select = document.querySelector('.goog-te-combo');
            if (select) {
                select.value = lang;
                select.dispatchEvent(new Event('change'));
            } else {
                // If widget not found (e.g. hidden or error), reload to apply cookie
                window.location.reload();
            }
        };

        // Slight delay to allow UI feedback if needed, but mostly immediate
        setTimeout(() => trySwitch(1), 100);
    };

    return (
        <div className="flex border border-border/50 divide-x divide-border/50">
            <button
                onClick={() => switchLanguage('en')}
                className="flex-1 mono text-[9px] font-bold py-1.5 hover:bg-muted transition-colors uppercase px-2"
            >
                EN
            </button>
            <button
                onClick={() => switchLanguage('es')}
                className="flex-1 mono text-[9px] font-bold py-1.5 hover:bg-muted transition-colors uppercase px-2"
            >
                ES
            </button>
        </div>
    );
};

export default LanguageSwitcher;
