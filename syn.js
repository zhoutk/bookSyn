let Client = require('ssh2-sftp-client');
let rq = require('request-promise')

const serverConf = {
    host: '47.93.253.17',    
    port: '22',
    username: 'root',
    password: 'Ilove001'
}

getNewBooks()

function upRequestBooks(id) {
    console.log(`------- id -------${id}`)
    var options = {
        method: 'PUT',
        uri: 'http://47.93.253.17:1221/rs/book',
        body: {
            id: id,
            status: 2
        },
        json: true // Automatically stringifies the body to JSON
    };

    rq(options)
        .then(function (data) {
            console.log(data)
        })
        .catch(function (err) {
            console.log(err.message)
        });
}

function getNewBooks() {
    rq('http://47.93.253.17:1221/rs/book?status=1')
        .then(function (data) {
            data = JSON.parse(data)
            for(let book of data.data) {
                pathStr = `/home/zhoutk/${book.path}`
                fileStr = `/home/zhoutk/${book.path}/${book.book_name}.${book.ext}`
                put(pathStr, fileStr, book.id)
            }
            console.log(data)
        })
        .catch(function (err) {
            console.log(err.message)
        });
}

function put(pathStr, fileStr,id){
    let sftp = new Client();

    sftp.connect(serverConf)
        .then(() => {
            return sftp.exists(pathStr);
        })
        .then(data => {
            console.log(`dir exist? - ${data}`);          // will be false or d, -, l (dir, file or link)
            if (data === false) {
                let client = new Client();
                client.connect(serverConf)
                    .then(() => {
                        return client.mkdir(pathStr, true);
                    })
                    .then(() => {
                        uploadFile(fileStr, fileStr, id)
                        return client.end();
                    })
                    .catch(err => {
                        console.error(err.message);
                    });
            } else {
                uploadFile(fileStr, fileStr, id)
            }
        })
        .then(() => {
            sftp.end();
        })
        .catch(err => {
            console.error(err.message);
        });

        function uploadFile(localPath,romotePath,id) {
            let sftp = new Client();
            sftp.connect(serverConf).then(() => {
                return sftp.fastPut(localPath,romotePath);
            }).then(() =>{
                console.log(localPath + " --- 上传完成");
                sftp.end()
                upRequestBooks(id)
            }).catch((err) => {
                console.log(err.message, 'catch error');
            });
        }

    
}

// function put1(localPath, romotePath) {
//     let sftp = new Client();
//     sftp.connect({
//         host: '192.168.1.6',    //47.93.253.17
//         port: '6',
//         username: 'root',
//         password: 'a1b2c3'
//     }).then(() => {
//         return sftp.list('/home/zhoutk');
//     }).then(data => {
//         console.log(data, 'the data info');
//     }).catch(err => {
//         console.log(err.message, 'catch error');
//     });
// }



//put('c:\\temp\\0101水浒全传.txt', '/home/zhoutk/books/0101水浒全传.txt')

console.log('sss')