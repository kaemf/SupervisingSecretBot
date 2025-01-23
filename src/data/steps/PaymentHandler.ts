import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram"
import keyboards from "../keyboards";
import { Message } from "../../base/types";
import { CheckException } from "../../base/check";
import Payment from "../../base/payment";
import Subscription from "../../base/subscription";

export default async function PaymentHandler(onTextMessage: Message, db: any) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    onTextMessage('EmailRespond', async (ctx, user, set, data) => {
        if (CheckException.TextException(data) && emailRegex.test(data.text.toLowerCase())){
            
            await set('email')(data.text.toLowerCase());
            
            ctx.reply("Отлично, нажмите 'Дальше' для перехода к прайсу и последующей оплате", {
                reply_markup: {
                    one_time_keyboard: true,
                    keyboard: keyboards.next()
                }
            });

            await set('state')('PaymentRequest');
        }
        else ctx.reply("Извините, но это мало похоже на электронную почту, попрошу вас ввести еще раз");
    })

    onTextMessage('PaymentRequest', async (ctx, user, set, data) => {
        if (data.text === 'Дальше') {
            const pay = await Payment(db),
                payment = await pay.CreatePayment(ctx?.chat?.id ?? -1, user.email);
            
            await ctx.reply("Оплата", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Оплатить', web_app: { url: payment } }]
                    ]
                }
            })

            await ctx.reply("После оплаты, пожалуйста, нажмите на кнопку проверки оплаты", {
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
                    keyboard: keyboards.checkPayment()
                }
            })

            await set('state')('CheckPayment');
        }
        else ctx.reply("Упс... это немного не то что мы ожидали, нажмите пожалуйста на кнопку ниже!", {
            reply_markup: {
                one_time_keyboard: true,
                keyboard: keyboards.next()
            }
        })
    })

    onTextMessage('CheckPayment', async (ctx, user, set, data) => {
        if (data.text === 'Проверить оплату') {
            const pay = await Payment(db),
                subs = await Subscription(db),
                status = await pay.CheckPayment(user['active_payment_id']);

            switch (status){
                case "in-progress":
                    ctx.reply("Вам нужно оплатить вашу покупку перед тем как продолжить, нажмите кнопку оплатить выше", {
                        reply_markup: {
                            one_time_keyboard: true,
                            resize_keyboard: true,
                            keyboard: keyboards.checkPayment()
                        }
                    });
                    break;

                case "failed":
                    ctx.reply("Оплата не прошла либо случилась непредвиденная ошибка, обратитесь, пожалуйста, в поддержку или попробуйте позже", {
                        reply_markup: {
                            one_time_keyboard: true,
                            resize_keyboard: true,
                            keyboard: keyboards.checkPayment()
                        }
                    })
                    break;

                case "success":
                    try{
                        await ctx.deleteMessage(parseInt(user.linkMessage));
                    } catch (e){
                        console.log(`Link message deleting error: ${e}`);
                    }

                    await subs.SetSubscription(ctx?.chat?.id ?? -1, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
                    await ctx.reply("Оплата прошла успешно, спасибо вам за покупку")
                    const linkMessage = await ctx.reply("Переходите по ссылке ниже, чтобы получить доступ к закрытому каналу", {
                        
                    })
                    await set('linkMessage')(linkMessage.message_id.toString());
                    break;

                default:
                    throw new Error('Uncorrect payment status (check lava top docs)');
            }
        }
    })
}