(() => {
    const imagesChosen = document.querySelector('.imagesChosen');
    const images = [];

    imagesChosen.addEventListener('change', (evt) => {
        const newImages = document.querySelectorAll('.newImages');
        if (newImages) {
            newImages.forEach(img => { img.remove() });
        }
        for (let i = 0; i < imagesChosen.files.length; i++) {
            var url = URL.createObjectURL(evt.target.files[i]);
            const imagesDisplay = document.querySelector('.imagesDisplay');
            imagesDisplay.hidden = false;
            imagesDisplay.innerHTML += `<img class="col-3 img-thumbnail newImages" src="${url}" title="${evt.target.files[i].name}" alt="${evt.target.files[i].name}">`;
        }
    })
})()