const pauta = require("../pauta")
const { MessageEmbed } = require("discord.js")
const Guilds = require('../data/dbObjects')

module.exports = async (message) => {
  const guild = await Guilds.findOne({ where: { guild_id: message.guild.id } })
  if (guild) {
    const voiceStatus = message.guild.voiceStates.cache.get(message.author.id)
    if (voiceStatus != undefined && voiceStatus.channelID != null) {
      await message.channel.send("Começando a reunião.")
      const allMembers = message.guild.members.cache
      const presentMembers = message.guild.voiceStates.cache
      const missing = allMembers.difference(presentMembers)
      missing.sweep((elem) => elem.user.bot)
      if (missing.size > 0) {
        let msg = `Ainda faltam: `
        missing.forEach((elem) => msg += `<@${elem.user.id}> `)
        message.channel.send(msg)
      } else {
        message.channel.send("Todos estão presentes.")
      }
    } else {
      message.reply("você precisa estar em um canal de voz para começar uma reunião.")
      return
    }
    pauta.goTo(0)
    const embed = new MessageEmbed()
      .setTitle('Pauta')
      .setColor(0x56938E)
      .setDescription("Aperte '🔽' para passar o tópico ou '🔼' para voltar. Ao final da reunião, aperte '❌' para finalizá-la 😉")
      .addFields({ name: '\u200b', value: pauta.topics })
    const msg = await message.channel.send(embed)

    await msg.react('🔽')
    await msg.react('🔼')
    await msg.react('❌')
    await msg.pin()

    await guild.update({ meeting: true, idPauta: msg.id })
  } else {
    return message.channel.send('Esse servidor não está no banco. Algo de errado não está certo.')
  }
}