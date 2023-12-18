const bnameValid=(fullname)=>{
    nameRegex=/^[A-Za-z]+$/
    return fullname.length >1 && nameRegex.test(fullname)
}

const adphoneValid=(phone)=>{
    phoneRegex=/^[0-9]{10}$/
    return phoneRegex.test(phone)
}

const pincodeValid=(phone)=>{
    pincodeRegex=/^[0-9]{6}$/
    return pincodeRegex.test(phone)
}

module.exports={
    bnameValid,
    adphoneValid,
    pincodeValid
}
