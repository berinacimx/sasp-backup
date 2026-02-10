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

client.once(Events.ClientReady, async (client) => {
  console.log(`✅ Ticket bot aktif: ${client.user.tag}`);

  // 🎥 YAYIN DURUMU
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

  // PANEL
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
