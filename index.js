import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ActivityType
} from "discord.js";
import "dotenv/config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

// ================= READY =================
client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot aktif: ${client.user.tag}`);

  // 🎥 Yayın yapıyor durumu
  client.user.setPresence({
    activities: [{
      name: "SASP ❤️ Rispect",
      type: ActivityType.Streaming,
      url: "https://www.twitch.tv/rispectofficial"
    }],
    status: "online"
  });

  // Ticket paneli gönder
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const channel = await guild.channels.fetch(process.env.TICKET_CHANNEL);

  const embed = new EmbedBuilder()
    .setTitle("🎫 Destek Sistemi")
    .setDescription("Destek almak için aşağıdaki butona tıkla.")
    .setColor("Blue");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_create")
      .setLabel("🎟 Ticket Aç")
      .setStyle(ButtonStyle.Primary)
  );

  channel.send({ embeds: [embed], components: [row] });
});

// ================= INTERACTION =================
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  // ===== TICKET AÇ =====
  if (interaction.customId === "ticket_create") {
    const existing = interaction.guild.channels.cache.find(
      c => c.name === `ticket-${interaction.user.id}`
    );

    if (existing) {
      return interaction.reply({
        content: "❌ Zaten açık bir ticketin var.",
        ephemeral: true
      });
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.id}`,
      type: ChannelType.GuildText,
      parent: process.env.TICKET_CATEGORY,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: ["ViewChannel"] },
        { id: interaction.user.id, allow: ["ViewChannel", "SendMessages"] },
        { id: process.env.STAFF_ROLE, allow: ["ViewChannel", "SendMessages"] }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket Açıldı")
      .setDescription("Yetkililer seninle ilgilenecek.")
      .setColor("Green");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("🔒 Ticket Kapat")
        .setStyle(ButtonStyle.Danger)
    );

    channel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [embed],
      components: [row]
    });

    interaction.reply({
      content: "✅ Ticket oluşturuldu.",
      ephemeral: true
    });
  }

  // ===== TICKET KAPAT =====
  if (interaction.customId === "ticket_close") {
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({
        content: "❌ Bu kanal bir ticket değil.",
        ephemeral: true
      });
    }

    await interaction.reply("🔒 Ticket 3 saniye içinde kapatılıyor...");
    setTimeout(() => interaction.channel.delete(), 3000);
  }
});

// ================= LOGIN =================
client.login(process.env.BOT_TOKEN);
