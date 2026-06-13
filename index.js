require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let jugadores = [];

// Registrar el comando /impostor
const commands = [
  new SlashCommandBuilder()
    .setName('impostor')
    .setDescription('Juega al impostor con tus amigos')
    .addSubcommand(sub =>
      sub
        .setName('agregar')
        .setDescription('Agrega jugadores a la partida')
        .addStringOption(option =>
          option
            .setName('nombres')
            .setDescription('Nombres de los jugadores separados por coma')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('empezar')
        .setDescription('Empieza la partida y elige al impostor')
    )
    .addSubcommand(sub =>
      sub
        .setName('reiniciar')
        .setDescription('Reinicia la lista de jugadores')
    )
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('🌀 Registrando comandos...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('✅ Comando /impostor registrado correctamente');
  } catch (error) {
    console.error('❌ Error al registrar comandos:', error);
  }
})();

client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'impostor') {
    const subcommand = options.getSubcommand();

    if (subcommand === 'agregar') {
      const nombres = options.getString('nombres').split(',').map(n => n.trim());
      jugadores.push(...nombres);

      await interaction.reply({
        content: `✅ Jugadores agregados: ${nombres.join(', ')}\n👥 Total: ${jugadores.length}`,
        ephemeral: true
      });
    }

    else if (subcommand === 'empezar') {
      if (jugadores.length < 2) {
        await interaction.reply({ content: '⚠️ Necesitás al menos 2 jugadores.', ephemeral: true });
        return;
      }

      const impostor = jugadores[Math.floor(Math.random() * jugadores.length)];
      await interaction.reply(`🎭 Los jugadores son: ${jugadores.join(', ')}\n🤫 El impostor es... **${impostor}** 😈`);
    }

    else if (subcommand === 'reiniciar') {
      jugadores = [];
      await interaction.reply({ content: '♻️ Lista de jugadores reiniciada.', ephemeral: true });
    }
  }
});

client.login(TOKEN);
