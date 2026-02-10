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

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// ENV
const TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CATEGORY = process.env.TICKET_CATEGORY;
const STAFF_ROLE = process.env.STAFF_ROLE;
const LOG_CHANNEL = process.env.LOG_CHANNEL;

// READY
client.once(Events.ClientReady, async (client) => {
  console.log(`✅ Ticket bot aktif: ${client.user.tag}`);

  const guild = await client.guilds.fetch(GUILD_ID);
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

  channel.send({ embeds: [embed], components: [row] });
});

// INTERACTIONS
client.on(Events.InteractionCreate, async (i) => {
  if (!i.isButton()) return;

  // CREATE TICKET
  if (["support", "complaint", "partner"].includes(i.customId)) {
    const existing = i.guild.channels.cache.find(c => c.name === `ticket-${i.user.id}`);
    if (existing) return i.reply({ content: "❌ Zaten açık ticketin var.", ephemeral: true });

    const channel = await i.guild.channels.create({
      name: `ticket-${i.user.id}`,
      type: ChannelType.GuildText,
      parent: CATEGORY,
      permissionOverwrites: [
        { id: i.guild.id, deny: ["ViewChannel"] },
        { id: i.user.id, allow: ["ViewChannel", "SendMessages"] },
        { id: STAFF_ROLE, allow: ["ViewChannel", "SendMessages"] }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket Açıldı")
      .setDescription(`Kategori: **${i.customId}**\nYetkililer yakında seninle ilgilenecek.`)
      .setColor("Green");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("close").setLabel("🔒 Kapat").setStyle(ButtonStyle.Danger)
    );

    channel.send({ content: `<@${i.user.id}>`, embeds: [embed], components: [row] });
    i.reply({ content: "✅ Ticket oluşturuldu.", ephemeral: true });
  }

  // CLOSE TICKET
  if (i.customId === "close") {
    if (!i.channel.name.startsWith("ticket-"))
      return i.reply({ content: "❌ Bu bir ticket değil.", ephemeral: true });

    const transcript = await createTranscript(i.channel);

    const log = await i.guild.channels.fetch(LOG_CHANNEL);
    const embed = new EmbedBuilder()
      .setTitle("📜 Ticket Kapatıldı")
      .setDescription(`Kanal: ${i.channel.name}\nKapatan: ${i.user}`)
      .setColor("Red");

    log.send({ embeds: [embed], files: [transcript] });

    await i.reply("🔒 Ticket kapatılıyor...");
    setTimeout(() => i.channel.delete(), 3000);
  }
});

client.login(TOKEN);

