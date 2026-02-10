import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder
} from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// ENV VARIABLES
const TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const TICKET_CATEGORY = process.env.TICKET_CATEGORY;
const STAFF_ROLE = process.env.STAFF_ROLE;
const LOG_CHANNEL = process.env.LOG_CHANNEL;

client.once("ready", () => {
  console.log(`✅ Ticket bot aktif: ${client.user.tag}`);
});

// BUTON İŞLEMLERİ
client.on("interactionCreate", async (i) => {
  if (!i.isButton()) return;

  // TICKET OLUŞTUR
  if (i.customId === "ticket_create") {
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
      .setDescription("Yetkililer seninle ilgilenecek.\nKapatmak için aşağıdaki butonu kullan.")
      .setColor("Green");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("🔒 Ticket Kapat")
        .setStyle(ButtonStyle.Danger)
    );

    channel.send({ content: `<@${i.user.id}>`, embeds: [embed], components: [row] });
    i.reply({ content: "✅ Ticket oluşturuldu.", ephemeral: true });
  }

  // TICKET KAPAT
  if (i.customId === "ticket_close") {
    if (!i.channel.name.startsWith("ticket-"))
      return i.reply({ content: "❌ Bu bir ticket değil.", ephemeral: true });

    await i.reply("🔒 Ticket kapatılıyor...");
    setTimeout(() => i.channel.delete(), 3000);
  }
});

// PANEL
client.on("ready", async () => {
  const guild = await client.guilds.fetch(GUILD_ID);
  const channel = guild.systemChannel;
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("🎫 Destek Sistemi")
    .setDescription("Destek almak için aşağıdaki butona tıkla.")
    .setColor("Blue");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_create")
      .setLabel("🎟️ Ticket Aç")
      .setStyle(ButtonStyle.Primary)
  );

  channel.send({ embeds: [embed], components: [row] });
});

client.login(TOKEN);
