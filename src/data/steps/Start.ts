import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram"
import keyboards from "../keyboards";

export default async function Start(bot: Telegraf<Context<Update>>, db: any) {
  bot.start(async (ctx) => {
    console.log('\n\nBOT STARTED (Pressed /start button)');

    const username = ctx.chat.type === "private" ? ctx.chat.username ?? null : null;
    await db.set(ctx.chat.id)('username')(username ?? 'unknown');
    await db.set(ctx.chat.id)('id')(ctx.chat.id.toString());

    if (await db.get(ctx.chat.id)('email') && await db.get(ctx.chat.id)('email') !== '') {
      const subsDate = await db.get(ctx.chat.id)('subs') && await db.get(ctx.chat.id)('subs') !== '' ? new Date(db.get(ctx.chat.id)('subs')) : false;
      ctx.reply(`Окей, вы перезапустили бота.\n\nВаша подписка ${subsDate ? `активна до ${subsDate.getDate()}.${subsDate.getMonth() + 1}.${subsDate.getFullYear()}` : "неактивна, перейдите к оплате чтобы преобрести подписку"}`, {
        reply_markup: {
          one_time_keyboard: true,
          resize_keyboard: true,
          keyboard: keyboards.AARoot()
        }
      });
      await db.set(ctx.chat.id)('state')('AARoot');
    }
    else {
      ctx.reply("Приветствую вас, для доступа в закрытый телеграм канал, вам требуется оплатить подписку.\nДля этого сначала введите свой e-mail");
      await db.set(ctx.chat.id)('state')('EmailRespond');
    }

  });
}