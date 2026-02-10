import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder
} from "discord.js";
import config from "./config.json" assert { type: "json" };

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once("ready", () => {
  console.log(`✅ Ticket bot aktif: ${client.user.tag}`);
});

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
      parent: config.ticketCategory,
      permissionOverwrites: [
        {
          id: i.guild.id,
          deny: ["ViewChannel"]
        },
        {
          id: i.user.id,
          allow: ["ViewChannel", "SendMessages"]
        },
        {
          id: config.staffRole,
          allow: ["ViewChannel", "SendMessages"]
        }
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

// TICKET PANELİ
client.on("ready", async () => {
  const guild = await client.guilds.fetch(config.guildId);
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

client.login(config.token);
