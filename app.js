const express = require('express')
const app = express()
const run = require('./openBrowser.js')
app.listen(1024, async () => {
	run()
})
