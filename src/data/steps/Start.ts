import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram"
import keyboards from "../keyboards";

export default async function Start(bot: Telegraf<Context<Update>>, db: any) {
  bot.start(async (ctx) => {
    console.log('\n\nBOT STARTED (Pressed /start button)');

    const username = ctx.chat.type === "private" ? ctx.chat.username ?? null : null;
    await db.set(ctx.chat.id)('username')(username ?? 'unknown');
    await db.set(ctx.chat.id)('id')(ctx.chat.id.toString());

    if (db.get(ctx.chat.id)('email') && db.get(ctx.chat.id)('email') !== '') {
      ctx.reply("Окей, вы перезапустили бота");
      await db.set(ctx.chat.id)('state')('AARoot');
    }
    else {
      ctx.reply("Приветствую вас, для доступа в закрытый телеграм канал, вам требуется оплатить подписку.\nДля этого сначала введите свой e-mail");
      await db.set(ctx.chat.id)('state')('EmailRespond');
    }

  });
}