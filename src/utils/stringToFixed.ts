export const stringToFixed = (str: string, fixed: number) => {
    const match = str.match(`^-?\\d+(?:.\\d{0,${fixed || -1}})?`);

    if (!match) {
        return '';
    }

    return match[0];
};
export const addDecimal = (value:string, decimal:number) => {
    const pointer_pos = value.indexOf('.');
    if(pointer_pos >= 0)
        decimal -= ( value.length - pointer_pos - 1 );
    value = value.replace('.', '');
    while(decimal > 0) { 
        value += '0';
        decimal --;
    }
    return value;
}

export const removeDecimal = (value:string, decimal:number) => {
    if(value.length <= decimal){
        let returnVal = "";
        while(decimal > value.length) {
            returnVal += '0';
            decimal --;
        }
        return "0." + returnVal + value;
    }
    else {
        const pointNum = value.substr(-decimal);
        const realNum = value.substr(0, value.length-decimal);
        return realNum + '.' + pointNum;
    }
}