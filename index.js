import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ActivityType
} from "discord.js";

/* ========= ENV ========= */
const {
  BOT_TOKEN,
  GUILD_ID,
  PANEL_CHANNEL_ID,
  TICKET_CATEGORY_ID,
  STAFF_ROLE_ID
} = process.env;

/* ========= CLIENT ========= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ========= READY ========= */
client.once("clientReady", async () => {
  console.log("✅ Bot aktif");

  // 🎥 Yayın durumu
  client.user.setPresence({
    activities: [
      {
        name: "SASP ❤️ Rispect",
        type: ActivityType.Streaming,
        url: "https://www.twitch.tv/rispectofficial"
      }
    ],
    status: "online"
  });

  // 🎫 Ticket Panel
  const guild = await client.guilds.fetch(GUILD_ID);
  const channel = await guild.channels.fetch(PANEL_CHANNEL_ID);

  const embed = new EmbedBuilder()
    .setTitle("🎫 Ticket Destek Sistemi")
    .setDescription("Destek almak için aşağıdaki butona tıkla.")
    .setColor("Blue");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_create")
      .setLabel("🎟️ Ticket Aç")
      .setStyle(ButtonStyle.Primary)
  );

  await channel.send({ embeds: [embed], components: [row] });
});

/* ========= INTERACTION ========= */
client.on("interactionCreate", async (i) => {
  if (!i.isButton()) return;

  // TICKET AÇ
  if (i.customId === "ticket_create") {
    const exists = i.guild.channels.cache.find(
      c => c.name === `ticket-${i.user.id}`
    );

    if (exists)
      return i.reply({ content: "❌ Zaten açık bir ticketin var.", ephemeral: true });

    const ticket = await i.guild.channels.create({
      name: `ticket-${i.user.id}`,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY_ID,
      permissionOverwrites: [
        { id: i.guild.id, deny: ["ViewChannel"] },
        { id: i.user.id, allow: ["ViewChannel", "SendMessages"] },
        { id: STAFF_ROLE_ID, allow: ["ViewChannel", "SendMessages"] }
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

    await ticket.send({
      content: `<@${i.user.id}>`,
      embeds: [embed],
      components: [row]
    });

    i.reply({ content: "✅ Ticket oluşturuldu.", ephemeral: true });
  }

  // TICKET KAPAT
  if (i.customId === "ticket_close") {
    if (!i.channel.name.startsWith("ticket-"))
      return i.reply({ content: "❌ Bu bir ticket değil.", ephemeral: true });

    await i.reply("🔒 Ticket 3 saniye içinde kapatılıyor...");
    setTimeout(() => i.channel.delete(), 3000);
  }
});

/* ========= LOGIN ========= */
client.login(BOT_TOKEN);
