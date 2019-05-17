const { Client, Util } = require('discord.js');
const { TOKEN, PREFIX, GOOGLE_API_KEY, SERVERPREFIXES } = require('./config');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const client = new Client({ disableEveryone: true });
const youtube = new YouTube(GOOGLE_API_KEY);
const queue = new Map()
const https = require('https');

//Commands to enable the project to work properly.
//
//npm install ffmpeg-binaries
//npm install --global --production windows-build-tools
//npm install node-opus

client.on('guildCreate', guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}) This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} server(s)`);
});

client.on('guildDelete', guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id}) `);
  client.user.setActivity(`Serving ${client.guilds.size} server(s)`);
});

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => {
  console.log('Begining to launch.')
  client.user.setActivity(`Serving ${client.guilds.size} server(s)`)
});

client.on('disconnect', () => console.log('I just disconnected, no idea why just making sure you know, I will reconnect now...'));

client.on('reconnecting', () => console.log('I am reconnecting now!'));
var AdvancedLoggingOn = true;
function Logging(message,msg){
  if (AdvancedLoggingOn == true){
    console.log(`${msg.author} : ${message}`)
  }
}

client.on('message', async msg => {
	if (!msg.content.startsWith(SERVERPREFIXES[String(msg.guild.id)])) return undefined;
	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(PREFIX.length)

  if (command == "enablelogging"){
    if (msg.author.id == "186188409499418628"){
      AdvancedLoggingOn = true;
      Logging("Enabled Logging", msg)
    }
  } else if(command == "disablelogging"){
    if (msg.author.id == "186188409499418628"){
      AdvancedLoggingOn = false;
      Logging("Disabled Logging", msg)
    }
  }

  if (command == "setprefix"){
    var serverID = msg.guild.id;
    if (!args[1]){
      msg.reply("You didn't give a prefix.").then(msg => {msg.delete(5000)});
      Logging("Tried to set the prefix", msg);
      return msg.delete(100)
    }
    SERVERPREFIXES[serverID] = args[1];
    msg.reply(`You updated the prefix to: ${args[1]}`).then(msg => {msg.delete(5000)});
    Logging("Succesfully updated the prefix", msg)
    msg.delete(100)
  } else if (command == "currentprefix"){
    var serverID = msg.guild.id;
    msg.reply(`The current prefix is: ${SERVERPREFIXES[serverID]}`).then(msg => msg.delete(5000)).catch(err => console.log(`An issue was encounterd reading the prefix: ${err}`));
    Logging("Requested the current prefix", msg)
    msg.delete(100)
  }

  if (command == "crackstatus"){
	  if (args[1] == "request"){
		  var Game_Name = args[2]
		  var v = 0;
		  var Game_Found = false;
		  while (Game_Found == false){
			  var data = https.get("https://api.crackwatch.com/api/games?page="+String(v), (resp) =>{
				let data = '';
				resp.on('data', (chunk) => {
					data += chunk
				});
				resp.on('end', () => {
					data = JSON.parse(data)
					for (i=0; i < 30;i++){
            console.log(`Pass number : ${i}, ${v} `)
						if (data[i].title.includes(Game_Name)){
              Game_Found = true;
							return msg.channel.send(`\`\`\`\Game Name: ${data[i].title}\n Is AAA?: ${data[i].isAAA}\n Cracked by: ${data[i].groups}\n Release Date: ${data[i].releaseDate}\n Crack Date: ${data[i].crackDate}  \`\`\``).then(msg => {msg.delete(60000)})
						}
					}
				});
			v += 1
			if (v > 100) {
				Game_Found = true;
				return msg.reply("Unable to find the game in a reasonable ammount of time, please check spelling and try again.")
			}
		})
    }	
	  } else if (args[1] == "recent"){
		  if (args[2] == "cracked"){
			  var CrackedOnly = true;
		  } else if(args[2] == "released"){
			  var CrackedOnly = false;
		  } else if(args[3] == "aaa"){
			  var AAAOnly = true;
		  } else if(args[3] == "all"){
		  	var AAAOnly = false;
		  }
		
		  var data = https.get("https://api.crackwatch.com/api/games?page=0&is_aaa=" + String(AAAOnly) + "&is_cracked=" + String(CrackedOnly), (resp) => {
			  let data = '';
			  resp.on('data', (chunk) => {
				data += chunk
			  });
			  resp.on('end', () => {
				  data = JSON.parse(data)
          for (i=0; i < args[4];i++){
				  return msg.channel.send(`\`\`\`\Game Name: ${data[i].title}\n Is AAA?: ${data[i].isAAA}\n Cracked by: ${data[i].groups}\n Release Date: ${data[i].releaseDate}\n Crack Date: ${data[i].crackDate}  \`\`\``).then(msg => {msg.delete(60000)})
          }
        })
		  })
	  }
  }

  if (command == "crackwatch"){
    if (args[1] == "recent"){
      if (args[2] == "all"){
        var url2 = "https://api.crackwatch.com/api/games?page=0&is_cracked=true&sort_by=crack_date&sort_inverted=true"
      } else if (args[2] == "aaa"){
        var url2 = "https://api.crackwatch.com/api/games?page=0&is_aaa=true&is_cracked=true&sort_by=crack_date&sort_inverted=true"
      }
    } else if(args[1] == "normal"){
      if (args[2] == "all"){
        var url2 = "https://api.crackwatch.com/api/games?page=0&is_cracked=true&sort_by=release_date"
      } else if (args[2] == "aaa"){
        var url2 = "https://api.crackwatch.com/api/games?page=0&is_aaa=true&is_cracked=true&sort_by=release_date"
      }
    }
      var data = https.get(url2, (resp) =>{
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          console.log(JSON.parse(data));
          data = JSON.parse(data)  
          for (i=0; i < args[3];i++){
            msg.channel.send(`\`\`\`\Game Name: ${data[i].title}\n Is AAA?: ${data[i].isAAA}\n Cracked by: ${data[i].groups}\n Release Date: ${data[i].releaseDate}\n Crack Date: ${data[i].crackDate}  \`\`\``).then(msg => {msg.delete(60000)}).catch(err => console.log(error))
          }      
        }) 
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      }) 
  }
  if (command == "createvc"){
    var ChannelName = args[1]
    msg.guild.createRole({
      name: msg.author.id
    }).then(role => {
      msg.guild.createChannel("1" + ChannelName, 'voice').then(channel => {
        if (msg.guild.id == "577423436461244426"){
          channel.setParent('577782300880928768');
        } else if (msg.guild.id == "331848466173001730"){
          channel.setParent('577868646630555708') 
        }
        const everyone = msg.guild.roles.find(role => role.name === "@everyone");
        channel.overwritePermissions(everyone, {"VIEW_CHANNEL": false});
        channel.overwritePermissions(role, {"VIEW_CHANNEL" : true});
        var user = msg.author;
        if (user){
          var member = msg.guild.member(user);
          if (member){
            member.addRole(role)
          }
        }
        var user = msg.mentions.users;
        user.forEach(user => {
            var member = msg.guild.member(user);
            member.addRole(role)
          }
        )
      })
    })
    msg.reply("Everything is ready.").then(msg => {msg.delete(5000)})
    Logging("Succesfully created a private VC", msg)
    msg.delete(100)
  } else if (command == "cleanupvcs"){
    if (msg.author.id == "186188409499418628"){
        var servers =  msg.guild.channels;
        servers.forEach(server => {
          if (server.parentID == "577782300880928768" || server.parentID == "577868646630555708"){
          server.delete('Cleaning up old channels.').then(deleted => console.log(`Deleted ${deleted.name} as part of clean up.`)).catch(console.error);
          }
        })
        var roles = msg.guild.roles;
        roles.forEach(role => {
          var rolename = role.name
          if (rolename.match(/^\d/)){
            role.delete("Deleted as part of cleanup").then(deleted => console.log(`Deleted ${deleted.name} as part of clean up.`)).catch(console.error);
          }
        })
        Logging("Succesfully cleaned up voice channels", msg)
    }
    msg.reply("Succesfully cleaned up both roles and channels.").then(msg => msg.delete(5000));
    msg.delete(100);
  }

  if (command == "pingpong"){
    msg.channel.send("$pongping")
    console.log("Sent pingpong command: ")
    
  } else if (command == "pongping"){
    msg.channel.send("$pingpong")
    console.log("Sent pongping command: ")
    Logging("Succesfully sent pongping command", msg)
  }
  
  if (command == 'kick') {
    const user = msg.mentions.users.first();
    if (user) {
      const member = msg.guild.member(user);
      if (member) {
        member.kick('I felt like it.').then(() => {
          msg.reply(`Succesfully kicked ${user.tag}`).then(msg => {msg.delete(10000)});
          
        }).catch(err => {
          msg.reply('I was unable to kick the member').then(msg => {msg.delete(5000)});
          Logging(`Attempted to kick ${user.tag}`, msg)
        });
        msg.delete(100)
      } else {
        msg.reply('That user isn\'t in this guild!').then(msg => {msg.delete(5000)});
		msg.delete(100)
      }
    } else {
      msg.reply("You didn\'t mention the user to kick!").then(msg => {msg.delete(5000)});
	  msg.delete(100)
    }
  } else if (command == 'ban') {
    const user = msg.mentions.users.first();
    if (user) {
      const member = msg.guild.member(user);
      if (member){
        member.ban({
          reason: 'I felt like it.'
        }).then(() => {
          msg.reply(`Succesfully banned ${user.tag}`).then(msg => {msg.delete(5000)});
          msg.delete(100)
        }).catch(err => {
          msg.reply('I was unable to ban the member').then(msg => {msg.delete(5000)});
          console.error(err);
        })
      } else {
        msg.reply("That user isn't in this guild!").then(msg => {msg.delete(5000)})
      }
    } else {
      msg.reply("You didn't mention the user to kick!").then(msg => {msg.delete(5000)})
    }
  }
  if (command == 'ping'){
    console.log("Triggered the ping command")
    msg.channel.send({embed: {
      color: 0x2ed32e,
      fields: [{
        name: "Pong",
        value: "My Ping: " + client.ping + 'ms'
      }],
    }}
    ).then(msg => {msg.delete(10000)})
    msg.delete(100)
    console.log("Deleted a $ping command:")
  }

  if (command == "shutdown"){
	  if(msg.author.id == "186188409499418628"){	
		  msg.channel.send("Shutting down, without restarting").then(msg => {msg.delete(10000)})
      msg.delete(100)
		  client.destroy()
    } else {
	    msg.channel.send("You aren't the bot author.").then(msg => {msg.delete(10000)})  
    }
  }

  if (command == 'info'){
	  msg.channel.send({embed: {
		color: 0x2ed32e,
		fields: [{
			name: "Info",
			value: `Started development on 08/05, serving ${client.guilds.size} server(s)`
	  }],}}
   ).then(msg => {msg.delete(10000)})
   msg.delete(100)
  }

  if (command =='purge'){
    const deleteCount = parseInt(args[1], 10);
    if (!deleteCount || deleteCount < 2 || deleteCount > 100){ 
    return msg.reply("Please provide a number between 2 and 100").then(msg => {msg.delete(5000)});
    }
    const fetched = await msg.channel.fetchMessages({limit : deleteCount});
    msg.channel.bulkDelete(fetched).catch(error => msg.reply(`Couldn\'t delete message because of ${error}`).then(msg => {msg.delete(5000)}))
  }

  if (command == "restart"){
	   if(msg.author.id == "186188409499418628"){		   
			msg.channel.send("Restarting now, will send a message once I'm back").then(msg => {msg.delete(5000)})
      msg.delete(100)
			client.destroy()
			client.login(TOKEN)
    } else {
	   msg.channel.send("You aren't the bot author").then(msg => {msg.delete(5000)})
     msg.delete(100)
    }
  }
   
  if (command === 'play') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) {
      msg.channel.send('I\'m sorry but you need to be in a voice channel to play music!').then(msg => {msg.delete(5000)});
      msg.delete(100)
      return console.log(msg.author + "tried to use the play command while not in a channel:");
    }
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!').then(msg => {msg.delete(5000)});
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!').then(msg => {msg.delete(5000)});
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); 
				await handleVideo(video2, msg, voiceChannel, true); 
			}
			return msg.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`).then(msg => {msg.delete(10000)});
		  } else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					msg.channel.send(`
      __**Song selection:**__
      ${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}
      Please provide a value to select one of the search results ranging from 1-10.
					`).then(msg => {msg.delete(10000)});
          msg.delete(100)
					try {
						var response = await msg.channel.awaitMessages(msg2 =>  msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('No or invalid value entered, cancelling video selection.').then(msg => {msg.delete(5000)});
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send('🆘 I could not obtain any search results.').then(msg => {msg.delete(5000)});
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}

	} else if (command === 'skip') {
		if (!msg.member.voiceChannel){ 
      msg.channel.send('You are not in a voice channel!').then(msg => {msg.delete(5000)});
      return console.log(msg.author + ": wasn't in a VC.")
    }
		if (!serverQueue){
      msg.channel.send('There is nothing playing that I could skip for you.').then(msg => {msg.delete(5000)});
      msg.delete(100)
		  serverQueue.connection.dispatcher.end('Skip command has been used!');
		  return undefined;
    }
	} else if (command === 'stop') {
		if (!msg.member.voiceChannel){
      msg.channel.send('You are not in a voice channel!').then(msg => {msg.delete(5000)});
      msg.delete(100)
    }
		if (!serverQueue){ 
      msg.channel.send('There is nothing playing that I could stop for you.').then(msg => {msg.delete(5000)});
		  serverQueue.songs = [];
    }
		serverQueue.connection.dispatcher.end('Stop command has been used!');
    msg.delete(100)
		return undefined;
	} else if (command === 'volume') {
		if (!msg.member.voiceChannel){
      msg.channel.send('You are not in a voice channel!').then(msg => {msg.delete(5000)});
      msg.delete(100)
      return console.log(msg.author + ": wasn't in a VC.")
    }
		if (!serverQueue){
      msg.channel.send('There is nothing playing.').then(msg => {msg.delete(5000)});
      msg.delete(100)
      return console.log("There was nothing playing.")
    }
		if (!args[1]){ 
      msg.channel.send(`The current volume is: **${serverQueue.volume}**`).then(msg => {msg.delete(5000)});
      msg.delete(100)
      return console.log(`The volume changed to **${serverQueue.volume}**`)
    }
		if (args[1] < 5.1){
			serverQueue.volume = args[1];
			serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
			msg.channel.send(`I set the volume to: **${args[1]}**`).then(msg => {msg.delete(5000)});
      msg.delete(100)
      return console.log(`Set the value to **${args[1]}**`)
      } else { 
			msg.channel.send("You tryna kill someone with that volume?").then(msg => {msg.delete(5000)});
		}

	} else if (command === 'np') {
		if (!serverQueue) return msg.channel.send('There is nothing playing.').then(msg => {msg.delete(5000)});
		msg.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`).then(msg => {msg.delete(5000)});
		return msg.delete(100)	
	} else if (command === 'queue') {
		if (!serverQueue) {
      msg.channel.send('There is nothing playing.').then(msg => {msg.delete(5000)});
      msg.delete(100)
    }
    var NewSongList = serverQueue.songs;
    if (NewSongList.length < 10){
      var SliceLimit = NewSongList.length;
    } else {
      var SliceLimit = 10;
    }
    var NewSongList = NewSongList.slice(SliceLimit-1);
    console.log(NewSongList.length);
		msg.channel.send(`
      __**Song queue:**__
      ${NewSongList.map(song => `**-** ${song.title}`).join('\n')} 
       **Now playing:** ${NewSongList[0].title}`).then(msg => {msg.delete(60000)}).catch(error => console.log(`Failed to print queue due to: ${error}`));
    msg.delete(100)
	} else if (command === 'pause') {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('⏸ Paused the music for you!').then(msg => {msg.delete(5000)});
		}
		return msg.channel.send('There is nothing playing.').then(msg => {msg.delete(5000)});
	} else if (command === 'resume') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.send('▶ Resumed the music for you!').then(msg => {msg.delete(5000)});
		}
		return msg.channel.send('There is nothing playing.').then(msg => {msg.delete(5000)});
	}
	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 1.5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`I could not join the voice channel: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`✅ **${song.title}** has been added to the queue!`);
  }
	return undefined;
}
function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`🎶 Start playing: **${song.title}**`);
}

client.login(TOKEN);	
