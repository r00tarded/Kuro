exports.run = function(bot, msg, args, utils) {
	
	bot.editMessage(msg.channel.id, msg.id, 'Loading...')

	const request = require('request')
	const parseString = require('xml2js').parseString
	const cheerio = require('cheerio')

	let username = utils.conf().MALusername
	if(args.length !== 0) username = args[0]

	request(`https://myanimelist.net/malappinfo.php?&status=all&type=anime&u=${username}`, (err, res, body) => {
		if(!err){
			parseString(body, function (err, result) {
				if(!err){
					request(`https://myanimelist.net/profile/${username}`, (err, res, body) => {
						if(!err){
							try{

								let description = '\n **Latest updates:**\n'

								let $ = cheerio.load(body)
								let data = $('.statistics-updates').find('.data')

								for(let i = 0; i < 3;  i++){
									let link = $(data[i]).find('a').attr('href')
									let title = $(data[i]).find('a').text()
									let thing = $(data[i]).find('div.fn-grey2').text().split('·')[0].trim()
									
									// Until a better regex appears
									thing = thing.replace(/(\r\n\s|\n|\r|\s)/gm,'')

									description = description + `[${title}](${link}) - ${thing} \n`
								}

								let id = result.myanimelist.myinfo[0].user_id[0]
								let img = `https://myanimelist.cdn-dena.com/images/userimages/${id}.jpg`

								description = description + '\nThis user has spent ' + result.myanimelist.myinfo[0].user_days_spent_watching[0] + ' days watching anime, SUGOI!'

								bot.editMessage(msg.channel.id, msg.id, {
									'embed': {
										'type': 'rich',
										'title': username + '\'s MyAnimeList Summary',
										'url': 'https://myanimelist.net/animelist/' + username,
										'description': description,
										'color': 3035554,
										'fields': [
											{ 'name': 'Watching', 'value': result.myanimelist.myinfo[0].user_watching[0], 'inline': true },
											{ 'name': 'Completed', 'value': result.myanimelist.myinfo[0].user_completed[0], 'inline': true },
											{ 'name': 'On Hold', 'value': result.myanimelist.myinfo[0].user_onhold[0], 'inline': true },
											{ 'name': 'Dropped', 'value': result.myanimelist.myinfo[0].user_dropped[0], 'inline': true },
											{ 'name': 'Plan to Watch', 'value': result.myanimelist.myinfo[0].user_plantowatch[0], 'inline': true }
										],
										'thumbnail': {
											'url': img
										}
									}
								})

							}catch(e){
								msg.delete()
							}
						}
					})
				}
			})
		}
	})
}