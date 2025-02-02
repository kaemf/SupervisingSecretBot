import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";

export default async function EmailChecker(ctx: Context<Update>, emailInput: string, userEmail: string, db: any) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailRegex.test(emailInput)) {
        if (emailInput !== userEmail) {
            const users = await db.getAllKeys();
            if (users.some((user: any) => user.email === emailInput)){
                ctx.reply("Извините, но пользователь с таким e-mail уже зарегистрирован, если возникло недоразумение, пожалуйста, обратитесь в поддержку для решения этой проблемы");
                return false;
            }
            else return true;
        }
        else {
            ctx.reply("Извините, но вы должны ввести новый e-mail. Введёный вами e-mail уже используется вами");
            return false;
        }
    }
    else {
        ctx.reply("Извините, но это мало похоже на электронную почту, попрошу вас ввести еще раз");
        return false;
    }
}