import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram"
import keyboards from "../keyboards";
import { Message } from "../../base/types";
import { CheckException } from "../../base/check";

export default async function AARootHandler(onTextMessage: Message, db: any, bot: Telegraf<Context<Update>>) {

    bot.command('status', async (ctx) => {
        const user_subs = await db.get(ctx.chat.id)('subs'),
            subsDate = user_subs && user_subs !== '' ? new Date(user_subs) : false;

        if (subsDate){
            ctx.reply(`Ваша подписка активна до ${subsDate.getDate()}.${subsDate.getMonth() + 1}.${subsDate.getFullYear()}`, {
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
                    keyboard: keyboards.AARoot()
                }
            });
        }
        else ctx.reply("У вас нет активной подписки, но вы можете в любой момент её приобрести воспользовавшись кнопкой 'Перейти к оплате'", {
            reply_markup: {
                one_time_keyboard: true,
                resize_keyboard: true,
                keyboard: keyboards.AARoot()
            }
        });

        await db.set(ctx.chat.id)('state')('AARoot');
    })

    onTextMessage('AARoot', async (ctx, user, set, data) => {
        switch (data.text){
            case "Изменить почту":
                ctx.reply(`Ваш актуальный адрес электронной почты - ${user.email}\n\nВведите /status для отмены либо Введите новый адрес электронной почты`);
                await set('state')('EmailChangeHandler');
                break;

            case "Перейти к оплате":
                ctx.reply("Прайс-лист:\n\n1 месяц - 35€\n6 месяцев - 50€\n12 месяцев - 150€\n\nВыберите один из вариантов", {
                    reply_markup: {
                        one_time_keyboard: true,
                        resize_keyboard: true,
                        keyboard: keyboards.tarifs()
                    }
                })
    
                await set('state')('PaymentTypeRequest');
                break;

            default: 
                ctx.reply("Извините, но вам нужно выбрать одну из кнопок ниже")
                break;
        }
    })

    onTextMessage('EmailChangeHandler', async (ctx, user, set, data) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (CheckException.TextException(data) && emailRegex.test(data.text.toLowerCase())){
                    
            await set('email')(data.text.toLowerCase());
            
            ctx.reply("Ваш адрес электронной почты успешно изменен!\nДля просмотра статуса подписки - /status");
        }
        else ctx.reply("Извините, но это мало похоже на электронную почту, попрошу вас ввести еще раз");
    })
}