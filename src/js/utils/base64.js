/*
MIT License
Copyright (c) 2020 Egor Nepomnyaschih
Copyright (c) 2022 Matias Affolter (rewrote it in low level JS)
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var base64abc = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"
];

var base64codes = Uint8ClampedArray.of(
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255,
    255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255,
    255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
);

function getBase64CodesBuffer(str) {
    "use strict";
    return (
        base64codes[str[0]] << 18 |
        base64codes[str[1]] << 12 |
        base64codes[str[2]] << 6 |
        base64codes[str[3]] << 0
    ) >>> 0;
}

function getBase64abcA(bytes) {
    "use strict";
    return ""
        .concat(base64abc[bytes[0] >> 2])
        .concat(base64abc[((bytes[0] & 0x03) << 4) | (bytes[1] >> 4)])
        .concat(base64abc[((bytes[1] & 0x0F) << 2) | (bytes[2] >> 6)])
        .concat(base64abc[bytes[2] & 0x3F]);
}

export function bytesToBase64(bytes) {
    "use strict";
    var result = '', i = 0, j = 4;
    var l = bytes.length | 0;

    for (;(i|0) < (l|0); i = (i+3|0)>>>0, j = (j+3|0)>>>0) {
        result = result.concat(getBase64abcA(bytes.subarray(i, j)));
    }

    i = i+2|0;
    if ((i|0) == (l + 1 | 0)) { // 1 octet yet to write
        result += base64abc[bytes[i - 2 | 0] >> 2];
        result += base64abc[(bytes[i - 2 | 0] & 0x03) << 4];
        result += "==";
    }
    if ((i|0) == (l|0)) { // 2 octets yet to write
        result += base64abc[bytes[i - 2 | 0] >> 2];
        result += base64abc[((bytes[i - 2 | 0] & 0x03) << 4) | (bytes[i - 1 | 0] >> 4)];
        result += base64abc[(bytes[i - 1 | 0] & 0x0F) << 2];
        result += "=";
    }
    return result;
}

function getAggregatedBuffer(buffer) {
    return Uint8ClampedArray.of((buffer >> 16) & 0xFF, (buffer >> 8) & 0xFF, (buffer >> 0) & 0xFF);
}

export function base64ToBytes(str) {
    "use strict";
    var missingOctets = str.endsWith("==") ? 2 : str.endsWith("=") ? 1 : 0,
        n = str.length | 0,
        result = new Uint8ClampedArray(3 * (n / 4)),
        i = 0,
        j = 0;
    str = Uint8ClampedArray.from(str.split("").map(function(x){return x.charCodeAt(0)}));

    for (i = 0, j = 0; (i|0) < (n|0); i = (i+4 | 0) >>> 0, j = (j+3 | 0) >>> 0) {
        result.set(getAggregatedBuffer(getBase64CodesBuffer(str.subarray(i, i+5|0))), j);

    }
    if((missingOctets|0) == (0|0)){
        return result;
    }else {

        return result.slice(0, result.length - missingOctets);
    }
}

export function base64encode(str, encoder = new TextEncoder()) {
    return bytesToBase64(encoder.encode(str));
}

export function base64decode(str, decoder = new TextDecoder()) {
    return decoder.decode(base64ToBytes(str));
}