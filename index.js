import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ActivityType,
  Events
} from "discord.js";

import { createTranscript } from "discord-html-transcripts";

/* =======================
   CLIENT
======================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

/* =======================
   ENV
======================= */
const {
  BOT_TOKEN,
  GUILD_ID,
  TICKET_CATEGORY,
  STAFF_ROLE,
  LOG_CHANNEL
} = process.env;

/* =======================
   READY
======================= */
client.once(Events.ClientReady, async (bot) => {
  console.log(`✅ Ticket bot aktif: ${bot.user.tag}`);

  // 🎥 STREAMING STATUS
  bot.user.setPresence({
    activities: [
      {
        name: "SASP ❤️ Rispect",
        type: ActivityType.Streaming,
        url: "https://www.twitch.tv/rispectofficial"
      }
    ],
    status: "online"
  });

  // 🎫 PANEL
  const guild = await bot.guilds.fetch(GUILD_ID);
  const channel = guild.systemChannel;
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("🎫 Destek Sistemi")
    .setDescription("Aşağıdan ticket türünü seç.")
    .setColor("Blue");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("support").setLabel("🛠️ Destek").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("complaint").setLabel("⚠️ Şikayet").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("partner").setLabel("🤝 Partner").setStyle(ButtonStyle.Secondary)
  );

  await channel.send({ embeds: [embed], components: [row] });
});

/* =======================
   INTERACTIONS
======================= */
client.on(Events.InteractionCreate, async (i) => {
  if (!i.isButton()) return;

  /* -------- CREATE TICKET -------- */
  if (["support", "complaint", "partner"].includes(i.customId)) {
    const existing = i.guild.channels.cache.find(
      c => c.name === `ticket-${i.user.id}`
    );
    if (existing)
      return i.reply({ content: "❌ Zaten açık bir ticketin var.", ephemeral: true });

    const channel = await i.guild.channels.create({
      name: `ticket-${i.user.id}`,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY,
      permissionOverwrites: [
        { id: i.guild.id, deny: ["ViewChannel"] },
        { id: i.user.id, allow: ["ViewChannel", "SendMessages"] },
        { id: STAFF_ROLE, allow: ["ViewChannel", "SendMessages"] }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket Açıldı")
      .setDescription(`Kategori: **${i.customId}**\nYetkililer seninle ilgilenecek.`)
      .setColor("Green");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("🔒 Ticket Kapat")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `<@${i.user.id}>`,
      embeds: [embed],
      components: [row]
    });

    return i.reply({ content: "✅ Ticket oluşturuldu.", ephemeral: true });
  }

  /* -------- CLOSE TICKET -------- */
  if (i.customId === "close_ticket") {
    if (!i.channel.name.startsWith("ticket-"))
      return i.reply({ content: "❌ Bu bir ticket değil.", ephemeral: true });

    const transcript = await createTranscript(i.channel);

    const logChannel = await i.guild.channels.fetch(LOG_CHANNEL);
    const logEmbed = new EmbedBuilder()
      .setTitle("📜 Ticket Kapatıldı")
      .addFields(
        { name: "Kanal", value: i.channel.name, inline: true },
        { name: "Kapatan", value: `${i.user}`, inline: true }
      )
      .setColor("Red");

    await logChannel.send({
      embeds: [logEmbed],
      files: [transcript]
    });

    await i.reply("🔒 Ticket kapatılıyor...");
    setTimeout(() => i.channel.delete(), 3000);
  }
});

/* =======================
   LOGIN
======================= */
client.login(BOT_TOKEN);
