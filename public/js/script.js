const API_URL = `${window.location.origin}/api/imagequote` 

window.addEventListener("load", () => {
    const quoteTextEl = document.querySelector("#quoteText");
    const form = document.querySelector("#apiForm");
    const previewImg = document.querySelector("#previewImg");
    
    quoteTextEl.addEventListener("input", () => {
        form.submitBtn.disabled = quoteTextEl.value.length === 0;
    });
    
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        let params = {
            quoteText: form.quoteText.value,
            authorName: form.authorName.value,
            styleName: form.style.value
        };
        fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(params),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            }
        }).finally(() => console.log('Done'))
        .then((response) => response.blob())
        .then((blob) => {
            previewImg.src = URL.createObjectURL(blob);
        }).catch(e => console.log);
    });
});
