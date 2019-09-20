const puppeteer = require('puppeteer')
var arguments = process.argv.splice(2)
const initBrowser = async () => {
	global.browser = await puppeteer.launch({
		defaultViewport: {
			width: 1400,
			height: 930
		},
		timeout: 0, //timeout here is 无限制
		args: [ '--disable-bundled-ppapi-flash=true' ],
		devtools: true,
		// headless: false
		headless: true
	})
	await loginAce()
}
const loginAce = async () => {
	const login = await browser.newPage()
	await login.goto('http://online.nwpunec.net/ELearningWebPlatform/Student/Login')
	const loginForm = await login.$('.login_right')
	await loginForm.$eval('#userName', (userInput) => (userInput.value = '007903201011')) // 用户名
	await loginForm.$eval('#password', (passInput) => (passInput.value = '610404199406170037')) // 密码
	await loginForm.$eval('#loginBtn', (loginBtn) => loginBtn.click())
	jumpTo(loginForm)
}
const jumpTo = async () => {
	const jumpTo = await browser.newPage()
	await jumpTo.goto(
		`http://online.nwpunec.net/ELearningWebPlatform/Student/ViewQuizAnswer?courseId=${arguments[0]}&quizId=${arguments[1]}&studentId=294350`
	)
	let answerVal = await jumpTo.evaluate(() => {
		return $('#form1 .test>.test_answer:nth-child(4)>span:nth-child(2)').map((element, val) => {
			var s = escape($(val).text())
			return {
				type: s.indexOf('%') ? 'radio' : 'text',
				value: $(val).text()
			}
		})
	})
	answer(answerVal)
}

const answer = async (val) => {
	const answerTo = await browser.newPage()
	await answerTo.goto(
		`http://online.nwpunec.net/ELearningWebPlatform/Student/QuizPaper?courseId=${arguments[0]}&quizId=${arguments[1]}&studentId=294347`
	)
	await answerTo.evaluate((val) => {
		let standard = {
			A: 1,
			B: 2,
			C: 3,
			D: 4,
			E: 5,
			F: 6
		}
		for (let i = 0; i < val.length; i++) {
			let valObj = val[i]
			if (valObj.type == 'text') $(` .test_answer`).eq(i).children('input').val(valObj.value)
			if (valObj.type == 'radio') {
				for (let t = 0; t < valObj.value.length; t++) {
					let number = standard[valObj.value[t]]
					if ($(` .test_answer`).eq(i).children('label')[number - 1])
						$(` .test_answer`).eq(i).children('label')[number - 1].click()
				}
			}
		}
		$('#btn_submit_edit').click()
		$('.ui-dialog-buttonset button')[0].click()
	}, val)
	setTimeout(() => {
		console.log('答题已完成')
	}, 500)
}
module.exports = initBrowser
