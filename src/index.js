"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const R = require("request");
const cheerio = require("cheerio");
const fs_1 = require("fs");
const page = Array.from({ length: 4 }, (v, k) => ("http://www.ximalaya.com/31873895/album/3623979?order=desc&page=" + (1 + k)));
function getIDByURL(URL) {
    return new Promise((resolve, rej) => {
        R(URL, (err, res, body) => {
            const $ = cheerio.load(body);
            let liDom = $('.album_soundlist li');
            const partIds = getIdsFromDom(liDom);
            resolve(partIds);
        });
    });
}
function getIds() {
    return __awaiter(this, void 0, void 0, function* () {
        const taskQ = page.map((v, k) => {
            return getIDByURL(v);
        });
        return yield Promise.all(taskQ);
    });
}
function getIdsFromDom(dom) {
    return Array.from(dom).map((v, k) => {
        return v.attribs['sound_id'];
    });
}
function four2one(a, b, c, d) {
    return a.concat(b, c, d);
}
function download(id, err, callback) {
    const uri = `http://www.ximalaya.com/tracks/${id}.json`;
    R.get(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
        const obj = JSON.parse(body);
        const medieURL = obj.play_path;
        const title = obj.title;
        console.log("正在下载 《《" + title + "》》");
    });
}
function saveMp3File(URL, title) {
    return __awaiter(this, void 0, void 0, function* () {
        R.get(URL, {
            headers: {
                "Content-Type": "application/octet-stream"
            }
        }).pipe(fs_1.createWriteStream('./audio/' + title + '.mp3').on('error', console.error)).on('error', console.error).on('close', () => console.log(title + " 下载完成！"));
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        let [a, b, c, d] = yield getIds();
        const ids = four2one(a, b, c, d);
        for (let index in ids) {
            download(ids[index], (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
            }, (yes) => {
                console.log(index + "下载完成");
            });
        }
    });
}
start();
//# sourceMappingURL=index.js.map