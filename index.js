const EventEmitter = require('events')

var express = require('express')
var app = express()
var port = process.env.port || 3000
var id = 0
const messageEvent = new EventEmitter()

app.use(express.static('EventSource/public'))

app.get('/message', function (req, res) {
    const message = req.query.message
    messageEvent.emit('onAnswer', message)
    res.send('ok')
})

app.get('/close', function (req, res) {
    messageEvent.emit('onClose')
    res.send('ok')
})

app.get('/sse', function (req, res) {
    res.writeHead(200, {
        "Content-Type": "text/event-stream", //设置头信息
        "Access-Control-Allow-Origin": "*"
    });
    function onAnswer(message) {
        console.log(message)
        var result = {}
        var number = parseInt(Math.random() * 10)
        result.message = message
        result.answer = number + 'answer'
        result.result = parseInt(number / 2)
        res.write(
            "id:" + id++ + "\n" +
            "event: message" + "\n" +           // 事件名 type message，前端需要监听message事件才能获取该数据
            "data:" + JSON.stringify(result) + "\n\n"
        )
    }
    
    function onClose(message) {
        messageEvent.removeListener('onAnswer', onAnswer)
        messageEvent.removeListener('onClose', onClose)
        res.end("id:" + id++ + "\n" +
            "event: close" + "\n" +
            "data:" + false + "\n\n")
    }

    messageEvent.addListener('onAnswer', onAnswer)
    messageEvent.addListener('onClose', onClose)

});

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})


