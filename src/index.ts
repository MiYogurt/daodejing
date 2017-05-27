import * as R from 'request';
import * as cheerio from 'cheerio';
import { createWriteStream } from 'fs';

const page = Array.from({length: 4}, (v, k) => ("http://www.ximalaya.com/31873895/album/3623979?order=desc&page=" + (1 + k)) );


function getIDByURL(URL: string): Promise<string[]>{
    return new Promise((resolve, rej) => {
        R(URL,(err, res, body) => {
            const $ = cheerio.load(body);
            let liDom = $('.album_soundlist li');
            const partIds = getIdsFromDom(liDom);
            resolve(partIds);
        })
    })
}


async function getIds(){
    const taskQ = page.map((v, k) => {
        return getIDByURL(v);
    });

    return await Promise.all(taskQ);
}


function getIdsFromDom(dom: Cheerio){
    return Array.from(dom).map((v, k) => {
        return v.attribs['sound_id'];
    })
}


function four2one(a: Array<any>,b,c,d){
    return a.concat(b,c,d);
}


function download(id, err ,callback){
    const uri = `http://www.ximalaya.com/tracks/${id}.json`;
     R.get(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
        const obj = JSON.parse(body);
        const medieURL: string = obj.play_path;
        const title : string = obj.title;
        console.log("正在下载 《《" + title + "》》" );
        saveMp3File(medieURL, title);
    });
}


function saveMp3File(URL, title){
        R.get(URL, {
            headers: {
                "Content-Type": "application/octet-stream"
            }
        }).pipe(createWriteStream('./audio/' + title + '.mp3').on('error', console.error)).on('error', console.error).on('close', () => console.log(title + " 下载完成！"));
}



async function start(){
    let [a, b, c, d] = await getIds();
    const ids = four2one(a,b,c,d);

    for(let index in ids){
        download(ids[index], (err) => {
            if(err) {
                console.log(err);
                return;
            }
        }, (yes) => {
            console.log(index + "下载完成" )
        });
    }

    
}

start();