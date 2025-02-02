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
Ты здесь не просто так, <i>я знаю, чего ты хочешь.</i> Хочешь увидеть мои горячие фотографии, эксклюзивные видео и всё то, что не покажут в свободном доступе? Тогда ты попал по адресу😸🔥\n
Здесь, в моём закрытом Телеграм-канале, я делюсь самым откровенным и сексуальным контентом: <u>фото, видео, кружочки и истории, от которых твоё сердце точно не останется равнодушным</u>🫶🤤🍌\n
<i>Ты готов? Тогда выбирай свой уровень доступа и погружайся в мой мир без запретов</i>😘\n
Это не просто контент — это то, что ты будешь вспоминать снова и снова🫶
<b>Ну что, встал?\n\nПоскорее вводи свой <i>e-mail</i>, чтобы присоедениться ко мне!</b>`);
      await db.set(ctx.chat.id)('state')('EmailRespond');
    }

  });
}