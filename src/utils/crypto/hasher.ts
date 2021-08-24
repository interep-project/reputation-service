import bigInt from 'big-integer';
const circomlib = require('circomlib'); //eslint-disable-line
const mimcsponge = circomlib.mimcsponge

const MimcSpongeHash = (left: string, right: string): string => {
    return mimcsponge.multiHash([bigInt(left), bigInt(right)]).toString()
}

export default MimcSpongeHash