import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram"
import keyboards from "../keyboards";
import { Message } from "../../base/types";
import priceList from "../priceList";
import EmailChecker from "../../base/emailHandler";

export default async function AARootHandler(onTextMessage: Message, db: any, bot: Telegraf<Context<Update>>) {

    bot.command('status', async (ctx) => {
        const user_subs = await db.get(ctx.chat.id)('subs'),
            subsDate: any = user_subs && user_subs !== '' ? 
            ( user_subs === 'unlimit' ? 'unlimit' : new Date(user_subs) ): 
            false;

        if (subsDate === 'unlimit') {
            ctx.reply(`Вы имеете пожизненную подписку`);
        }
        else if (subsDate instanceof Date){
            ctx.reply(`Ваша подписка активна до ${subsDate.getDate()}.${subsDate.getMonth() + 1}.${subsDate.getFullYear()}`, {
                reply_markup: {
                    keyboard: keyboards.AARoot()
                }
            });
        }
        else ctx.reply("У вас нет активной подписки, но вы можете в любой момент её приобрести воспользовавшись кнопкой 'Перейти к оплате'", {
            reply_markup: {
                keyboard: keyboards.AARoot()
            }
        });

        await db.set(ctx.chat.id)('state')('AARoot');
    })

    bot.command('sysinfo', async (ctx) => {
        ctx.reply(`Бот для контроля доступа (SuperVisingBot) в закрытый ТГК "Закрытая Зона🔞"\n\n<b>Версия:</b> 1.0\n\n<b>Разработчик:</b> Yaroslav Volkivskyi (TheLaidSon)\n\n<b>Telegram:</b> <a href="https://t.me/darksidecookis">@darksidecookis</a>\n<b>Instagram:</b> <a href="https://www.instagram.com/watthatt">watthatt</a>`)
    })

    onTextMessage('AARoot', async (ctx, user, set, data) => {
        if (user.subs !== 'unlimit'){
            switch (data.text){
                case "Изменить почту":
                    ctx.reply(`Ваш актуальный адрес электронной почты - ${user.email}\n\nВведите /status для отмены либо Введите новый адрес электронной почты`);
                    await set('state')('EmailChangeHandler');
                    break;
    
                case "Перейти к оплате":
                    ctx.reply(priceList, {
                        reply_markup: {
                            keyboard: keyboards.tarifs()
                        }
                    })
        
                    await set('state')('PaymentTypeRequest');
                    break;
    
                default: 
                    ctx.reply("Извините, но вам нужно выбрать одну из кнопок ниже")
                    break;
            }
        }
        else ctx.reply("Вы уже имеете пожизненную подспику, дальнейших действий не требуется!");
    })

    onTextMessage('EmailChangeHandler', async (ctx, user, set, data) => {
        if (await EmailChecker(ctx, data.text, user.email, db)){
            await set('email')(data.text);
            ctx.reply("Ваш адрес электронной почты успешно изменен!\nДля просмотра статуса подписки - /status");
        }
    })
}