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
          keyboard: keyboards.AARoot()
        }
      });
      await db.set(ctx.chat.id)('state')('AARoot');
    }
    else {
      await ctx.sendVideoNote({ source: './src/start/video.mp4'});
      await ctx.reply(`<b>Привет! Меня зовут Диана🧜🏻‍♀️</b>\n
Ты здесь не просто так, я знаю, чего ты хочешь. Хочешь увидеть мои горячие фотографии, эксклюзивные видео и всё то, что не покажут в свободном доступе? Тогда ты попал по адресу😸🔥\n
Здесь, в моём закрытом Телеграм-канале, я делюсь самым откровенным и сексуальным контентом: фото, видео, кружочки и истории, от которых твоё сердце точно не останется равнодушным🫶🤤🍌\n
Ты готов? Тогда выбирай свой уровень доступа и погружайся в мой мир без запретов😘\n
Это не просто контент — это то, что ты будешь вспоминать снова и снова🫶
<b>Ну что, встал? Поскорее вводи свой e-mail, чтобы присоедениться к нам!</b>`);
      await db.set(ctx.chat.id)('state')('EmailRespond');
    }

  });
}