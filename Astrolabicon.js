const leftKeys = ['LUF', 'LUB', 'LMB', 'LDB', 'LDF', 'LMF']
const rightKeys = (rotation) => ['RUF', 'RUB', 'RMB', 'RDB', 'RDF', 'RMF']
        .map((str, idx, arr) => arr[(idx + rotation) % 6]);
const otherEnd = (key) => key.substring(0, 2) + ((key.charAt(2) === 'F')
        ? 'B' : 'F');
const getSectionLen = (key) =>
    (key.charAt(1) === 'M') ? 6 : 3;
const getSectionIdx = (key) =>
    ({ U: 0, M: 6, D: 18 }[key.charAt(1)] + ((key.charAt(0) === 'R') 
                                              ? getSectionLen(key) : 0));
const isReversed = (key) => (key.charAt(2) === 'B');

const pad = (str, len) => {
    if (str.length >= len) {
        return str;
    }
    const padded = ' '.repeat(Math.floor((len - str.length) / 2)) + str;
    return padded + ' '.repeat(len - padded.length);
};
const maxSectionLen = (6 * 3) + 5;
const fullKey = str => {
    const words = {
        B: 'Back',
        F: 'Front',
        L: 'Left',
        R: 'Right',
        U: 'Up',
        M: 'Mid',
        D: 'Down'
    };
    let full = '';
    for (let i = 0; i < str.length; i++) {
        full += (words[str.charAt(i)] || str.charAt(i));
    }
    let end = full.includes('Front') ? 'Front' : 'Back';

    return `[${end}]${full.replace(end,'')}[${end === 'Front' ? 'Back' : 'Front'}]`;
};


class Astrolabicon {
    constructor() {
        this._data = [];
        for(let i = 0; i < 6; i++) {
            this._data = this._data.concat(Array(6).fill(i));
        }
        this.rotation = 0;
    }

    rotate(n) {
        this.rotation -= n;
        if (this.rotation < 0) {
            this.rotation += 6;
        }
        this.rotation %= 6;
    }

    getLoops() {
        const r = rightKeys(this.rotation);
        const endMap = {};
        r.forEach((key, i) => {
            endMap[key] = leftKeys[i];
            endMap[leftKeys[i]] = key;
        });
        const loops = [];
        const keyUses = {};
        leftKeys.concat(r).forEach(k => keyUses[k] = 0);
        let sortedKeys = Object.keys(keyUses).sort((a, b) => {
            if (a.charAt(0) !== b.charAt(0)) {
                return (a.charAt(0) === 'L') ? -1 : 1;
            }
            if (a.charAt(2) !== b.charAt(2)) {
                return (a.charAt(2) === 'F') ? -1 : 1;
            }
            const tierValues = { U: 0, M: 1, D: 2 };
            return tierValues[a.charAt(1)] - tierValues[b.charAt(1)];
        });
        for (let initialKey of sortedKeys) {
            if (keyUses[initialKey] > 0) {
                continue;
            }
            const loop = [];
            for (let k = initialKey; keyUses[k] === 0; k = endMap[otherEnd(k)]) {
                loop.push(k);
                keyUses[k] = 1;
                keyUses[otherEnd(k)]= 1;
            }
            loops.push(loop);
        }
        return loops;
    }

    getSection(key) {
        const idx = getSectionIdx(key)
        const section = this._data.slice(idx, idx + getSectionLen(key));
        return isReversed(key) ? section.reverse() : section;
    }

    pushLoop(loop, isForward) {
        let buffer;
        let startIdx;
        for (let sectionKey of loop) {
            const isReversedSection = isReversed(sectionKey);
            const movingForward = isReversed(sectionKey) ? (! isForward) : isForward;
            const len = getSectionLen(sectionKey);
            const idx = getSectionIdx(sectionKey) + (movingForward ? 0 : len - 1);
            if (startIdx === undefined) {
                startIdx = idx;
            }
            const breakCondition = movingForward ? 
                (i => i < idx + len) : (i => i > idx - len);
            for (let i = idx; breakCondition(i); (movingForward ? i++ : i--)){
                const tmp = this._data[i];
                this._data[i] = buffer;
                buffer = tmp;
            }
        }
        this._data[startIdx] = buffer;
    }

    print() {
        const loops = this.getLoops();
        for (let loop of loops) {
            const sections = loop.map(key => pad(this.getSection(key).map(k => `[${k}]`)
                        .join(','), maxSectionLen));
            const headers = loop.map((key, i) => {
                const lastChar = key.charAt(2);
                const str = fullKey(key) + ' <->';
                return pad(str, sections[i].length);
            });
            console.log(headers.join(' : '));
            console.log(sections.join(' : '));
            console.log('\n');
        }
    };
};
module.exports = Astrolabicon;
