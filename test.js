// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2024-05-13
// @description  try to take over the world!
// @author       You
// @match        https://secure.icicidirect.com/trading/equity/click2gain
// @icon         https://www.google.com/s2/favicons?sz=64&domain=icicidirect.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const keywords = ['Commodity', 'Future', 'Margin'];
    const checkInterval = 13000;
    let keywordTextMap = JSON.parse(localStorage.getItem('keywordTextMap')) || {}; // Stores the last text for each keyword
    let logs = JSON.parse(localStorage.getItem('pageLogs')) || [];

    function requestNotificationPermission() {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                } else {
                    console.log('Notification permission denied.');
                }
            });
        }
    }

    function showNotification(keyword, text) {
        if (Notification.permission === 'granted') {
            new Notification('Keyword Alert!', {
                body: `Keyword "${keyword}" found in text: "${text}"`,
                icon: 'https://www.google.com/s2/favicons?sz=64&domain=icicidirect.com'
            });
        }
    }

    function logEvent(message) {
        const date = new Date();
        logs.push(`${date.toISOString()} - ${message}`);
        localStorage.setItem('pageLogs', JSON.stringify(logs));
    }

    function checkForKeywords() {
        const targetedElement = document.querySelector('td.text-uppercase.expand-title');
        let newText = targetedElement ? targetedElement.textContent.trim() : '';
        let foundAnyKeyword = false;

        keywords.forEach(keyword => {
            if (newText.includes(keyword)) {
                if (!keywordTextMap[keyword] || (keywordTextMap[keyword] && keywordTextMap[keyword] !== newText)) {
                    logEvent(`Keyword found: ${keyword} in text: ${newText}`);
                    showNotification(keyword, newText);
                    keywordTextMap[keyword] = newText;
                    localStorage.setItem('keywordTextMap', JSON.stringify(keywordTextMap));
                    foundAnyKeyword = true;
                }
            }
        });

        return foundAnyKeyword;
    }

    document.addEventListener('click', requestNotificationPermission);

    setInterval(() => {
        if (!checkForKeywords()) {
            logEvent("Refreshing page...");
            window.location.reload();
        }
    }, checkInterval);

})();
