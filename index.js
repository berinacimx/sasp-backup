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

/* ================== AYARLAR ================== */
const TOKEN = "BOT_TOKEN_YAZ";
const GUILD_ID = "SUNUCU_ID";
const TICKET_PANEL_CHANNEL = "PANEL_KANAL_ID";
const TICKET_CATEGORY = "TICKET_KATEGORI_ID";
const STAFF_ROLE = "YETKILI_ROLE_ID";
/* ============================================= */

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ================== READY ================== */
client.once("ready", async () => {
  console.log(`✅ Bot aktif: ${client.user.tag}`);

  // 🎥 Yayın yapıyor durumu
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

  // Ticket Panel Gönder
  const guild = await client.guilds.fetch(GUILD_ID);
  const channel = await guild.channels.fetch(TICKET_PANEL_CHANNEL);

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

/* ================== INTERACTION ================== */
client.on("interactionCreate", async (i) => {
  if (!i.isButton()) return;

  /* ===== TICKET AÇ ===== */
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

    await channel.send({
      content: `<@${i.user.id}>`,
      embeds: [embed],
      components: [row]
    });

    i.reply({ content: "✅ Ticket oluşturuldu.", ephemeral: true });
  }

  /* ===== TICKET KAPAT ===== */
  if (i.customId === "ticket_close") {
    if (!i.channel.name.startsWith("ticket-"))
      return i.reply({ content: "❌ Bu kanal bir ticket değil.", ephemeral: true });

    await i.reply("🔒 Ticket 3 saniye içinde kapatılıyor...");
    setTimeout(() => i.channel.delete(), 3000);
  }
});

/* ================== LOGIN ================== */
client.login(TOKEN);
