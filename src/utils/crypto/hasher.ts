import * as circomlib from 'circomlib';
import bigInt from 'big-integer';
const mimcsponge = circomlib.mimcsponge

const MimcSpongeHash = (left: string, right: string): string => {
    return mimcsponge.multiHash([bigInt(left), bigInt(right)]).toString()
}

export default MimcSpongeHash