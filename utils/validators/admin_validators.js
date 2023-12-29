const alphanumValid = (name) => {
    nameRegex = /^(?! )[A-Za-z0-9 ]*(?<! )$/;
    return nameRegex.test(name);
}

const onlyNumbers = (str) => {
    const numbersOnlyRegex = /^[1-9][0-9]*$/;
    return str.length > 0 && numbersOnlyRegex.test(str);
}


module.exports={
    alphanumValid,
    onlyNumbers
}

