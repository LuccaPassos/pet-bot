const { MessageEmbed } = require("discord.js")
const Guilds = require('../data/dbObjects')

module.exports = async (client, message) => {
    const guild = await Guilds.findOne({ where: { guild_id: message.guild.id } })
    if (guild) {
        const DURATION = guild.vote_time
        const reactions = [
            { emoji: '👍', count: 0 },
            { emoji: '👎', count: 0 },
            { emoji: '🤷‍♀️', count: 0 }
        ]
        message.channel.send("Iniciando regime de votação")
        const title = message.content.slice(6)
        const embed = new MessageEmbed()
            .setTitle(title)
            .setDescription(`Essa votação durará ${DURATION} segundos. Clique ${reactions[0].emoji} para sim, ${reactions[1].emoji} para não e ${reactions[2].emoji} para se abster. Apenas a **primeira** reação será contabilizada.`)
            .setColor(0xD17FDC)
        const vote = await message.channel.send(embed)

        reactions.forEach(async (elem) =>
            await vote.react(elem.emoji)
        )

        const filter = (reaction, user) => {
            if (!user.bot) {
                let occur = vote.reactions.cache.filter((elem) => elem.users.cache.has(user.id)).size
                return occur == 1 && reactions.some((elem) => elem.emoji == reaction.emoji.name)
            } else {
                return false
            }
        }

        vote.awaitReactions(filter, { time: DURATION * 1000 })
            .then(collected => {
                reactions.forEach((elem) =>
                    elem.count = collected.get(elem.emoji) !== undefined ? (collected.get(elem.emoji).count - 1) : 0
                )
                if (reactions[0].count > reactions[1].count) {
                    message.channel.send("A proposta foi **aprovada**.")
                } else if (reactions[0].count < reactions[1].count) {
                    message.channel.send("A proposta foi **reprovada**.")
                } else if (reactions[0].count != 0 && reactions[0].count == reactions[1].count) {
                    message.channel.send("Não houve consenso.")
                } else if (reactions[2].count != 0) {
                    message.channel.send("Todos se abstiveram.")
                } else {
                    message.channel.send("Nenhum voto.")
                }
            })
    } else {
        return message.channel.send('Esse servidor não está no banco. Algo de errado não está certo.')
    }
}