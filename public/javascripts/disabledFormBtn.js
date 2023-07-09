(() => {
    const pw = document.querySelector('.form-password');
    const confirmPw = document.querySelector('.form-confirm');
    const submit = document.querySelector('.form-submit');

    const pwGroup = document.querySelectorAll('.password-group');
    for (let pwEle of pwGroup) {
        let alert = document.createElement('div');
        alert.classList.add('password-info');
        pwEle.insertAdjacentElement('afterend', alert);
    }
    let count = 0, pwInfo = document.querySelectorAll('.password-info');

    const changeHandler = () => {
        if ((pw.value && confirmPw.value) || count) {
            if (confirmPw.value !== pw.value) {
                submit.disabled = true;
                for (let info of pwInfo) {
                    info.innerHTML = "<p class='text-danger'>Password doesn't match!</p>";
                }
                pw.style.borderColor = 'red';
                confirmPw.style.borderColor = 'red';
                count++;
            } else {
                for (let info of pwInfo) {
                    info.innerHTML = "<p class='text-success'>Password match!!!</p>";
                }
                pw.style.borderColor = 'green';
                confirmPw.style.borderColor = 'green';
                submit.disabled = false;
            }
        }
    }

    pw.addEventListener('input', changeHandler);
    confirmPw.addEventListener('input', changeHandler);

})()