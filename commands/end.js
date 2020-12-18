const Guilds = require('../data/dbObjects')

module.exports = async (message) => {
    const guild = await Guilds.findOne({ where: { guild_id: message.guild.id } })
    if (guild) {
        if (guild.meeting) {
            try {
                const pinned = await message.channel.messages.fetchPinned()
                await pinned.get(guild.topics_message_id).unpin()
            } catch (e) {
                message.channel.send('Acho que não encontrei a mensagem com a pauta 🤔')
            }
            await guild.update({ meeting: false, topics_message_id: null, done_topics: 0, sent_since_meeting_start: 0 })
            await message.channel.send("Reunião finalizada! 😁 ")
            await message.channel.send("**Lembre-se** de adicionar os encaminhamentos aqui. Use o comando `!reminder <encaminhamento1> ; <encaminhamento2> ; ...`")
        } else {
            message.channel.send("Não há nenhuma reunião rolando 🤔")
        }
    } else {
        return message.channel.send('Esse servidor não está no banco. Algo de errado não está certo.')
    }
}